"use client";

import Link from "next/link";
import {
  FaArrowDown,
  FaArrowUp,
  FaCamera,
  FaChartLine,
  FaClock,
  FaLeaf,
} from "react-icons/fa";

type DashboardHeroProps = {
  user: {
    name?: string;
  };

  hero: {
    skinScore: number;
    skinType?: string;
    lastScan: string | null;
    change: number;
    direction:
      | "improved"
      | "declined"
      | "stable"
      | "first-scan";
  };
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function formatLastScan(date: string | null) {
  if (!date) {
    return "No scan completed yet";
  }

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getProgressMessage(
  direction: DashboardHeroProps["hero"]["direction"],
  change: number
) {
  if (direction === "improved") {
    return `Your skin score improved by ${Math.abs(
      change
    )} points since the previous scan.`;
  }

  if (direction === "declined") {
    return `Your skin score decreased by ${Math.abs(
      change
    )} points. Review your latest routine and weather guidance.`;
  }

  if (direction === "first-scan") {
    return "Your first SkinSense assessment is ready.";
  }

  return "Your skin score is currently stable.";
}

export default function DashboardHero({
  hero,
  user,
}: DashboardHeroProps) {
  const score = Math.min(
    100,
    Math.max(0, Number(hero.skinScore) || 0)
  );

  const progressDegrees = score * 3.6;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-pink-100 bg-white shadow-xl shadow-pink-100/50">
      <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700">
            <FaLeaf />
            Latest skin summary
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {getGreeting()}, {user.name || "there"} 👋
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            {getProgressMessage(
              hero.direction,
              hero.change
            )}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-purple-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                Skin type
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                {hero.skinType || "Not available"}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-4">
              <div className="flex items-center gap-2 text-blue-600">
                <FaClock />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Last scan
                </p>
              </div>

              <p className="mt-1 text-sm font-bold text-gray-900">
                {formatLastScan(hero.lastScan)}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 px-5 py-4">
              <div className="flex items-center gap-2 text-green-600">
                <FaChartLine />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Progress
                </p>
              </div>

              <div className="mt-1 flex items-center gap-2 font-bold text-gray-900">
                {hero.direction === "improved" && (
                  <FaArrowUp className="text-green-600" />
                )}

                {hero.direction === "declined" && (
                  <FaArrowDown className="text-red-500" />
                )}

                <span>
                  {hero.direction === "improved"
                    ? `+${Math.abs(hero.change)} points`
                    : hero.direction === "declined"
                      ? `-${Math.abs(hero.change)} points`
                      : hero.direction === "first-scan"
                        ? "First scan"
                        : "Stable"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
            >
              <FaCamera />
              Analyze Again
            </Link>

            <Link
              href="/routine"
              className="inline-flex items-center gap-2 rounded-xl border border-pink-300 bg-white px-6 py-3 font-semibold text-pink-700 transition hover:bg-pink-50"
            >
              View Routine
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div
            className="relative flex h-64 w-64 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(
                #db2777 ${progressDegrees}deg,
                #fce7f3 ${progressDegrees}deg
              )`,
            }}
          >
            <div className="flex h-52 w-52 flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Skin score
              </p>

              <div className="mt-2 flex items-end gap-1">
                <span className="text-6xl font-bold text-pink-600">
                  {score}
                </span>

                <span className="mb-2 text-lg text-gray-400">
                  /100
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-gray-600">
                {score >= 85
                  ? "Excellent"
                  : score >= 70
                    ? "Good"
                    : score >= 55
                      ? "Needs attention"
                      : "Needs care"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}