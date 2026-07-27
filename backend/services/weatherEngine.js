"use strict";

/**
 * SkinSense AI Weather Engine
 *
 * Converts weather and air-quality data into skincare guidance and
 * optionally adjusts routine instructions. The engine accepts weather
 * data supplied by the controller, so it does not make network requests
 * directly.
 */

const DEFAULT_THRESHOLDS = Object.freeze({
  highUv: 6,
  veryHighUv: 8,
  lowHumidity: 35,
  highHumidity: 70,
  hotTemperatureC: 30,
  coldTemperatureC: 12,
  poorAqi: 101,
  veryPoorAqi: 201,
  highWindKph: 25,
});

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9.+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toFiniteNumber(value, fallback = null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.+-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function firstFiniteNumber(...values) {
  for (const value of values) {
    const parsed = toFiniteNumber(value);
    if (parsed !== null) return parsed;
  }

  return null;
}

function cloneRoutine(routine = {}) {
  const cloneSection = (steps) =>
    Array.isArray(steps)
      ? steps.map((step) => ({
          ...step,
          product: step?.product ? { ...step.product } : null,
        }))
      : [];

  return {
    morning: cloneSection(routine.morning),
    night: cloneSection(routine.night),
    weekly: cloneSection(routine.weekly),
  };
}

function normalizeWeatherInput(weather = {}, questionnaire = {}) {
  const current = weather.current || weather.currentWeather || {};
  const air = weather.airQuality || weather.air_quality || {};
  const environment = questionnaire.environment || {};

  return {
    location:
      weather.location ||
      weather.city ||
      questionnaire.city ||
      questionnaire.location ||
      "",
    temperatureC: firstFiniteNumber(
      weather.temperatureC,
      weather.temperature,
      current.temperature_2m,
      current.temperature,
      environment.temperatureC
    ),
    feelsLikeC: firstFiniteNumber(
      weather.feelsLikeC,
      weather.apparentTemperature,
      current.apparent_temperature,
      environment.feelsLikeC
    ),
    humidityPercent: firstFiniteNumber(
      weather.humidityPercent,
      weather.humidity,
      current.relative_humidity_2m,
      current.humidity,
      environment.humidityPercent
    ),
    uvIndex: firstFiniteNumber(
      weather.uvIndex,
      weather.uv_index,
      current.uv_index,
      environment.uvIndex
    ),
    aqi: firstFiniteNumber(
      weather.aqi,
      weather.usAqi,
      air.us_aqi,
      air.aqi,
      current.us_aqi,
      environment.aqi
    ),
    windKph: firstFiniteNumber(
      weather.windKph,
      weather.windSpeedKph,
      current.wind_speed_10m,
      current.windspeed,
      environment.windKph
    ),
    precipitationMm: firstFiniteNumber(
      weather.precipitationMm,
      weather.precipitation,
      current.precipitation,
      environment.precipitationMm
    ),
    weatherCode: firstFiniteNumber(
      weather.weatherCode,
      current.weather_code,
      current.weathercode
    ),
    isDay:
      typeof weather.isDay === "boolean"
        ? weather.isDay
        : current.is_day === 1
          ? true
          : current.is_day === 0
            ? false
            : null,
    source:
      weather.source ||
      "Provided weather data",
    observedAt:
      weather.observedAt ||
      current.time ||
      new Date().toISOString(),
  };
}

function classifyUv(uvIndex) {
  if (uvIndex === null) return "Unknown";
  if (uvIndex < 3) return "Low";
  if (uvIndex < 6) return "Moderate";
  if (uvIndex < 8) return "High";
  if (uvIndex < 11) return "Very high";
  return "Extreme";
}

function classifyHumidity(humidity) {
  if (humidity === null) return "Unknown";
  if (humidity < DEFAULT_THRESHOLDS.lowHumidity) return "Low";
  if (humidity > DEFAULT_THRESHOLDS.highHumidity) return "High";
  return "Comfortable";
}

function classifyTemperature(temperatureC) {
  if (temperatureC === null) return "Unknown";
  if (temperatureC <= DEFAULT_THRESHOLDS.coldTemperatureC) return "Cold";
  if (temperatureC >= DEFAULT_THRESHOLDS.hotTemperatureC) return "Hot";
  return "Moderate";
}

function classifyAqi(aqi) {
  if (aqi === null) return "Unknown";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

function addUnique(items, value) {
  if (value && !items.includes(value)) {
    items.push(value);
  }
}

function isCategory(step, terms) {
  const text = normalizeText(
    [
      step?.category,
      step?.name,
      step?.product?.category,
      step?.product?.name,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return terms.some((term) => text.includes(normalizeText(term)));
}

function appendInstruction(step, instruction) {
  const current = String(step?.instruction || "").trim();

  if (!current) {
    return {
      ...step,
      instruction,
    };
  }

  if (normalizeText(current).includes(normalizeText(instruction))) {
    return step;
  }

  return {
    ...step,
    instruction: `${current} ${instruction}`.trim(),
  };
}

function adjustRoutineForWeather(routine, normalizedWeather, changes) {
  const adjusted = cloneRoutine(routine);
  const {
    uvIndex,
    humidityPercent,
    temperatureC,
    aqi,
    windKph,
  } = normalizedWeather;

  if (uvIndex !== null && uvIndex >= DEFAULT_THRESHOLDS.highUv) {
    adjusted.morning = adjusted.morning.map((step) => {
      if (!isCategory(step, ["sunscreen", "spf"])) return step;

      changes.push({
        section: "morning",
        category: step.category || "Sunscreen",
        action: "Updated usage",
        reason: `UV index is ${uvIndex}, so stronger sun-protection guidance was added.`,
      });

      return appendInstruction(
        step,
        "Apply generously 15 minutes before sun exposure and reapply every 2 hours when outdoors."
      );
    });
  }

  if (
    humidityPercent !== null &&
    humidityPercent < DEFAULT_THRESHOLDS.lowHumidity
  ) {
    for (const sectionName of ["morning", "night"]) {
      adjusted[sectionName] = adjusted[sectionName].map((step) => {
        if (!isCategory(step, ["moisturizer", "moisturiser", "barrier"])) {
          return step;
        }

        changes.push({
          section: sectionName,
          category: step.category || "Moisturizer",
          action: "Updated usage",
          reason: `Humidity is ${humidityPercent}%, so extra barrier-support guidance was added.`,
        });

        return appendInstruction(
          step,
          "Apply on slightly damp skin and use a sufficient amount to reduce moisture loss."
        );
      });
    }
  }

  if (
    humidityPercent !== null &&
    humidityPercent > DEFAULT_THRESHOLDS.highHumidity
  ) {
    adjusted.morning = adjusted.morning.map((step) => {
      if (!isCategory(step, ["moisturizer", "moisturiser"])) return step;

      changes.push({
        section: "morning",
        category: step.category || "Moisturizer",
        action: "Updated usage",
        reason: `Humidity is ${humidityPercent}%, so lighter application guidance was added.`,
      });

      return appendInstruction(
        step,
        "Use a light layer and allow it to absorb before sunscreen."
      );
    });
  }

  if (
    temperatureC !== null &&
    temperatureC >= DEFAULT_THRESHOLDS.hotTemperatureC
  ) {
    adjusted.morning = adjusted.morning.map((step) => {
      if (!isCategory(step, ["cleanser"])) return step;

      return appendInstruction(
        step,
        "Cleanse gently after heavy sweating, but avoid repeatedly washing the face."
      );
    });
  }

  if (
    aqi !== null &&
    aqi >= DEFAULT_THRESHOLDS.poorAqi
  ) {
    adjusted.night = adjusted.night.map((step) => {
      if (!isCategory(step, ["cleanser"])) return step;

      changes.push({
        section: "night",
        category: step.category || "Cleanser",
        action: "Updated usage",
        reason: `AQI is ${aqi}, so evening cleansing guidance was strengthened.`,
      });

      return appendInstruction(
        step,
        "Cleanse thoroughly but gently in the evening to remove pollution, sunscreen, and surface debris."
      );
    });
  }

  if (
    windKph !== null &&
    windKph >= DEFAULT_THRESHOLDS.highWindKph
  ) {
    adjusted.morning = adjusted.morning.map((step) => {
      if (!isCategory(step, ["moisturizer", "moisturiser", "barrier"])) {
        return step;
      }

      return appendInstruction(
        step,
        "Use enough product to protect against wind-related dryness."
      );
    });
  }

  return adjusted;
}

function buildWeatherAdvice(normalizedWeather) {
  const advice = [];
  const warnings = [];
  const highlights = [];

  const {
    temperatureC,
    humidityPercent,
    uvIndex,
    aqi,
    windKph,
    precipitationMm,
  } = normalizedWeather;

  if (uvIndex !== null) {
    addUnique(highlights, `UV: ${uvIndex} (${classifyUv(uvIndex)})`);

    if (uvIndex >= DEFAULT_THRESHOLDS.veryHighUv) {
      addUnique(
        warnings,
        "Very high UV exposure can increase sunburn and pigmentation risk."
      );
      addUnique(
        advice,
        "Use broad-spectrum SPF 30 or higher, seek shade, and reapply sunscreen every 2 hours outdoors."
      );
    } else if (uvIndex >= DEFAULT_THRESHOLDS.highUv) {
      addUnique(
        advice,
        "Use broad-spectrum sunscreen and reapply during extended outdoor exposure."
      );
    } else if (uvIndex >= 3) {
      addUnique(
        advice,
        "Daily sunscreen remains important even with moderate UV."
      );
    }
  }

  if (humidityPercent !== null) {
    addUnique(
      highlights,
      `Humidity: ${humidityPercent}% (${classifyHumidity(humidityPercent)})`
    );

    if (humidityPercent < DEFAULT_THRESHOLDS.lowHumidity) {
      addUnique(
        advice,
        "Use a barrier-supporting moisturizer and avoid overly hot water because the air is dry."
      );
    }

    if (humidityPercent > DEFAULT_THRESHOLDS.highHumidity) {
      addUnique(
        advice,
        "Prefer lightweight, non-greasy layers and avoid unnecessarily heavy products."
      );
    }
  }

  if (temperatureC !== null) {
    addUnique(
      highlights,
      `Temperature: ${temperatureC}°C (${classifyTemperature(temperatureC)})`
    );

    if (temperatureC >= DEFAULT_THRESHOLDS.hotTemperatureC) {
      addUnique(
        advice,
        "After heavy sweating, rinse or cleanse gently and avoid scrubbing the skin."
      );
    }

    if (temperatureC <= DEFAULT_THRESHOLDS.coldTemperatureC) {
      addUnique(
        advice,
        "Cold weather may increase dryness, so use a richer moisturizer when needed."
      );
    }
  }

  if (aqi !== null) {
    addUnique(highlights, `AQI: ${aqi} (${classifyAqi(aqi)})`);

    if (aqi >= DEFAULT_THRESHOLDS.veryPoorAqi) {
      addUnique(
        warnings,
        "Air quality is very poor and may aggravate sensitive or irritated skin."
      );
    }

    if (aqi >= DEFAULT_THRESHOLDS.poorAqi) {
      addUnique(
        advice,
        "Cleanse gently after returning indoors and avoid harsh exfoliation on pollution-heavy days."
      );
    }
  }

  if (windKph !== null && windKph >= DEFAULT_THRESHOLDS.highWindKph) {
    addUnique(
      advice,
      "Wind can increase moisture loss, so protect exposed skin with moisturizer and sunscreen."
    );
  }

  if (precipitationMm !== null && precipitationMm > 0) {
    addUnique(
      advice,
      "Rain and cloud cover do not eliminate UV exposure, so keep sunscreen in the morning routine."
    );
  }

  if (advice.length === 0) {
    advice.push(
      "Continue a gentle routine with cleanser, moisturizer, and daily sunscreen."
    );
  }

  return {
    advice,
    warnings,
    highlights,
  };
}

function createWeatherSummary(normalizedWeather) {
  const parts = [];

  if (normalizedWeather.temperatureC !== null) {
    parts.push(`${normalizedWeather.temperatureC}°C`);
  }

  if (normalizedWeather.humidityPercent !== null) {
    parts.push(`${normalizedWeather.humidityPercent}% humidity`);
  }

  if (normalizedWeather.uvIndex !== null) {
    parts.push(`UV ${normalizedWeather.uvIndex}`);
  }

  if (normalizedWeather.aqi !== null) {
    parts.push(`AQI ${normalizedWeather.aqi}`);
  }

  return parts.length
    ? parts.join(", ")
    : "Weather data unavailable";
}

function applyWeatherGuidance(
  inputRoutine,
  weather = {},
  questionnaire = {}
) {
  const normalizedWeather = normalizeWeatherInput(weather, questionnaire);
  const changes = [];
  const guidance = buildWeatherAdvice(normalizedWeather);
  const routine = adjustRoutineForWeather(
    inputRoutine,
    normalizedWeather,
    changes
  );

  const hasWeatherData = [
    normalizedWeather.temperatureC,
    normalizedWeather.humidityPercent,
    normalizedWeather.uvIndex,
    normalizedWeather.aqi,
    normalizedWeather.windKph,
    normalizedWeather.precipitationMm,
  ].some((value) => value !== null);

  return {
    routine,
    weather: {
      available: hasWeatherData,
      location: normalizedWeather.location,
      summary: createWeatherSummary(normalizedWeather),
      conditions: {
        temperatureC: normalizedWeather.temperatureC,
        feelsLikeC: normalizedWeather.feelsLikeC,
        temperatureLevel: classifyTemperature(
          normalizedWeather.temperatureC
        ),
        humidityPercent: normalizedWeather.humidityPercent,
        humidityLevel: classifyHumidity(
          normalizedWeather.humidityPercent
        ),
        uvIndex: normalizedWeather.uvIndex,
        uvLevel: classifyUv(normalizedWeather.uvIndex),
        aqi: normalizedWeather.aqi,
        aqiLevel: classifyAqi(normalizedWeather.aqi),
        windKph: normalizedWeather.windKph,
        precipitationMm: normalizedWeather.precipitationMm,
        weatherCode: normalizedWeather.weatherCode,
        isDay: normalizedWeather.isDay,
      },
      advice: guidance.advice,
      warnings: guidance.warnings,
      highlights: guidance.highlights,
      routineChanges: changes,
      source: normalizedWeather.source,
      observedAt: normalizedWeather.observedAt,
      disclaimer:
        "Weather guidance is supportive skincare advice and does not replace medical care.",
    },
  };
}

module.exports = {
  applyWeatherGuidance,
  normalizeWeatherInput,
  classifyUv,
  classifyHumidity,
  classifyTemperature,
  classifyAqi,
};
