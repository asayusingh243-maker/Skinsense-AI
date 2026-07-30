"use client";

import { useEffect, useState } from "react";

import DashboardNavbar from "@/components/DashboardNavbar";
import UploadCard from "@/components/UploadCard";
import SummaryCard from "@/components/SummaryCard";
import QuickActions from "@/components/QuickActions";
import RecentAnalysis from "@/components/RecentAnalysis";

type DashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
  };
hero: {
  image: unknown;
  skinScore: number;
  skinType: string;
  skinTone: string;
  budget: number | string;
  weather: string;
  lastScan: string | null;
  change: number;
  direction: "improved" | "declined" | "stable";
};
  todayInsight: string[];
  quickStats: {
    totalScans: number;
    routineCompletion: number;
    currentStreak: number;
  };
  recentScans: {
    id: string;
    skinScore: number;
    image: string | null;
    createdAt: string;
  }[];
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
    return "No scans completed yet";
  }

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/dashboard",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load dashboard."
          );
        }

        setDashboard(result.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50">
        <DashboardNavbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />

            <p className="mt-4 text-gray-600">
              Loading your SkinSense dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-pink-50">
        <DashboardNavbar />

        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard could not be loaded
            </h1>

            <p className="mt-3 text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user, hero, todayInsight, quickStats } =
    dashboard;
    const imageValue =
  typeof hero.image === "string"
    ? hero.image
    : hero.image &&
        typeof hero.image === "object" &&
        "url" in hero.image
      ? String(hero.image.url)
      : "";

const latestImageUrl = imageValue
  ? imageValue.startsWith("http")
    ? imageValue
    : `http://localhost:5000${
        imageValue.startsWith("/") ? "" : "/"
      }${imageValue}`
  : "";
  console.log("Dashboard hero image:", hero.image);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <DashboardNavbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <section>
          <h1 className="text-4xl font-bold text-gray-800 sm:text-5xl">
            {getGreeting()}, {user.name || "User"} 👋
          </h1>

          <p className="mb-10 mt-4 text-lg text-gray-600">
            Welcome back! Continue your personalized
            skincare journey with AI-powered insights.
          </p>
        </section>

        <section className="mb-8 overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
          <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-pink-600">
                Latest skin analysis
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-800">
                Skin Health Score
              </h2>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-6xl font-bold text-pink-600">
                  {hero.skinScore}
                </span>

                <span className="mb-2 text-xl text-gray-500">
                  / 100
                </span>
              </div>

              <div className="mt-4">
                {hero.direction === "improved" && (
                  <p className="font-semibold text-green-600">
                    ↑ {hero.change} points since your
                    previous scan
                  </p>
                )}

                {hero.direction === "declined" && (
                  <p className="font-semibold text-red-600">
                    ↓ {Math.abs(hero.change)} points since
                    your previous scan
                  </p>
                )}

                {hero.direction === "stable" && (
                  <p className="font-semibold text-gray-500">
                    Your score is currently stable
                  </p>
                )}
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Last scan: {formatLastScan(hero.lastScan)}
              </p>
            </div>

            <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl bg-pink-50">
  {latestImageUrl ? (
    <img
      src={latestImageUrl}
      alt="Latest skin analysis"
      className="h-full max-h-80 w-full object-cover"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <div className="px-6 text-center">
      <div className="text-5xl">📷</div>

      <p className="mt-4 font-semibold text-gray-700">
        No scan image available
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Complete a skin analysis to see your latest image here.
      </p>
    </div>
  )}
</div>

          </div>
        </section>

        <section className="mb-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Scans
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {quickStats.totalScans}
            </p>
          </div>

          <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Routine Completion
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {quickStats.routineCompletion}%
            </p>
          </div>

          <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Current Streak
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {quickStats.currentStreak} days
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Today&apos;s AI Insights
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {todayInsight.map((insight, index) => (
              <div
                key={`${insight}-${index}`}
                className="rounded-2xl bg-purple-50 p-5"
              >
                <span className="text-2xl">✨</span>

                <p className="mt-3 text-gray-700">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-8">
          <UploadCard />
           <SummaryCard
  skinScore={hero.skinScore}
  skinType={hero.skinType}
  skinTone={hero.skinTone}
  weather={hero.weather}
  budget={hero.budget}
  progress={
    hero.direction === "improved"
      ? "Improving"
      : hero.direction === "declined"
      ? "Needs Attention"
      : "Stable"
  }
/>
          
          <QuickActions />
          <RecentAnalysis scans={dashboard.recentScans} />
        </div>
      </main>
    </div>
  );
}