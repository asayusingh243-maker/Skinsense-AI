"use client";

interface LifestyleData {
  sleep: string;
  water: string;
  stress: string;
  exercise: string;
  sunscreen: string;
  routine: string;
}

interface LifestyleProps {
  formData: LifestyleData;
  setFormData: (data: Partial<LifestyleData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface OptionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function OptionCard({
  label,
  selected,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border-2 p-5 text-center transition-all duration-300 ${
        selected
          ? "border-pink-500 bg-pink-50 font-semibold text-pink-700 shadow-lg"
          : "border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50/40"
      }`}
    >
      {label}
    </button>
  );
}

export default function Lifestyle({
  formData,
  setFormData,
  nextStep,
  prevStep,
}: LifestyleProps) {
  const updateValue = (
    key: keyof LifestyleData,
    value: string
  ) => {
    setFormData({
      [key]: value,
    });
  };

  const allAnswered =
    formData.sleep &&
    formData.water &&
    formData.stress &&
    formData.exercise &&
    formData.sunscreen &&
    formData.routine;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-10">
      <div className="mb-10 text-center">
        <div className="mb-4 text-6xl">🌿</div>

        <h1 className="text-4xl font-bold text-pink-600">
          Lifestyle Assessment
        </h1>

        <p className="mt-3 text-gray-500">
          Your daily habits help our AI provide more personalized
          skincare advice.
        </p>
      </div>

      <div className="space-y-10">
        {/* Sleep */}

        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            How many hours do you sleep?
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Less than 5 hours",
              "5–6 hours",
              "7–8 hours",
              "More than 8 hours",
            ].map((item) => (
              <OptionCard
                key={item}
                label={item}
                selected={formData.sleep === item}
                onClick={() => updateValue("sleep", item)}
              />
            ))}
          </div>
        </section>

        {/* Water */}

        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            Daily Water Intake
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Less than 1L",
              "1–2L",
              "2–3L",
              "More than 3L",
            ].map((item) => (
              <OptionCard
                key={item}
                label={item}
                selected={formData.water === item}
                onClick={() => updateValue("water", item)}
              />
            ))}
          </div>
        </section>

        {/* Stress */}

        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            Stress Level
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {["Low", "Moderate", "High", "Very High"].map(
              (item) => (
                <OptionCard
                  key={item}
                  label={item}
                  selected={formData.stress === item}
                  onClick={() => updateValue("stress", item)}
                />
              )
            )}
          </div>
        </section>

        {/* Exercise */}

        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            Exercise Frequency
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {["Never", "1–2 Days", "3–5 Days", "Daily"].map(
              (item) => (
                <OptionCard
                  key={item}
                  label={item}
                  selected={formData.exercise === item}
                  onClick={() => updateValue("exercise", item)}
                />
              )
            )}
          </div>
        </section>

        {/* Sunscreen */}

        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            How often do you use sunscreen?
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {["Every Day", "Sometimes", "Rarely", "Never"].map(
              (item) => (
                <OptionCard
                  key={item}
                  label={item}
                  selected={formData.sunscreen === item}
                  onClick={() => updateValue("sunscreen", item)}
                />
              )
            )}
          </div>
        </section>

        {/* Routine */}

        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            Current Skincare Routine
          </h2>

          <div className="grid gap-4">
            {[
              "No Routine",
              "Cleanser Only",
              "Cleanser + Moisturizer",
              "Complete Routine (Cleanser, Serum, Moisturizer & Sunscreen)",
            ].map((item) => (
              <OptionCard
                key={item}
                label={item}
                selected={formData.routine === item}
                onClick={() => updateValue("routine", item)}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-12 flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-xl border border-gray-300 px-8 py-4 font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={nextStep}
          disabled={!allAnswered}
          className={`rounded-xl px-8 py-4 font-semibold text-white transition-all duration-300 ${
            allAnswered
              ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105"
              : "cursor-not-allowed bg-gray-400"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}