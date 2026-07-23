"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  FaUserCircle,
  FaTint,
  FaLeaf,
  FaRegSun,
  FaChartLine,
  FaWater,
} from "react-icons/fa";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface ProductRecommendation {
  id: string;

  brand: string;
  name: string;
  category: string;
  size: string;

  price: number;
  originalPrice: number;
  currency: string;

  seller: string;
  buyUrl: string;

  alternativeSeller: string;
  alternativeBuyUrl: string;

  imageUrl: string;

  reason: string;

  matchedConcerns: string[];
  keyIngredients: string[];

  usage: string;
  warnings: string[];

  priceCheckedAt: string;
}

interface AnalysisResult {
  skinType: string;
  skinTone: string;
  undertone: string;
  skinScore: number;

  skinAge: string;

  acne: string;
  pigmentation: string;
  pores: string;
  hydration: string;

  oiliness: string;
  sensitivity: string;

  mainConcerns: string[];

  morningRoutine: string[];
  nightRoutine: string[];

  products: ProductRecommendation[];

  foods: string[];
  ingredients: string[];
  avoidIngredients?: string[];

  routineTotal?: number;
  detectedBudget?: number;
  budgetStatus?: string;
  priceDisclaimer?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Helper components                             */
/* -------------------------------------------------------------------------- */

interface AnalysisRowProps {
  icon: ReactNode;
  label: string;
  value: string | number | undefined;
  valueClassName?: string;
}

function AnalysisRow({
  icon,
  label,
  value,
  valueClassName = "text-slate-800",
}: AnalysisRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <span className="flex items-center gap-2 font-medium text-slate-600">
        {icon}
        {label}
      </span>

      <span
        className={`max-w-[55%] text-right font-semibold ${valueClassName}`}
      >
        {value || "Not available"}
      </span>
    </div>
  );
}

interface ListCardProps {
  title: string;
  items: string[];
  emoji: string;
  titleClassName: string;
  itemClassName: string;
  emptyMessage: string;
}

function ListCard({
  title,
  items,
  emoji,
  titleClassName,
  itemClassName,
  emptyMessage,
}: ListCardProps) {
  return (
    <section className="rounded-3xl bg-white p-7 shadow-xl sm:p-8">
      <h2 className={`mb-6 text-2xl font-bold ${titleClassName}`}>
        {emoji} {title}
      </h2>

      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className={`rounded-xl p-4 leading-7 ${itemClassName}`}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-slate-50 p-4 text-slate-500">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function formatCurrency(value?: number) {
  if (!value || value <= 0) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function safeArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0
  );
}

function getBudgetStatusClass(status?: string) {
  const normalizedStatus = status?.toLowerCase() || "";

  if (normalizedStatus.includes("within")) {
    return "bg-green-100 text-green-700";
  }

  if (
    normalizedStatus.includes("above") ||
    normalizedStatus.includes("over")
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

/* -------------------------------------------------------------------------- */
/*                                Product card                                */
/* -------------------------------------------------------------------------- */

function ProductCard({
  product,
}: {
  product: ProductRecommendation;
}) {
  const productImage =
    product.imageUrl || "/products/product-placeholder.png";

  const hasDiscount =
    product.originalPrice > 0 &&
    product.price > 0 &&
    product.originalPrice > product.price;

  return (
    <article className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* Product image */}

      <div className="relative flex h-64 items-center justify-center bg-gradient-to-br from-green-50 to-white p-6">
        <img
          src={productImage}
          alt={`${product.brand} ${product.name}`}
          className="h-full w-full object-contain"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              "/products/product-placeholder.png";
          }}
        />

        {product.category && (
          <span className="absolute left-4 top-4 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow">
            {product.category}
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Brand and name */}

        <p className="text-sm font-bold uppercase tracking-wider text-pink-500">
          {product.brand || "Recommended brand"}
        </p>

        <h3 className="mt-2 text-xl font-bold leading-7 text-slate-900">
          {product.name}
        </h3>

        {product.size && (
          <p className="mt-1 text-sm text-slate-500">
            Size: {product.size}
          </p>
        )}

        {/* Price */}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-2xl font-extrabold text-green-700">
            {formatCurrency(product.price)}
          </span>

          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {product.seller && (
          <p className="mt-2 text-sm text-slate-500">
            Available from{" "}
            <span className="font-semibold text-slate-700">
              {product.seller}
            </span>
          </p>
        )}

        {/* Reason */}

        <div className="mt-5 rounded-2xl bg-pink-50 p-5">
          <p className="font-bold text-pink-600">
            Why it suits your skin
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            {product.reason ||
              "Selected according to your skin analysis and budget."}
          </p>
        </div>

        {/* Matched concerns */}

        {product.matchedConcerns?.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold text-slate-800">
              Matches your concerns
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {product.matchedConcerns.map(
                (concern, index) => (
                  <span
                    key={`${concern}-${index}`}
                    className="rounded-full bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700"
                  >
                    {concern}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Key ingredients */}

        {product.keyIngredients?.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold text-slate-800">
              Key ingredients
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {product.keyIngredients.map(
                (ingredient, index) => (
                  <span
                    key={`${ingredient}-${index}`}
                    className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                  >
                    {ingredient}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Usage */}

        {product.usage && (
          <div className="mt-5 rounded-xl bg-purple-50 p-4">
            <p className="text-sm font-bold text-purple-700">
              How to use
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {product.usage}
            </p>
          </div>
        )}

        {/* Warnings */}

        {product.warnings?.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-800">
              Important
            </p>

            <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-800">
              {product.warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Purchase buttons */}

        <div className="mt-6 flex flex-col gap-3">
          {product.buyUrl ? (
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-green-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-green-700"
            >
              Buy from {product.seller || "recommended seller"} ↗
            </a>
          ) : (
            <div className="rounded-xl bg-slate-100 px-5 py-3 text-center font-medium text-slate-500">
              Purchase link unavailable
            </div>
          )}

          {product.alternativeBuyUrl && (
            <a
              href={product.alternativeBuyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-green-600 px-5 py-3 text-center font-semibold text-green-700 transition hover:bg-green-50"
            >
              Compare at{" "}
              {product.alternativeSeller ||
                "alternative seller"}{" "}
              ↗
            </a>
          )}
        </div>

        {product.priceCheckedAt && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Price information checked:{" "}
            {product.priceCheckedAt}
          </p>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Results page                                */
/* -------------------------------------------------------------------------- */

export default function ResultsPage() {
  const hasLoaded = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null);

  const [uploadedImageUrl, setUploadedImageUrl] =
    useState<string | null>(null);

  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }

    hasLoaded.current = true;

    async function loadAnalysis() {
      try {
        const questionnaire =
          localStorage.getItem("questionnaire");

        const uploadedImage =
          localStorage.getItem("uploadedImage");

        if (!questionnaire) {
          throw new Error(
            "Questionnaire data was not found. Please complete the questionnaire again."
          );
        }

        if (
          !uploadedImage ||
          uploadedImage === "undefined" ||
          uploadedImage === "null"
        ) {
          throw new Error(
            "Uploaded image was not found. Please upload your selfie again."
          );
        }

        setUploadedImageUrl(
          `http://localhost:5000/uploads/${encodeURIComponent(
            uploadedImage
          )}`
        );

        const response = await fetch(
          "http://localhost:5000/api/gemini/analyze",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              questionnaire: JSON.parse(questionnaire),
              image: uploadedImage,
            }),
          }
        );

        const responseText = await response.text();

        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            responseText ||
              `Backend returned an invalid response (${response.status})`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              `Server Error (${response.status})`
          );
        }

        if (!data.success) {
          throw new Error(
            data.message ||
              "Skin analysis was unsuccessful."
          );
        }

        const result = data.analysis || data.result;

        if (!result) {
          throw new Error(
            "The backend did not return the skin analysis result."
          );
        }

        const normalizedResult: AnalysisResult = {
          ...result,

          mainConcerns: safeArray(result.mainConcerns),

          morningRoutine: safeArray(
            result.morningRoutine
          ),

          nightRoutine: safeArray(result.nightRoutine),

          foods: safeArray(result.foods),

          ingredients: safeArray(result.ingredients),

          avoidIngredients: safeArray(
            result.avoidIngredients
          ),

          products: Array.isArray(result.products)
            ? result.products.filter(
                (
                  product: unknown
                ): product is ProductRecommendation =>
                  typeof product === "object" &&
                  product !== null
              )
            : [],
        };

        setAnalysis(normalizedResult);
      } catch (err) {
        console.error("Analysis error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                               Loading state                              */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 px-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl">
          <div className="mx-auto mb-6 h-20 w-20 animate-spin rounded-full border-4 border-pink-100 border-t-pink-500" />

          <h2 className="text-3xl font-bold text-pink-600">
            AI is analyzing your skin...
          </h2>

          <p className="mt-4 leading-7 text-slate-500">
            We are analyzing your photo, questionnaire,
            skincare needs and budget, and searching for
            suitable products.
          </p>

          <p className="mt-3 text-sm text-slate-400">
            Product discovery may take a little longer than
            the skin analysis.
          </p>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                Error state                               */
  /* ------------------------------------------------------------------------ */

  if (error || !analysis) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-pink-50 px-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="text-6xl">⚠️</div>

          <h2 className="mt-5 text-3xl font-bold text-red-600">
            Analysis Failed
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            {error || "The analysis result was not found."}
          </p>

          <Link
            href="/analyze"
            className="mt-8 inline-flex rounded-xl bg-pink-600 px-8 py-4 font-semibold text-white transition hover:bg-pink-700"
          >
            Upload a new photo
          </Link>
        </div>
      </main>
    );
  }

  const products = analysis.products ?? [];

  const calculatedTotal = products.reduce(
    (total, product) =>
      total +
      (typeof product.price === "number"
        ? product.price
        : 0),
    0
  );

  const routineTotal =
    analysis.routineTotal ?? calculatedTotal;

  const detectedBudget = analysis.detectedBudget ?? 0;

  const budgetStatus =
    analysis.budgetStatus ||
    (detectedBudget > 0
      ? routineTotal <= detectedBudget
        ? "Within budget"
        : "Above budget"
      : "Budget not provided");

  /* ------------------------------------------------------------------------ */
  /*                                  Result                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* Heading */}

        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-500">
            Personalized AI Report
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-pink-600 sm:text-5xl">
            AI Skin Analysis Report
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
            Your analysis combines your uploaded image,
            questionnaire answers, skincare concerns and
            budget.
          </p>
        </div>

        {/* Uploaded image and main analysis */}

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Uploaded Photo
            </h2>

            {uploadedImageUrl ? (
              <img
                src={uploadedImageUrl}
                alt="Uploaded skin analysis"
                className="h-[500px] w-full rounded-2xl bg-slate-100 object-cover"
              />
            ) : (
              <div className="flex h-[500px] items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                No uploaded image found
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-white p-7 shadow-xl sm:p-8">
            <h2 className="mb-8 text-3xl font-bold text-slate-900">
              AI Analysis
            </h2>

            <div className="space-y-5">
              <AnalysisRow
                icon={
                  <FaChartLine className="text-green-600" />
                }
                label="Skin Score"
                value={`${analysis.skinScore ?? 0}%`}
                valueClassName="text-green-600"
              />

              <AnalysisRow
                icon={
                  <FaUserCircle className="text-pink-500" />
                }
                label="Skin Type"
                value={analysis.skinType}
              />

              <AnalysisRow
                icon={<FaTint className="text-blue-500" />}
                label="Skin Tone"
                value={analysis.skinTone}
              />

              <AnalysisRow
                icon={<span>🎨</span>}
                label="Undertone"
                value={analysis.undertone}
              />

              <AnalysisRow
                icon={<FaLeaf className="text-green-600" />}
                label="Acne"
                value={analysis.acne}
              />

              <AnalysisRow
                icon={
                  <FaRegSun className="text-orange-500" />
                }
                label="Pigmentation"
                value={analysis.pigmentation}
              />

              <AnalysisRow
                icon={<span>🔍</span>}
                label="Pores"
                value={analysis.pores}
              />

              <AnalysisRow
                icon={<FaWater className="text-blue-400" />}
                label="Hydration"
                value={analysis.hydration}
              />

              <AnalysisRow
                icon={<span>🧬</span>}
                label="Skin Age"
                value={analysis.skinAge}
              />

              <AnalysisRow
                icon={<span>✨</span>}
                label="Oiliness"
                value={analysis.oiliness}
              />

              <AnalysisRow
                icon={<span>🌸</span>}
                label="Sensitivity"
                value={analysis.sensitivity}
              />
            </div>
          </section>
        </div>

        {/* Main concerns */}

        <div className="mt-8">
          <ListCard
            title="Main Skin Concerns"
            emoji="🚨"
            items={analysis.mainConcerns ?? []}
            titleClassName="text-red-500"
            itemClassName="bg-red-50 text-slate-700"
            emptyMessage="No major cosmetic concerns were identified."
          />
        </div>

        {/* Morning and night routines */}

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <ListCard
            title="Morning Routine"
            emoji="🌞"
            items={analysis.morningRoutine ?? []}
            titleClassName="text-pink-600"
            itemClassName="bg-pink-50 text-slate-700"
            emptyMessage="No morning routine was generated."
          />

          <ListCard
            title="Night Routine"
            emoji="🌙"
            items={analysis.nightRoutine ?? []}
            titleClassName="text-purple-600"
            itemClassName="bg-purple-50 text-slate-700"
            emptyMessage="No night routine was generated."
          />
        </div>

        {/* Product recommendation heading */}

        <section className="mt-10 rounded-3xl bg-white p-7 shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-green-600">
                Budget-aware shopping
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                🛍 Recommended Products
              </h2>

              <p className="mt-3 max-w-3xl leading-7 text-slate-500">
                Products are selected according to your skin
                needs, concerns, sensitivity, lifestyle and
                total budget.
              </p>
            </div>

            <div
              className={`self-start rounded-full px-5 py-3 text-sm font-bold ${getBudgetStatusClass(
                budgetStatus
              )}`}
            >
              {budgetStatus}
            </div>
          </div>

          {/* Budget summary */}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-purple-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Your total budget
              </p>

              <p className="mt-2 text-2xl font-bold text-purple-700">
                {detectedBudget > 0
                  ? formatCurrency(detectedBudget)
                  : "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Recommended routine total
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {routineTotal > 0
                  ? formatCurrency(routineTotal)
                  : "Unavailable"}
              </p>
            </div>

            <div className="rounded-2xl bg-pink-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Products selected
              </p>

              <p className="mt-2 text-2xl font-bold text-pink-600">
                {products.length}
              </p>
            </div>
          </div>
        </section>

        {/* Product cards */}

        {products.length > 0 ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {products.map((product, index) => (
              <ProductCard
                key={
                  product.id ||
                  `${product.brand}-${product.name}-${index}`
                }
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-xl">
            <div className="text-5xl">🧴</div>

            <h3 className="mt-4 text-2xl font-bold text-slate-900">
              No verified products found
            </h3>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-500">
              The AI completed your skin analysis but could
              not confidently verify suitable products,
              prices or purchase pages.
            </p>
          </div>
        )}

        {/* Price disclaimer */}

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
          <strong>Price notice:</strong>{" "}
          {analysis.priceDisclaimer ||
            "Prices and availability may change before purchase. Confirm the final price, seller and product details on the retailer website."}
        </div>

        {/* Foods, ingredients and avoid ingredients */}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <ListCard
            title="Foods for Healthy Skin"
            emoji="🥗"
            items={analysis.foods ?? []}
            titleClassName="text-orange-500"
            itemClassName="bg-orange-50 text-slate-700"
            emptyMessage="No food suggestions were generated."
          />

          <ListCard
            title="Recommended Ingredients"
            emoji="🧪"
            items={analysis.ingredients ?? []}
            titleClassName="text-blue-600"
            itemClassName="bg-blue-50 text-slate-700"
            emptyMessage="No ingredient suggestions were generated."
          />

          <ListCard
            title="Ingredients and Practices to Avoid"
            emoji="⚠️"
            items={analysis.avoidIngredients ?? []}
            titleClassName="text-red-600"
            itemClassName="bg-red-50 text-slate-700"
            emptyMessage="No specific ingredients or practices were marked for avoidance."
          />
        </div>

        {/* Actions */}

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/analyze"
            className="rounded-xl bg-pink-600 px-8 py-4 text-center font-semibold text-white transition hover:bg-pink-700"
          >
            Analyze Another Photo
          </Link>

          <Link
            href="/"
            className="rounded-xl border-2 border-pink-500 px-8 py-4 text-center font-semibold text-pink-600 transition hover:bg-pink-50"
          >
            Return Home
          </Link>
        </div>

        {/* Safety disclaimer */}

        <p className="mx-auto mt-10 max-w-4xl text-center text-xs leading-6 text-slate-400">
          SkinSense AI provides general cosmetic skincare
          guidance and product suggestions. It does not
          diagnose or treat medical conditions. Patch-test new
          skincare products and consult a qualified
          dermatologist for persistent, painful or severe skin
          concerns.
        </p>
      </div>
    </main>
  );
}