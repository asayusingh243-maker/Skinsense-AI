"use client";

import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaUserEdit,
  FaBalanceScale,
  FaLightbulb,
} from "react-icons/fa";

type Conflict = {
  field?: string;
  visualValue?: string;
  reportedValue?: string;
  explanation?: string;
};

type AssessmentExplanationProps = {
  visualAssessment?: Record<string, unknown>;
  reportedAssessment?: Record<string, unknown>;
  finalAssessment?: {
    skinType?: string;
    confidence?: string;
    conflictDetected?: boolean;
    conflictCount?: number;
    explanation?: string[];
    [key: string]: unknown;
  };
  conflicts?: Conflict[];
};

function formatLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function displayValue(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not available";
  }

  if (Array.isArray(value)) {
    return value.length > 0
      ? value.join(", ")
      : "None reported";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function AssessmentColumn({
  title,
  subtitle,
  icon,
  data,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  data?: Record<string, unknown>;
}) {
  const entries = Object.entries(data || {}).filter(
    ([key, value]) =>
      ![
        "analysisNotes",
        "mainConcerns",
        "concerns",
        "context",
      ].includes(key) &&
      value !== null &&
      value !== undefined &&
      value !== ""
  );

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-pink-50 p-3 text-pink-600">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {subtitle}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-gray-500">
          No assessment details are available.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 rounded-2xl bg-gray-50 p-4"
            >
              <span className="font-medium text-gray-600">
                {formatLabel(key)}
              </span>

              <span className="text-right font-semibold text-gray-800">
                {displayValue(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AssessmentExplanation({
  visualAssessment,
  reportedAssessment,
  finalAssessment,
  conflicts = [],
}: AssessmentExplanationProps) {
  const explanations =
    Array.isArray(finalAssessment?.explanation)
      ? finalAssessment.explanation
      : [];

  const confidence =
    finalAssessment?.confidence ||
    "Not available";

  const finalSkinType =
    finalAssessment?.skinType ||
    "Not available";

  const hasConflicts =
    Boolean(finalAssessment?.conflictDetected) ||
    conflicts.length > 0;

  return (
    <section className="rounded-3xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
            Explainable AI
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            How SkinSense reached this result
          </h1>

          <p className="mt-3 max-w-3xl text-gray-600">
            SkinSense first analyzed the image independently,
            then compared those visual findings with your
            questionnaire answers before creating the final
            recommendation.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            Final confidence
          </p>

          <p className="mt-1 text-2xl font-bold capitalize text-purple-700">
            {confidence}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AssessmentColumn
          title="Visual AI Observation"
          subtitle="What appears visible in the uploaded image."
          icon={<FaEye className="text-2xl" />}
          data={visualAssessment}
        />

        <AssessmentColumn
          title="Your Reported Experience"
          subtitle="What you told SkinSense through the questionnaire."
          icon={<FaUserEdit className="text-2xl" />}
          data={reportedAssessment}
        />
      </div>

      <section className="mt-6 rounded-3xl border border-purple-100 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
            <FaBalanceScale className="text-2xl" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Final Combined Assessment
            </h2>

            <p className="text-sm text-gray-500">
              The conclusion used for routines and products.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-pink-50 p-5">
            <p className="text-sm text-gray-500">
              Final skin type
            </p>

            <p className="mt-2 text-xl font-bold text-gray-800">
              {finalSkinType}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-5">
            <p className="text-sm text-gray-500">
              Confidence
            </p>

            <p className="mt-2 text-xl font-bold capitalize text-gray-800">
              {confidence}
            </p>
          </div>

          <div className="rounded-2xl bg-yellow-50 p-5">
            <p className="text-sm text-gray-500">
              Differences detected
            </p>

            <p className="mt-2 text-xl font-bold text-gray-800">
              {conflicts.length}
            </p>
          </div>
        </div>

        {explanations.length > 0 && (
          <div className="mt-6 space-y-3">
            {explanations.map(
              (explanation, index) => (
                <div
                  key={`${explanation}-${index}`}
                  className="flex gap-3 rounded-2xl bg-purple-50 p-4 text-gray-700"
                >
                  <FaLightbulb className="mt-1 shrink-0 text-purple-600" />

                  <p>{explanation}</p>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-yellow-100 bg-white p-6">
        <div className="flex items-center gap-3">
          {hasConflicts ? (
            <FaExclamationTriangle className="text-2xl text-yellow-600" />
          ) : (
            <FaCheckCircle className="text-2xl text-green-600" />
          )}

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Comparison Result
            </h2>

            <p className="text-sm text-gray-500">
              {hasConflicts
                ? "Some visual findings and questionnaire answers differed."
                : "The visual findings and questionnaire answers generally agree."}
            </p>
          </div>
        </div>

        {conflicts.length > 0 && (
          <div className="mt-6 space-y-4">
            {conflicts.map((conflict, index) => (
              <article
                key={`${conflict.field}-${index}`}
                className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5"
              >
                <h3 className="font-bold text-gray-800">
                  {formatLabel(
                    conflict.field ||
                      `Difference ${index + 1}`
                  )}
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Visual observation
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {conflict.visualValue ||
                        "Uncertain"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      User reported
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {conflict.reportedValue ||
                        "Not reported"}
                    </p>
                  </div>
                </div>

                {conflict.explanation && (
                  <p className="mt-4 text-gray-700">
                    {conflict.explanation}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 text-sm text-gray-500">
        SkinSense provides cosmetic skincare observations,
        not a medical diagnosis. Persistent, painful, or
        worsening concerns should be evaluated by a qualified
        dermatologist.
      </p>
    </section>
  );
}