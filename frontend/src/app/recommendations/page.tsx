"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaShoppingBag,
  FaWallet,
  FaCheckCircle,
  FaTag,
} from "react-icons/fa";

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
  products: Product[];

  budget: {
    detectedBudget: number | null;
    routineTotal: number;
    status: string;
  };

  skin: {
    type: string;
    tone: string;
    concerns: {
      name?: string;
      severity?: string;
      score?: number | null;
    }[];
  };

  scan: {
    id: string;
    date: string;
    skinScore: number | null;
  };
};

type ApiResponse = {
  success: boolean;
  data?: LatestAnalysis;
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

function formatCurrency(
  value?: number | null
) {
  if (
    value === null ||
    value === undefined ||
    value <= 0
  ) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildImageUrl(
  value?: string | null
) {
  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `${API_URL}${
    value.startsWith("/") ? "" : "/"
  }${value}`;
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Not available";
  }

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

export default function RecommendationsPage() {
  const [analysis, setAnalysis] =
    useState<LatestAnalysis | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadRecommendations =
      async () => {
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

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                "Unable to load recommendations."
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
              : "Unable to load recommendations."
          );
        } finally {
          setLoading(false);
        }
      };

    loadRecommendations();
  }, []);

  const products = useMemo(() => {
    return (
      analysis?.products.map(
        (product) => ({
          ...product,

          resolvedImageUrl:
            buildImageUrl(
              product.imageUrl
            ),
        })
      ) || []
    );
  }, [analysis]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />

            <p className="mt-4 text-gray-600">
              Loading your personalized
              recommendations...
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
            Recommendations could not
            be loaded
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

  const {
    budget,
    skin,
    scan,
  } = analysis;

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
                Personalized Picks
              </p>

              <h1 className="mt-3 text-4xl font-bold text-gray-900 sm:text-5xl">
                Product Recommendations
              </h1>

              <p className="mt-4 max-w-3xl text-lg text-gray-600">
                These products were selected
                using your latest skin
                analysis, questionnaire,
                routine, budget, and safety
                checks.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-full bg-pink-50 px-4 py-2 font-semibold text-pink-700">
                  Skin type:{" "}
                  {skin.type ||
                    "Not available"}
                </span>

                <span className="rounded-full bg-purple-50 px-4 py-2 font-semibold text-purple-700">
                  Skin score:{" "}
                  {scan.skinScore ??
                    "N/A"}
                  /100
                </span>

                <span className="rounded-full bg-blue-50 px-4 py-2 font-semibold text-blue-700">
                  Latest scan:{" "}
                  {formatDate(scan.date)}
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-pink-100 to-purple-100 p-6">
              <div className="flex items-center gap-3">
                <FaWallet className="text-2xl text-pink-600" />

                <h2 className="text-xl font-bold text-gray-800">
                  Budget Summary
                </h2>
              </div>

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

              <div className="mt-4 rounded-xl bg-white/70 p-3">
                <p className="font-semibold text-gray-700">
                  {budget.status ||
                    "Budget status not available"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-green-50 p-3 text-green-600">
              <FaShoppingBag className="text-2xl" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Recommended Products
              </h2>

              <p className="mt-1 text-gray-500">
                Products selected for your
                current skincare plan.
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
              <FaShoppingBag className="mx-auto text-5xl text-gray-300" />

              <h3 className="mt-4 text-xl font-bold text-gray-800">
                No products available
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-gray-500">
                Your latest analysis does not
                contain saved product
                recommendations yet. Run a new
                analysis to generate them.
              </p>

              <Link
                href="/analyze"
                className="mt-6 inline-block rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
              >
                Start New Analysis
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map(
                (product, index) => (
                  <article
                    key={
                      product.id ||
                      `${product.name}-${index}`
                    }
                    className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex h-60 items-center justify-center bg-gray-50 p-5">
                      {product.resolvedImageUrl ? (
                        <img
                          src={
                            product.resolvedImageUrl
                          }
                          alt={
                            product.name ||
                            "Recommended skincare product"
                          }
                          className="h-full w-full object-contain"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <FaShoppingBag className="mx-auto text-5xl" />

                          <p className="mt-3 text-sm">
                            Image unavailable
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-pink-600">
                            {product.category ||
                              "Skincare"}
                          </p>

                          <h3 className="mt-2 text-xl font-bold text-gray-900">
                            {product.brand
                              ? `${product.brand} `
                              : ""}

                            {product.name ||
                              "Recommended Product"}
                          </h3>

                          {product.size && (
                            <p className="mt-1 text-sm text-gray-500">
                              {product.size}
                            </p>
                          )}
                        </div>

                        <FaTag className="mt-1 shrink-0 text-pink-500" />
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(
                            product.price
                          )}
                        </span>

                        {product.originalPrice &&
                          product.price &&
                          product.originalPrice >
                            product.price && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(
                                product.originalPrice
                              )}
                            </span>
                          )}
                      </div>

                      {product.seller && (
                        <p className="mt-2 text-sm text-gray-500">
                          Seller:{" "}
                          {product.seller}
                        </p>
                      )}

                      {product.reason && (
                        <div className="mt-5 rounded-2xl bg-green-50 p-4">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-600" />

                            <p className="font-semibold text-green-800">
                              Why this was selected
                            </p>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-gray-700">
                            {product.reason}
                          </p>
                        </div>
                      )}

                      {product.usage && (
                        <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                          <p className="font-semibold text-blue-800">
                            How to use
                          </p>

                          <p className="mt-2 text-sm leading-6 text-gray-700">
                            {product.usage}
                          </p>
                        </div>
                      )}

                      {Array.isArray(
                        product.keyIngredients
                      ) &&
                        product.keyIngredients
                          .length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-700">
                              Key ingredients
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {product.keyIngredients.map(
                                (
                                  ingredient,
                                  ingredientIndex
                                ) => (
                                  <span
                                    key={`${ingredient}-${ingredientIndex}`}
                                    className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700"
                                  >
                                    {
                                      ingredient
                                    }
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {Array.isArray(
                        product.warnings
                      ) &&
                        product.warnings.length >
                          0 && (
                          <div className="mt-4 rounded-2xl bg-yellow-50 p-4">
                            <div className="flex items-center gap-2">
                              <FaExclamationTriangle className="text-yellow-600" />

                              <p className="font-semibold text-yellow-800">
                                Important
                              </p>
                            </div>

                            <ul className="mt-2 space-y-2">
                              {product.warnings.map(
                                (
                                  warning,
                                  warningIndex
                                ) => (
                                  <li
                                    key={`${warning}-${warningIndex}`}
                                    className="text-sm leading-6 text-gray-700"
                                  >
                                    • {warning}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      <div className="mt-6">
                        {product.buyUrl ? (
                          <a
                            href={
                              product.buyUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full rounded-xl bg-green-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-green-700"
                          >
                            View Product
                          </a>
                        ) : (
                          <div className="rounded-xl bg-gray-100 px-5 py-3 text-center font-semibold text-gray-400">
                            Purchase link
                            unavailable
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/routine"
            className="rounded-xl border border-pink-300 bg-white px-6 py-3 font-semibold text-pink-600 transition hover:bg-pink-50"
          >
            View Routine
          </Link>

          <Link
            href="/analyze"
            className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
          >
            Analyze Again
          </Link>
        </div>
      </div>
    </main>
  );
}