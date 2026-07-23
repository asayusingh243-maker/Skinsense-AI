"use client";

import Link from "next/link";
import SkinAnalysisPreview from "@/components/SkinAnalysisPreview";

export default function Hero() {
  return (
    <section className="overflow-hidden bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50">
      <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-2 lg:px-10">
        {/* Left side */}
        <div className="text-center lg:text-left">
          <p className="mb-4 inline-flex rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-600">
            ✨ AI-Powered Skincare Assistant
          </p>

          <h1 className="text-5xl font-bold leading-tight text-slate-900 sm:text-6xl lg:text-7xl">
            AI Powered{" "}
            <span className="text-pink-600">
              Skin Analysis
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600 lg:mx-0">
            Upload a selfie and receive AI-powered skincare analysis,
            weather-aware routines and budget-friendly recommendations.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <Link
              href="/analyze"
              className="rounded-xl bg-pink-600 px-8 py-4 text-center text-lg font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-pink-700"
            >
              Analyze Now
            </Link>

            <Link
              href="#features"
              className="rounded-xl border-2 border-pink-500 px-8 py-4 text-center text-lg font-semibold text-pink-600 transition hover:bg-pink-50"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-600 lg:justify-start">
            <span>✓ Personalized Results</span>
            <span>✓ Secure Upload</span>
            <span>✓ Budget Friendly</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-center py-8">
          <SkinAnalysisPreview />
        </div>
      </div>
    </section>
  );
}