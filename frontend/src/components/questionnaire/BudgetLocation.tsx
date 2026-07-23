"use client";

interface BudgetLocationData {
  budget: string;
  city: string;
  country: string;
  climate: string;
  outdoorTime: string;
}

interface BudgetLocationProps {
  formData: BudgetLocationData;
  setFormData: (data: Partial<BudgetLocationData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface CardProps {
  value: string;
  selected: boolean;
  onClick: () => void;
}

function Card({
  value,
  selected,
  onClick,
}: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border-2 p-5 transition-all duration-300 ${
        selected
          ? "border-pink-500 bg-pink-50 shadow-lg"
          : "border-gray-200 hover:border-pink-300"
      }`}
    >
      {value}
    </button>
  );
}

export default function BudgetLocation({
  formData,
  setFormData,
  nextStep,
  prevStep,
}: BudgetLocationProps) {
  const updateValue = (
    key: keyof BudgetLocationData,
    value: string
  ) => {
    setFormData({
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-10">

      <div className="text-center mb-10">
        <div className="text-6xl mb-4">💰</div>

        <h1 className="text-4xl font-bold text-pink-600">
          Budget & Location
        </h1>

        <p className="text-gray-500 mt-3">
          Help us recommend products that fit your lifestyle.
        </p>
      </div>

      {/* Budget */}

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Monthly Skincare Budget
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {[
            "Under ₹500",
            "₹500–₹1000",
            "₹1000–₹2000",
            "₹2000–₹5000",
            "Above ₹5000",
          ].map((item) => (
            <Card
              key={item}
              value={item}
              selected={formData.budget === item}
              onClick={() => updateValue("budget", item)}
            />
          ))}
        </div>
      </div>

      {/* City */}

      <div className="mb-6">
        <label className="font-semibold block mb-2">
          City
        </label>

        <input
          type="text"
          value={formData.city}
          onChange={(e) =>
            updateValue("city", e.target.value)
          }
          className="w-full border rounded-xl px-4 py-3"
          placeholder="Delhi"
        />
      </div>

      {/* Country */}

      <div className="mb-8">
        <label className="font-semibold block mb-2">
          Country
        </label>

        <input
          type="text"
          value={formData.country}
          onChange={(e) =>
            updateValue("country", e.target.value)
          }
          className="w-full border rounded-xl px-4 py-3"
          placeholder="India"
        />
      </div>

      {/* Climate */}

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Climate in your area
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {[
            "Hot",
            "Cold",
            "Humid",
            "Dry",
          ].map((item) => (
            <Card
              key={item}
              value={item}
              selected={formData.climate === item}
              onClick={() => updateValue("climate", item)}
            />
          ))}
        </div>
      </div>

      {/* Outdoor */}

      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">
          Time spent outdoors
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {[
            "Mostly Indoors",
            "Mixed",
            "Mostly Outdoors",
          ].map((item) => (
            <Card
              key={item}
              value={item}
              selected={formData.outdoorTime === item}
              onClick={() =>
                updateValue("outdoorTime", item)
              }
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between">

        <button
          onClick={prevStep}
          className="px-8 py-4 rounded-xl border"
        >
          ← Back
        </button>

        <button
          onClick={nextStep}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white"
        >
          Next →
        </button>

      </div>

    </div>
  );
}