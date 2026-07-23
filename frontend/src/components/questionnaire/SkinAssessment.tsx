"use client";

interface SkinData {
  skinFeeling: string;
  acne: string;
  pigmentation: string;
  pores: string;
  sensitiveSkin: string;
  oiliness: string;
  sunExposure: string;
  makeupUsage: string;
  faceWash: string;
}

interface SkinAssessmentProps {
  formData: SkinData;
  setFormData: (data: Partial<SkinData>) => void;
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
      className={`w-full rounded-2xl border-2 p-4 transition-all duration-300 ${
        selected
          ? "border-pink-500 bg-pink-50 shadow-lg"
          : "border-gray-200 hover:border-pink-300"
      }`}
    >
      {label}
    </button>
  );
}

interface QuestionProps {
  title: string;
  field: keyof SkinData;
  options: string[];
  formData: SkinData;
  updateValue: (key: keyof SkinData, value: string) => void;
}

function Question({
  title,
  field,
  options,
  formData,
  updateValue,
}: QuestionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {options.map((item) => (
          <OptionCard
            key={item}
            label={item}
            selected={formData[field] === item}
            onClick={() => updateValue(field, item)}
          />
        ))}
      </div>
    </div>
  );
}

export default function SkinAssessment({
  formData,
  setFormData,
  nextStep,
  prevStep,
}: SkinAssessmentProps) {

  const updateValue = (
    key: keyof SkinData,
    value: string
  ) => {
    setFormData({
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-10">

      <div className="text-center mb-10">

        <div className="text-6xl mb-4">
          🧴
        </div>

        <h1 className="text-4xl font-bold text-pink-600">
          Skin Assessment
        </h1>

        <p className="text-gray-500 mt-3">
          Tell us about your skin so our AI can
          provide better recommendations.
        </p>

      </div>

      <Question
        title="How does your skin feel after washing?"
        field="skinFeeling"
        options={[
          "Dry",
          "Oily",
          "Combination",
          "Normal",
        ]}
        formData={formData}
        updateValue={updateValue}
      />

      <Question
        title="Acne Level"
        field="acne"
        options={[
          "None",
          "Mild",
          "Moderate",
          "Severe",
        ]}
        formData={formData}
        updateValue={updateValue}
      />

      <Question
        title="Pigmentation"
        field="pigmentation"
        options={[
          "None",
          "Low",
          "Moderate",
          "High",
        ]}
        formData={formData}
        updateValue={updateValue}
      />

      <Question
        title="Open Pores"
        field="pores"
        options={[
          "None",
          "Small",
          "Medium",
          "Large",
        ]}
        formData={formData}
        updateValue={updateValue}
      />

      <Question
        title="Sensitive Skin"
        field="sensitiveSkin"
        options={[
          "Yes",
          "No",
        ]}
        formData={formData}
        updateValue={updateValue}
      />

      <Question
        title="Oil Production"
        field="oiliness"
        options={[
          "Very Dry",
          "Balanced",
          "Oily",
          "Very Oily",
        ]}
        formData={formData}
        updateValue={updateValue}
      />

      <Question
        title="Daily Sun Exposure"
        field="sunExposure"
        options={[
          "< 1 Hour",
          "1–3 Hours",
          "> 3 Hours",
        ]}
        formData={formData}
        updateValue={updateValue}
      />

      <Question
        title="Makeup Usage"
        field="makeupUsage"
        options={[
          "Never",
          "Sometimes",
          "Frequently",
          "Daily",
        ]}
        formData={formData}
        updateValue={updateValue}
      />

      <Question
        title="Face Wash Frequency"
        field="faceWash"
        options={[
          "Once",
          "Twice",
          "More than Twice",
        ]}
        formData={formData}
        updateValue={updateValue}
      />

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
          onClick={nextStep}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 transition"
        >
          Next →
        </button>

      </div>

    </div>
  );
}