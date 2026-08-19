"use client";

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
  id: string;
  date: string;
  skinScore: number | null;
};

type SkinScoreTrendProps = {
  history: HistoryItem[];
};

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  );
}

function formatFullDate(value: string) {
  return new Date(value).toLocaleString(
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

export default function SkinScoreTrend({
  history,
}: SkinScoreTrendProps) {
  const chartData = history
    .filter(
      (item) =>
        typeof item.skinScore === "number"
    )
    .map((item, index) => ({
      id: item.id,
      date: item.date,
      scanNumber: index + 1,
      label: formatShortDate(item.date),
      score: item.skinScore,
    }));

  if (chartData.length < 2) {
    return (
      <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
          Historical Progress
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Skin Score Trend
        </h2>

        <p className="mt-4 text-gray-500">
          Complete at least two analyses to see
          your skin score trend.
        </p>
      </section>
    );
  }

  const firstScore =
    chartData[0].score ?? 0;

  const latestScore =
    chartData[
      chartData.length - 1
    ].score ?? 0;

  const overallChange =
    latestScore - firstScore;

  return (
    <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm md:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
          Historical Progress
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Skin Score Trend
        </h2>

        <p className="mt-3 text-gray-600">
          Track how your overall skin score has
          changed across your saved analyses.
        </p>
      </div>

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
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />

            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              width={40}
            />

            <Tooltip
              formatter={(value) => [
                `${value}/100`,
                "Skin Score",
              ]}
              labelFormatter={(
                _label,
                payload
              ) => {
                const item =
                  payload?.[0]?.payload;

                return item?.date
                  ? formatFullDate(
                      item.date
                    )
                  : "";
              }}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#db2777"
              strokeWidth={3}
              dot={{
                r: 5,
                fill: "#db2777",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
              }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            First Score
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {firstScore}/100
          </p>
        </div>

        <div className="rounded-2xl bg-pink-50 p-4">
          <p className="text-sm text-pink-600">
            Latest Score
          </p>

          <p className="mt-1 text-2xl font-bold text-pink-600">
            {latestScore}/100
          </p>
        </div>

        <div className="rounded-2xl bg-purple-50 p-4">
          <p className="text-sm text-purple-600">
            Total Analyses
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {chartData.length}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-sm text-blue-600">
            Overall Change
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {overallChange > 0
              ? `+${overallChange}`
              : overallChange}
          </p>
        </div>
      </div>
    </section>
  );
}