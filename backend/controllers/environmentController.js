const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";

const AIR_QUALITY_API =
  "https://air-quality-api.open-meteo.com/v1/air-quality";

const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function isValidCoordinate(value, minimum, maximum) {
  const number = Number(value);

  return (
    Number.isFinite(number) &&
    number >= minimum &&
    number <= maximum
  );
}

async function fetchJson(url) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 12000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Environmental API returned status ${response.status}.`
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

exports.getEnvironment = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (
      !isValidCoordinate(latitude, -90, 90) ||
      !isValidCoordinate(longitude, -180, 180)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid latitude and longitude are required.",
      });
    }

    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);

    const weatherParams = new URLSearchParams({
      latitude: String(latitudeNumber),
      longitude: String(longitudeNumber),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
      ].join(","),
      daily: "uv_index_max",
      forecast_days: "1",
      timezone: "auto",
    });

    const airQualityParams = new URLSearchParams({
      latitude: String(latitudeNumber),
      longitude: String(longitudeNumber),
      current: [
        "us_aqi",
        "pm2_5",
        "pm10",
        "ozone",
        "uv_index",
      ].join(","),
      timezone: "auto",
    });

    const [weatherData, airQualityData] =
      await Promise.all([
        fetchJson(
          `${WEATHER_API}?${weatherParams.toString()}`
        ),
        fetchJson(
          `${AIR_QUALITY_API}?${airQualityParams.toString()}`
        ),
      ]);

    const weather = weatherData.current || {};
    const airQuality = airQualityData.current || {};

    const weatherCode = Number(
      weather.weather_code
    );

    const currentUv = Number(
      airQuality.uv_index
    );

    const dailyUv = Number(
      weatherData.daily?.uv_index_max?.[0]
    );

    const environment = {
      temperatureC:
        Number(weather.temperature_2m) || 0,

      apparentTemperatureC:
        Number(weather.apparent_temperature) || 0,

      humidityPercent:
        Number(weather.relative_humidity_2m) || 0,

      precipitationMm:
        Number(weather.precipitation) || 0,

      weatherCode:
        Number.isFinite(weatherCode)
          ? weatherCode
          : null,

      weatherCondition:
        weatherDescriptions[weatherCode] ||
        "Weather condition unavailable",

      uvIndex:
        Number.isFinite(currentUv)
          ? currentUv
          : Number.isFinite(dailyUv)
            ? dailyUv
            : 0,

      aqi:
        Number(airQuality.us_aqi) || 0,

      pm25:
        Number(airQuality.pm2_5) || 0,

      pm10:
        Number(airQuality.pm10) || 0,

      ozone:
        Number(airQuality.ozone) || 0,

      timezone:
        weatherData.timezone || "",

      capturedAt:
        weather.time ||
        airQuality.time ||
        new Date().toISOString(),

      dataSource: "Open-Meteo",
    };

    return res.status(200).json({
      success: true,
      environment,
    });
  } catch (error) {
    console.error(
      "Environment lookup error:",
      error
    );

    return res.status(503).json({
      success: false,
      message:
        error?.name === "AbortError"
          ? "Weather service took too long to respond."
          : "Current weather and air-quality data could not be retrieved.",
    });
  }
};