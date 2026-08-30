"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  FaArrowLeft,
  FaArrowDown,
  FaArrowUp,
  FaEquals,
  FaChartLine,
} from "react-icons/fa";

import SkinScoreTrend from "@/components/SkinScoreTrend";
import MetricTrendChart from "@/components/MetricTrendChart";

type MetricChange = {
  previous: string;
  current: string;
  change:
    | "improved"
    | "declined"
    | "stable"
    | "unknown";
};

type HistoryItem = {
  id: string;
  date: string;
  skinScore: number | null;
  skinType: string;
  hydration: string;
  oiliness: string;
  sensitivity: string;
  acne: string;
  pigmentation: string;
  pores: string;
  image: string | null;
};

type ProgressData = {
  status:
    | "comparison-ready"
    | "first-scan"
    | "no-scans";

  latest: {
    id: string;
    date: string;
    skinScore: number | null;
  } | null;

  previous: {
    id: string;
    date: string;
    skinScore: number | null;
  } | null;

  overall: {
    previousScore: number | null;
    currentScore: number | null;
    change: number | null;
    status:
      | "improved"
      | "declined"
      | "stable"
      | "first-scan";
  } | null;

  metrics: Record<string, MetricChange>;

  summary: string;
};

type ProgressApiResponse = {
  success: boolean;
  data?: ProgressData;
  message?: string;
};

type HistoryApiResponse = {
  success: boolean;
  count?: number;
  data?: HistoryItem[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

function formatLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(
  date?: string | null
) {
  if (!date) {
    return "Not available";
  }

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function getChangeIcon(
  change: MetricChange["change"]
) {
  if (change === "improved") {
    return (
      <FaArrowUp className="text-green-600" />
    );
  }

  if (change === "declined") {
    return (
      <FaArrowDown className="text-red-500" />
    );
  }

  return (
    <FaEquals className="text-gray-500" />
  );
}

function getChangeText(
  change: MetricChange["change"]
) {
  if (change === "improved") {
    return "Improved";
  }

  if (change === "declined") {
    return "Needs Attention";
  }

  if (change === "stable") {
    return "Stable";
  }

  return "Not enough data";
}

function getChangeClass(
  change: MetricChange["change"]
) {
  if (change === "improved") {
    return "bg-green-50 text-green-700";
  }

  if (change === "declined") {
    return "bg-red-50 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
}

export default function ProgressPage() {
  const [progress, setProgress] =
    useState<ProgressData | null>(
      null
    );

  const [history, setHistory] =
    useState<HistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * ----------------------------------
         * Load latest comparison
         * ----------------------------------
         */

        const response = await fetch(
          `${API_URL}/api/progress/latest`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result:
          ProgressApiResponse =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to load progress."
          );
        }

        if (!result.data) {
          throw new Error(
            "Progress response was empty."
          );
        }

        setProgress(result.data);

        /*
         * ----------------------------------
         * Load complete history
         * ----------------------------------
         */

        const historyResponse =
          await fetch(
            `${API_URL}/api/progress/history`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        const historyResult:
          HistoryApiResponse =
          await historyResponse.json();

        if (
          !historyResponse.ok ||
          !historyResult.success
        ) {
          throw new Error(
            historyResult.message ||
              "Unable to load progress history."
          );
        }

        if (
          Array.isArray(
            historyResult.data
          )
        ) {
          setHistory(
            historyResult.data
          );
        }
      } catch (error) {
        console.error(
          "Progress page error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load progress."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  /*
   * ----------------------------------
   * Loading
   * ----------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />

            <p className="mt-4 text-gray-600">
              Loading your skin journey...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------
   * Error
   * ----------------------------------
   */

  if (error || !progress) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800">
            Progress could not be loaded
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------
   * First scan / no scan state
   * ----------------------------------
   */

  if (
    progress.status === "no-scans" ||
    progress.status === "first-scan"
  ) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-semibold text-pink-600"
          >
            <FaArrowLeft />

            Back to Dashboard
          </Link>

          <div className="mt-8 rounded-3xl border border-pink-100 bg-white p-10 text-center shadow-sm">
            <FaChartLine className="mx-auto text-5xl text-pink-600" />

            <h1 className="mt-5 text-3xl font-bold text-gray-900">
              Progress Tracking
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-gray-600">
              {progress.summary}
            </p>

            <Link
              href="/analyze"
              className="mt-7 inline-block rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
            >
              Start New Analysis
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const {
    latest,
    previous,
    overall,
    metrics,
  } = progress;

  const overallChange =
    overall?.change ?? 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back button */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-semibold text-pink-600 transition hover:text-pink-700"
        >
          <FaArrowLeft />

          Back to Dashboard
        </Link>

        {/* ==================================
            MAIN PROGRESS SUMMARY
        ================================== */}

        <section className="mt-6 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
            Skin Journey
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900 sm:text-5xl">
            Your Progress
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Compare your latest analysis
            with your previous scan and
            track how your skin condition
            is changing over time.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {/* Previous Score */}

            <div className="rounded-2xl bg-gray-50 p-6">
              <p className="text-sm font-semibold text-gray-500">
                Previous Score
              </p>

              <p className="mt-2 text-4xl font-bold text-gray-800">
                {overall?.previousScore ??
                  "N/A"}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {formatDate(
                  previous?.date
                )}
              </p>
            </div>

            {/* Current Score */}

            <div className="rounded-2xl bg-pink-50 p-6">
              <p className="text-sm font-semibold text-pink-600">
                Current Score
              </p>

              <p className="mt-2 text-4xl font-bold text-pink-600">
                {overall?.currentScore ??
                  "N/A"}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {formatDate(
                  latest?.date
                )}
              </p>
            </div>

            {/* Score Change */}

            <div
              className={`rounded-2xl p-6 ${
                overall?.status ===
                "improved"
                  ? "bg-green-50"
                  : overall?.status ===
                      "declined"
                    ? "bg-red-50"
                    : "bg-gray-50"
              }`}
            >
              <p className="text-sm font-semibold text-gray-500">
                Change
              </p>

              <div className="mt-2 flex items-center gap-3">
                {overall?.status ===
                  "improved" && (
                  <FaArrowUp className="text-3xl text-green-600" />
                )}

                {overall?.status ===
                  "declined" && (
                  <FaArrowDown className="text-3xl text-red-500" />
                )}

                {overall?.status ===
                  "stable" && (
                  <FaEquals className="text-3xl text-gray-500" />
                )}

                <p className="text-4xl font-bold text-gray-800">
                  {overallChange > 0
                    ? `+${overallChange}`
                    : overallChange}
                </p>
              </div>

              <p className="mt-2 font-semibold capitalize text-gray-700">
                {overall?.status}
              </p>
            </div>
          </div>

          {/* AI Summary */}

          <div className="mt-7 rounded-2xl bg-purple-50 p-5">
            <p className="font-semibold text-purple-800">
              AI Progress Summary
            </p>

            <p className="mt-2 text-gray-700">
              {progress.summary}
            </p>
          </div>
        </section>

        {/* ==================================
            SKIN SCORE TREND
        ================================== */}

        <div className="mt-8">
          <SkinScoreTrend
            history={history}
          />
        </div>

        {/* ==================================
            ALL METRIC TRENDS
        ================================== */}

        <div className="mt-8">
          <MetricTrendChart
            history={history}
          />
        </div>

        {/* ==================================
            LATEST METRIC COMPARISON
        ================================== */}

        <section className="mt-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
              Metric Comparison
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              What changed?
            </h2>

            <p className="mt-2 text-gray-500">
              Compare your latest analysis
              with the previous one.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(
              metrics
            ).map(
              ([name, metric]) => (
                <article
                  key={name}
                  className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {formatLabel(
                        name
                      )}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getChangeClass(
                        metric.change
                      )}`}
                    >
                      {getChangeText(
                        metric.change
                      )}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    {/* Previous */}

                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Previous
                      </p>

                      <p className="mt-1 font-bold capitalize text-gray-800">
                        {
                          metric.previous
                        }
                      </p>
                    </div>

                    {/* Arrow */}

                    <div className="flex justify-center">
                      {getChangeIcon(
                        metric.change
                      )}
                    </div>

                    {/* Current */}

                    <div className="rounded-2xl bg-pink-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">
                        Current
                      </p>

                      <p className="mt-1 font-bold capitalize text-gray-800">
                        {
                          metric.current
                        }
                      </p>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        {/* ==================================
            NAVIGATION
        ================================== */}

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