export default function SkinAnalysisPreview() {
  const score = 86;

  return (
    <div className="relative mx-auto w-full max-w-[400px] px-5 py-10 sm:px-0">
      {/* Background glow */}
      <div className="absolute inset-10 rounded-full bg-pink-300/30 blur-3xl" />

      {/* Main photograph */}
      <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-white p-2 shadow-2xl">
        <div className="relative h-[460px] overflow-hidden rounded-[1.6rem] bg-gradient-to-b from-pink-100 to-purple-100">
        
          <img
  src="/skin-analysis-preview.png"
  alt="Sample AI skin analysis"
  className="h-full w-full object-cover object-center"
/>

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

          {/* Sample label */}
          <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-wide text-pink-600 shadow-md">
            Sample AI Analysis
          </div>

          {/* Face scanning frame */}
          <div className="absolute left-1/2 top-[48%] h-[260px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-[45%] border-2 border-dashed border-white/90">
            <span className="absolute -left-1 -top-1 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-pink-500" />

            <span className="absolute -right-1 -top-1 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-pink-500" />

            <span className="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-pink-500" />

            <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-pink-500" />
          </div>

          {/* Completion card */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-white">
              ✓
            </div>

            <div>
              <p className="font-bold text-slate-900">
                Analysis Complete
              </p>

              <p className="text-xs text-slate-500">
                Personalized skincare report ready
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skin score */}
      <div className="absolute right-0 top-20 rounded-2xl border border-pink-100 bg-white p-3 shadow-xl sm:-right-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(
                #ec4899 ${score * 3.6}deg,
                #fce7f3 0deg
              )`,
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <span className="font-bold text-pink-600">
                {score}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Skin Score
            </p>

            <p className="font-bold text-slate-900">
              Healthy
            </p>
          </div>
        </div>
      </div>

      {/* Hydration */}
      <div className="absolute left-0 top-40 rounded-2xl bg-white px-4 py-3 shadow-xl sm:-left-10">
        <p className="text-xs text-slate-400">
          Hydration
        </p>

        <p className="font-bold text-blue-600">
          78%
        </p>
      </div>

      {/* Skin type */}
      <div className="absolute bottom-24 left-0 rounded-2xl bg-white px-4 py-3 shadow-xl sm:-left-8">
        <p className="text-xs text-slate-400">
          Skin Type
        </p>

        <p className="font-bold text-purple-600">
          Combination
        </p>
      </div>

      {/* Pigmentation */}
      <div className="absolute bottom-28 right-0 rounded-2xl bg-white px-4 py-3 shadow-xl sm:-right-7">
        <p className="text-xs text-slate-400">
          Pigmentation
        </p>

        <p className="font-bold text-orange-500">
          Mild
        </p>
      </div>
    </div>
  );
}