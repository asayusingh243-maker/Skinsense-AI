export default function SkinScorePreview() {
  const score = 86;

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Decorative background */}
      <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 opacity-50 blur-3xl" />

      <div className="relative rounded-3xl border border-pink-100 bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-pink-500">
              AI Skin Report
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Your Skin Score
            </h2>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-2xl">
            ✨
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center">
          <div
            className="relative flex h-44 w-44 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(
                #ec4899 ${score * 3.6}deg,
                #fce7f3 0deg
              )`,
            }}
          >
            <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <span className="text-5xl font-bold text-gray-900">
                {score}
              </span>

              <span className="mt-1 text-sm font-medium text-gray-500">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
            Healthy Skin Condition
          </div>
        </div>

        {/* Analysis summary */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-pink-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-500">
              Skin Type
            </p>

            <p className="mt-1 font-bold text-gray-900">
              Combination
            </p>
          </div>

          <div className="rounded-2xl bg-purple-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-500">
              Hydration
            </p>

            <p className="mt-1 font-bold text-gray-900">
              Moderate
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-500">
              Skin Tone
            </p>

            <p className="mt-1 font-bold text-gray-900">
              Medium
            </p>
          </div>

          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-500">
              Main Concern
            </p>

            <p className="mt-1 font-bold text-gray-900">
              Dryness
            </p>
          </div>
        </div>

        {/* AI status */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white">
            ✓
          </span>

          <div>
            <p className="font-semibold text-gray-900">
              Analysis Complete
            </p>

            <p className="text-sm text-gray-500">
              Personalized routine generated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}