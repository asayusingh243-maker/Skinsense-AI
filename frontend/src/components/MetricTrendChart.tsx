"use client";

import { useMemo, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HistoryItem = {
  id?: string;
  date: string;
  skinScore: number | null;
  hydration: string;
  oiliness: string;
  sensitivity: string;
  acne: string;
  pigmentation: string;
  pores: string;
};

type Props = {
  history: HistoryItem[];
};

type MetricKey =
  | "skinScore"
  | "hydration"
  | "oiliness"
  | "sensitivity"
  | "acne"
  | "pigmentation"
  | "pores";

const metrics: {
  key: MetricKey;
  label: string;
}[] = [
  { key: "skinScore", label: "Skin Score" },
  { key: "hydration", label: "Hydration" },
  { key: "oiliness", label: "Oiliness" },
  { key: "sensitivity", label: "Sensitivity" },
  { key: "acne", label: "Acne" },
  { key: "pigmentation", label: "Pigmentation" },
  { key: "pores", label: "Pores" },
];

function normalizeMetricText(
  value: string | number | null
) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function convertMetricValue(
  metric: MetricKey,
  value: string | number | null
) {
  if (metric === "skinScore") {
    const numberValue = Number(value);

    return Number.isFinite(numberValue)
      ? numberValue
      : null;
  }

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const normalized =
    normalizeMetricText(value);

  /*
   * Most serious / highest level first,
   * because "very high" also contains "high".
   */
  if (
    normalized.includes("severe") ||
    normalized.includes("very high") ||
    normalized.includes("very oily") ||
    normalized.includes("very dry")
  ) {
    return 4;
  }

  if (
    normalized.includes("high") ||
    normalized.includes("oily") ||
    normalized.includes("dehydrated")
  ) {
    return 3;
  }

  if (
    normalized.includes("moderate") ||
    normalized.includes("medium") ||
    normalized.includes("balanced") ||
    normalized.includes("normal") ||
    normalized.includes("combination")
  ) {
    return 2;
  }

  if (
    normalized.includes("mild") ||
    normalized.includes("low") ||
    normalized.includes("slight") ||
    normalized.includes("minor")
  ) {
    return 1;
  }

  if (
    normalized.includes("none") ||
    normalized.includes("clear") ||
    normalized.includes("no acne") ||
    normalized.includes("not visible")
  ) {
    return 0;
  }

  return null;
}



function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function MetricTrendChart({
  history,
}: Props) {
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>("skinScore");

  const selectedMetricInfo =
    metrics.find(
      (metric) => metric.key === selectedMetric
    ) ?? metrics[0];

  const chartData = useMemo(() => {
    return history
      .map((item) => ({
        date: formatDate(item.date),

        value: convertMetricValue(
          selectedMetric,
          item[selectedMetric]
        ),

        originalValue: item[selectedMetric],
      }))
      .filter((item) => item.value !== null);
  }, [history, selectedMetric]);

  const isSkinScore =
    selectedMetric === "skinScore";

  return (
    <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-600">
            Metric Trends
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Track changes over time
          </h2>

          <p className="mt-2 text-gray-500">
            Compare your skin metrics across previous
            analyses.
          </p>
        </div>

        <select
          value={selectedMetric}
          onChange={(event) =>
            setSelectedMetric(
              event.target.value as MetricKey
            )
          }
          className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 font-semibold text-gray-700 outline-none transition focus:border-purple-500"
        >
          {metrics.map((metric) => (
            <option
              key={metric.key}
              value={metric.key}
            >
              {metric.label}
            </option>
          ))}
        </select>
      </div>

      {chartData.length > 0 ? (
        <div className="mt-8 h-[360px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                domain={
                  isSkinScore
                    ? [0, 100]
                    : [0, 4]
                }
                ticks={
                  isSkinScore
                    ? [0, 20, 40, 60, 80, 100]
                    : [0, 1, 2, 3, 4]
                }
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                formatter={(
                  value,
                  _name,
                  item
                ) => {
                  if (isSkinScore) {
                    return [
                      `${value}/100`,
                      selectedMetricInfo.label,
                    ];
                  }

                  return [
                    String(
                      item.payload.originalValue
                    ),
                    selectedMetricInfo.label,
                  ];
                }}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#e60076"
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: "#ffffff",
                  strokeWidth: 3,
                }}
                activeDot={{
                  r: 7,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-gray-50 px-6 py-12 text-center">
          <p className="font-semibold text-gray-700">
            No trend data available
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Complete more skin analyses to track this
            metric over time.
          </p>
        </div>
      )}

      {!isSkinScore && (
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-500">
          <span className="rounded-lg bg-gray-50 px-3 py-2">
            0 — None
          </span>

          <span className="rounded-lg bg-gray-50 px-3 py-2">
            1 — Low / Mild
          </span>

          <span className="rounded-lg bg-gray-50 px-3 py-2">
            2 — Moderate / Balanced
          </span>

          <span className="rounded-lg bg-gray-50 px-3 py-2">
            3 — High
          </span>

          <span className="rounded-lg bg-gray-50 px-3 py-2">
            4 — Severe
          </span>
        </div>
      )}
    </section>
  );
}