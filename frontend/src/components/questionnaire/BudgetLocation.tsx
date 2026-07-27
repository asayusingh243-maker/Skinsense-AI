"use client";

import { useState } from "react";
import {
  FaCheckCircle,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaSpinner,
} from "react-icons/fa";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

interface EnvironmentData {
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPercent: number;
  precipitationMm: number;

  weatherCode: number | null;
  weatherCondition: string;

  uvIndex: number;

  aqi: number;
  pm25: number;
  pm10: number;
  ozone: number;

  timezone: string;
  capturedAt: string;
  dataSource: string;
}

interface BudgetLocationData {
  budget: string;
  city: string;
  country: string;
  climate: string;
  outdoorTime: string;

  /*
    Only summarized weather and air-quality information
    is saved in the questionnaire.

    Exact latitude and longitude are not stored here.
  */
  environment?: EnvironmentData | null;
}

interface BudgetLocationProps {
  formData: BudgetLocationData;

  setFormData: (
    data: Partial<BudgetLocationData>
  ) => void;

  nextStep: () => void;
  prevStep: () => void;
}

interface CardProps {
  value: string;
  selected: boolean;
  onClick: () => void;
}

function Card({
  value,
  selected,
  onClick,
}: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border-2 p-5 font-medium transition-all duration-300 ${
        selected
          ? "border-pink-500 bg-pink-50 text-pink-700 shadow-lg"
          : "border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50/40"
      }`}
    >
      {value}
    </button>
  );
}

function determineClimate(
  temperature: number,
  humidity: number
) {
  if (humidity >= 65) {
    return "Humid";
  }

  if (temperature >= 30) {
    return "Hot";
  }

  if (temperature <= 15) {
    return "Cold";
  }

  if (humidity <= 35) {
    return "Dry";
  }

  return "";
}

function getLocationErrorMessage(
  error: GeolocationPositionError
) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location permission was denied. Allow location access in your browser or enter your city manually.";
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Your current location could not be determined. Please enter your city manually.";
  }

  if (error.code === error.TIMEOUT) {
    return "Location detection took too long. Please try again.";
  }

  return "Your location could not be accessed.";
}

export default function BudgetLocation({
  formData,
  setFormData,
  nextStep,
  prevStep,
}: BudgetLocationProps) {
  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [locationSuccess, setLocationSuccess] =
    useState("");

  const updateValue = (
    key: keyof BudgetLocationData,
    value: string
  ) => {
    setFormData({
      [key]: value,
    });
  };

  const useCurrentLocation = () => {
    setLocationError("");
    setLocationSuccess("");

    if (
      !navigator.geolocation
    ) {
      setLocationError(
        "Your browser does not support location access."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          /*
            Coordinates are used only for this API request.
            They are not added to formData or localStorage.
          */
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const response = await fetch(
            `${API_URL}/api/environment`,
            {
              method: "POST",
              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                latitude,
                longitude,
              }),
            }
          );

          const data = await response.json();

          if (
            !response.ok ||
            !data.success ||
            !data.environment
          ) {
            throw new Error(
              data.message ||
                "Weather information could not be retrieved."
            );
          }

          const environment =
            data.environment as EnvironmentData;

          const detectedClimate =
            determineClimate(
              environment.temperatureC,
              environment.humidityPercent
            );

          setFormData({
            environment,

            /*
              Automatically suggest a climate category,
              but do not replace a climate already selected
              by the user.
            */
            climate:
              formData.climate ||
              detectedClimate,
          });

          setLocationSuccess(
            "Current weather and air-quality information added successfully."
          );
        } catch (error) {
          console.error(
            "Environment lookup error:",
            error
          );

          setLocationError(
            error instanceof Error
              ? error.message
              : "Weather information could not be retrieved."
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        setLocationLoading(false);

        setLocationError(
          getLocationErrorMessage(error)
        );
      },

      {
        enableHighAccuracy: false,

        /*
          A recently cached position is accurate enough
          for weather and air-quality retrieval.
        */
        maximumAge: 5 * 60 * 1000,

        timeout: 12000,
      }
    );
  };

  const handleNext = () => {
    if (!formData.budget) {
      setLocationError(
        "Please select your skincare budget before continuing."
      );
      return;
    }

    if (!formData.outdoorTime) {
      setLocationError(
        "Please select how much time you normally spend outdoors."
      );
      return;
    }

    setLocationError("");
    nextStep();
  };

  const environment =
    formData.environment;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-10">
      <div className="mb-10 text-center">
        <div className="mb-4 text-6xl">
          💰
        </div>

        <h1 className="text-3xl font-bold text-pink-600 sm:text-4xl">
          Budget &amp; Location
        </h1>

        <p className="mt-3 text-gray-500">
          Help us recommend products and a
          routine that fit your lifestyle and
          current environment.
        </p>
      </div>

      {/* Budget */}

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Monthly Skincare Budget
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            "Under ₹500",
            "₹500–₹1000",
            "₹1000–₹2000",
            "₹2000–₹5000",
            "Above ₹5000",
          ].map((item) => (
            <Card
              key={item}
              value={item}
              selected={
                formData.budget === item
              }
              onClick={() =>
                updateValue("budget", item)
              }
            />
          ))}
        </div>
      </section>

      {/* Automatic location */}

      <section className="mb-8 rounded-2xl border border-purple-200 bg-purple-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-purple-600" />

              <h2 className="text-lg font-semibold text-gray-800">
                Current Environment
              </h2>
            </div>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Use your location to retrieve
              current temperature, humidity, UV
              index and air quality.
            </p>
          </div>

          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locationLoading}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {locationLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <FaLocationArrow />
                Use My Location
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Location is optional. Your exact
          coordinates are used temporarily to
          retrieve environmental information and
          are not saved in the questionnaire.
        </p>
      </section>

      {locationError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          {locationError}
        </div>
      )}

      {locationSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
          <FaCheckCircle className="mt-1 shrink-0" />

          <span>{locationSuccess}</span>
        </div>
      )}

      {/* Environment summary */}

      {environment && (
        <section className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-blue-900">
              Current Conditions
            </h2>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
              {environment.dataSource}
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-blue-800">
            {environment.weatherCondition}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs text-gray-500">
                Temperature
              </p>

              <p className="mt-1 font-bold text-gray-800">
                {environment.temperatureC}°C
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="text-xs text-gray-500">
                Feels like
              </p>

              <p className="mt-1 font-bold text-gray-800">
                {
                  environment.apparentTemperatureC
                }
                °C
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="text-xs text-gray-500">
                Humidity
              </p>

              <p className="mt-1 font-bold text-gray-800">
                {environment.humidityPercent}%
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="text-xs text-gray-500">
                UV Index
              </p>

              <p className="mt-1 font-bold text-gray-800">
                {environment.uvIndex}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="text-xs text-gray-500">
                Air Quality Index
              </p>

              <p className="mt-1 font-bold text-gray-800">
                {environment.aqi || "Unavailable"}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="text-xs text-gray-500">
                PM2.5
              </p>

              <p className="mt-1 font-bold text-gray-800">
                {environment.pm25 || "Unavailable"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormData({
                environment: null,
              });

              setLocationSuccess("");
            }}
            className="mt-5 text-sm font-semibold text-blue-700 hover:underline"
          >
            Remove environmental data
          </button>
        </section>
      )}

      {/* Manual city */}

      <section className="mb-6">
        <label
          htmlFor="questionnaire-city"
          className="mb-2 block font-semibold text-gray-800"
        >
          City
        </label>

        <input
          id="questionnaire-city"
          name="city"
          type="text"
          autoComplete="address-level2"
          value={formData.city}
          onChange={(event) =>
            updateValue(
              "city",
              event.target.value
            )
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
          placeholder="Delhi"
        />

        <p className="mt-2 text-xs text-gray-500">
          You may enter your city manually even
          when location access is disabled.
        </p>
      </section>

      {/* Country */}

      <section className="mb-8">
        <label
          htmlFor="questionnaire-country"
          className="mb-2 block font-semibold text-gray-800"
        >
          Country
        </label>

        <input
          id="questionnaire-country"
          name="country"
          type="text"
          autoComplete="country-name"
          value={formData.country}
          onChange={(event) =>
            updateValue(
              "country",
              event.target.value
            )
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
          placeholder="India"
        />
      </section>

      {/* Climate */}

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Climate in your area
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {[
            "Hot",
            "Cold",
            "Humid",
            "Dry",
          ].map((item) => (
            <Card
              key={item}
              value={item}
              selected={
                formData.climate === item
              }
              onClick={() =>
                updateValue(
                  "climate",
                  item
                )
              }
            />
          ))}
        </div>
      </section>

      {/* Outdoor time */}

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Time spent outdoors
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            "Mostly Indoors",
            "Mixed",
            "Mostly Outdoors",
          ].map((item) => (
            <Card
              key={item}
              value={item}
              selected={
                formData.outdoorTime === item
              }
              onClick={() =>
                updateValue(
                  "outdoorTime",
                  item
                )
              }
            />
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse justify-between gap-4 sm:flex-row">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-xl border border-gray-300 px-8 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:scale-[1.02]"
        >
          Next →
        </button>
      </div>
    </div>
  );
}