"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCloudSun,
  FaExclamationTriangle,
  FaLightbulb,
  FaMoon,
  FaShoppingBag,
  FaSun,
  FaWallet,
} from "react-icons/fa";

type RoutineStep = {
  order: number;
  category: string;
  instruction: string;
  completed: boolean;
};

type Product = {
  id?: string;
  brand?: string;
  name?: string;
  category?: string;
  size?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  seller?: string;
  buyUrl?: string;
  imageUrl?: string;
  reason?: string;
  usage?: string;
  warnings?: string[];
  keyIngredients?: string[];
};

type LatestAnalysis = {
  scan: {
    id: string;
    date: string;
    photo: string | null;
    skinScore: number | null;
    progress: {
      previousSkinScore: number | null;
      scoreChange: number | null;
      direction:
        | "improved"
        | "declined"
        | "stable"
        | "first-scan";
    };
  };

  skin: {
    type: string;
    tone: string;
    undertone: string;
    hydration: string;
    oiliness: string;
    sensitivity: string;
    concerns: {
      name?: string;
      severity?: string;
      score?: number | null;
    }[];
  };

  routine: {
    morning: RoutineStep[];
    night: RoutineStep[];
    weekly: RoutineStep[];
  };

  products: Product[];

  budget: {
    detectedBudget: number | null;
    routineTotal: number;
    status: string;
  };

  weather: {
    available?: boolean;
    location?: string;
    summary?: string;
    advice?: string[];
  };

  safety: {
    status?: string;
    changes?: string[];
    warnings?: string[];
    precautions?: string[];
  };

  insights: string[];
};

type ApiResponse = {
  success: boolean;
  data?: LatestAnalysis;
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

function buildImageUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `${API_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(value?: number | null) {
  if (!value || value <= 0) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function RoutineSection({
  title,
  icon,
  steps,
  emptyMessage,
}: {
  title: string;
  icon: React.ReactNode;
  steps: RoutineStep[];
  emptyMessage: string;
}) {
  return (
    <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-pink-50 p-3 text-pink-600">
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {title}
          </h2>

          <p className="text-sm text-gray-500">
            Follow the order shown below.
          </p>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {steps.map((step) => (
            <div
              key={`${step.order}-${step.category}`}
              className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-600 font-bold text-white">
                {step.order}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {step.category}
                </h3>

                <p className="mt-1 text-gray-600">
                  {step.instruction ||
                    "Use as recommended in your personalized routine."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function RoutinePage() {
  const [analysis, setAnalysis] =
    useState<LatestAnalysis | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadLatestAnalysis = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/analysis/latest`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result: ApiResponse =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load your latest routine."
          );
        }

        if (!result.data) {
          throw new Error(
            "The latest analysis response was empty."
          );
        }

        setAnalysis(result.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your latest routine."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLatestAnalysis();
  }, []);

  const productsWithImages = useMemo(() => {
    return (
      analysis?.products.map((product) => ({
        ...product,
        resolvedImageUrl:
          buildImageUrl(product.imageUrl),
      })) || []
    );
  }, [analysis]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />

            <p className="mt-4 text-gray-600">
              Loading your personalized routine...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !analysis) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <FaExclamationTriangle className="mx-auto text-5xl text-red-500" />

          <h1 className="mt-5 text-3xl font-bold text-gray-800">
            Routine could not be loaded
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
            >
              Try Again
            </button>

            <Link
              href="/analyze"
              className="rounded-xl border border-pink-300 px-6 py-3 font-semibold text-pink-600 transition hover:bg-pink-50"
            >
              Start New Analysis
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { scan, skin, routine, budget, weather, safety, insights } =
    analysis;

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-semibold text-pink-600 transition hover:text-pink-700"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
                Your latest routine
              </p>

              <h1 className="mt-3 text-4xl font-bold text-gray-900 sm:text-5xl">
                Personalized Skincare Plan
              </h1>

              <p className="mt-4 max-w-3xl text-lg text-gray-600">
                This routine is based on your latest
                visual assessment, questionnaire answers,
                safety checks, budget, and weather
                conditions.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-full bg-pink-50 px-4 py-2 font-semibold text-pink-700">
                  Skin type: {skin.type}
                </span>

                <span className="rounded-full bg-purple-50 px-4 py-2 font-semibold text-purple-700">
                  Score: {scan.skinScore ?? "N/A"}/100
                </span>

                <span className="rounded-full bg-blue-50 px-4 py-2 font-semibold text-blue-700">
                  Last updated: {formatDate(scan.date)}
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-pink-100 to-purple-100 p-6">
              <h2 className="text-xl font-bold text-gray-800">
                Routine Budget
              </h2>

              <p className="mt-5 text-sm text-gray-600">
                Estimated routine total
              </p>

              <p className="mt-1 text-4xl font-bold text-pink-600">
                {formatCurrency(
                  budget.routineTotal
                )}
              </p>

              <p className="mt-5 text-sm text-gray-600">
                Your selected budget
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {formatCurrency(
                  budget.detectedBudget
                )}
              </p>

              <p className="mt-4 rounded-xl bg-white/70 p-3 font-semibold text-gray-700">
                {budget.status ||
                  "Budget status not available"}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <RoutineSection
            title="Morning Routine"
            icon={<FaSun className="text-2xl" />}
            steps={routine.morning}
            emptyMessage="No morning routine was saved for this analysis."
          />

          <RoutineSection
            title="Night Routine"
            icon={<FaMoon className="text-2xl" />}
            steps={routine.night}
            emptyMessage="No night routine was saved for this analysis."
          />
        </div>

        <div className="mt-8">
          <RoutineSection
            title="Weekly Treatments"
            icon={
              <FaCheckCircle className="text-2xl" />
            }
            steps={routine.weekly}
            emptyMessage="No weekly treatment is currently required. Keep following your morning and night routine."
          />
        </div>

        <section className="mt-8 rounded-3xl border border-green-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-green-50 p-3 text-green-600">
              <FaShoppingBag className="text-2xl" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Recommended Products
              </h2>

              <p className="text-sm text-gray-500">
                Products selected for your latest routine.
              </p>
            </div>
          </div>

          {productsWithImages.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-gray-500">
              No products were saved for this analysis.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {productsWithImages.map(
                (product, index) => (
                  <article
                    key={
                      product.id ||
                      `${product.name}-${index}`
                    }
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="flex h-52 items-center justify-center bg-gray-50 p-4">
                      {product.resolvedImageUrl ? (
                        <img
                          src={
                            product.resolvedImageUrl
                          }
                          alt={
                            product.name ||
                            "Recommended product"
                          }
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <FaShoppingBag className="mx-auto text-4xl" />
                          <p className="mt-2 text-sm">
                            Image unavailable
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-sm font-semibold uppercase tracking-wide text-pink-600">
                        {product.category ||
                          "Skincare"}
                      </p>

                      <h3 className="mt-2 text-lg font-bold text-gray-800">
                        {product.brand
                          ? `${product.brand} `
                          : ""}
                        {product.name ||
                          "Recommended product"}
                      </h3>

                      {product.reason && (
                        <p className="mt-3 text-sm text-gray-600">
                          {product.reason}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(
                            product.price
                          )}
                        </span>

                        {product.buyUrl ? (
                          <a
                            href={product.buyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                          >
                            View Product
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Link unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <FaCloudSun className="text-2xl" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Weather Guidance
              </h2>
            </div>

            <p className="mt-5 font-semibold text-gray-800">
              {weather.summary ||
                "Weather guidance is unavailable."}
            </p>

            {weather.location && (
              <p className="mt-1 text-sm text-gray-500">
                Location: {weather.location}
              </p>
            )}

            <div className="mt-5 space-y-3">
              {(weather.advice || []).map(
                (item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex gap-3 rounded-xl bg-blue-50 p-4 text-gray-700"
                  >
                    <FaCheckCircle className="mt-1 shrink-0 text-blue-600" />
                    <p>{item}</p>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-yellow-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-yellow-50 p-3 text-yellow-600">
                <FaExclamationTriangle className="text-2xl" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Safety Notes
              </h2>
            </div>

            <p className="mt-5 font-semibold text-gray-800">
              Status: {safety.status || "Not available"}
            </p>

            <div className="mt-5 space-y-3">
              {[
                ...(safety.warnings || []),
                ...(safety.precautions || []),
              ].map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex gap-3 rounded-xl bg-yellow-50 p-4 text-gray-700"
                >
                  <FaExclamationTriangle className="mt-1 shrink-0 text-yellow-600" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
              <FaLightbulb className="text-2xl" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              AI Insights
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {insights.map((insight, index) => (
              <div
                key={`${insight}-${index}`}
                className="rounded-2xl bg-purple-50 p-5 text-gray-700"
              >
                {insight}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl border border-pink-300 px-6 py-3 font-semibold text-pink-600 transition hover:bg-pink-50"
          >
            Back to Dashboard
          </Link>

          <Link
            href="/analyze"
            className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
          >
            Start New Analysis
          </Link>
        </div>
      </div>
    </main>
  );
}