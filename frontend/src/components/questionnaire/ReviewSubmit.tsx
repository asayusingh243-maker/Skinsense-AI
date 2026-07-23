"use client";

interface ReviewData {
  name: string;
  age: string;
  gender: string;

  city: string;
  country: string;

  skinFeeling: string;
  acne: string;
  pigmentation: string;
  pores: string;
  sensitiveSkin: string;
  oiliness: string;
  sunExposure: string;
  makeupUsage: string;
  faceWash: string;

  sleep: string;
  water: string;
  stress: string;
  exercise: string;
  sunscreen: string;
  routine: string;

  budget: string;
  climate: string;
  outdoorTime: string;
}

interface ReviewSubmitProps {
  formData: ReviewData;
  prevStep: () => void;
  finishQuestionnaire: () => void;
}

interface ItemProps {
  label: string;
  value: string;
}

function ReviewItem({ label, value }: ItemProps) {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 py-3">
      <span className="font-medium text-gray-600">
        {label}
      </span>

      <span className="font-semibold text-gray-800">
        {value || "-"}
      </span>
    </div>
  );
}

export default function ReviewSubmit({
  formData,
  prevStep,
  finishQuestionnaire,
}: ReviewSubmitProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-10">

      <h1 className="text-4xl font-bold text-center text-pink-600">
        Review Your Information
      </h1>

      <p className="text-center text-gray-500 mt-3 mb-10">
        Please review everything before AI Analysis.
      </p>

      {/* Personal */}

      <div className="mb-10">

        <h2 className="text-2xl font-bold mb-5">
          👤 Personal Information
        </h2>

        <ReviewItem label="Name" value={formData.name} />
        <ReviewItem label="Age" value={formData.age} />
        <ReviewItem label="Gender" value={formData.gender} />
        <ReviewItem label="City" value={formData.city} />
        <ReviewItem label="Country" value={formData.country} />

      </div>

      {/* Skin */}

      <div className="mb-10">

        <h2 className="text-2xl font-bold mb-5">
          🧴 Skin Assessment
        </h2>

        <ReviewItem label="Skin Feeling" value={formData.skinFeeling} />
        <ReviewItem label="Acne" value={formData.acne} />
        <ReviewItem label="Pigmentation" value={formData.pigmentation} />
        <ReviewItem label="Open Pores" value={formData.pores} />
        <ReviewItem label="Sensitive Skin" value={formData.sensitiveSkin} />
        <ReviewItem label="Oiliness" value={formData.oiliness} />
        <ReviewItem label="Sun Exposure" value={formData.sunExposure} />
        <ReviewItem label="Makeup Usage" value={formData.makeupUsage} />
        <ReviewItem label="Face Wash" value={formData.faceWash} />

      </div>

      {/* Lifestyle */}

      <div className="mb-10">

        <h2 className="text-2xl font-bold mb-5">
          🌿 Lifestyle
        </h2>

        <ReviewItem label="Sleep" value={formData.sleep} />
        <ReviewItem label="Water Intake" value={formData.water} />
        <ReviewItem label="Stress" value={formData.stress} />
        <ReviewItem label="Exercise" value={formData.exercise} />
        <ReviewItem label="Sunscreen" value={formData.sunscreen} />
        <ReviewItem label="Routine" value={formData.routine} />

      </div>

      {/* Budget */}

      <div className="mb-10">

        <h2 className="text-2xl font-bold mb-5">
          💰 Budget & Environment
        </h2>

        <ReviewItem label="Budget" value={formData.budget} />
        <ReviewItem label="Climate" value={formData.climate} />
        <ReviewItem label="Outdoor Time" value={formData.outdoorTime} />

      </div>

      <div className="flex justify-between mt-12">

        <button
          type="button"
          onClick={prevStep}
          className="px-8 py-4 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={finishQuestionnaire}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 transition"
        >
          🤖 Analyze with AI
        </button>

      </div>

    </div>
  );
}