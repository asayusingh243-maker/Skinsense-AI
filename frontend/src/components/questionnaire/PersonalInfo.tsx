"use client";

interface PersonalInfoProps {
  formData: {
    name: string;
    age: string;
    gender: string;
    city: string;
    country: string;
  };

  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;

  nextStep: () => void;
}

export default function PersonalInfo({
  formData,
  handleChange,
  nextStep,
}: PersonalInfoProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-10">

      <div className="text-center mb-10">

        <div className="text-6xl mb-4">👤</div>

        <h1 className="text-4xl font-bold text-pink-600">
          Tell Us About Yourself
        </h1>

        <p className="text-gray-500 mt-3">
          We will use this information to personalize your skin analysis.
        </p>

      </div>

      <div className="space-y-7">

        <div>
          <label className="block font-semibold mb-2">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full border border-pink-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Age
          </label>

          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter your age"
            className="w-full border border-pink-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Gender
          </label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border border-pink-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="">Select</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">
            City
          </label>

          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Delhi"
            className="w-full border border-pink-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Country
          </label>

          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="India"
            className="w-full border border-pink-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

      </div>

      <div className="flex justify-end mt-10">

        <button
          onClick={nextStep}
          disabled={
            !formData.name ||
            !formData.age ||
            !formData.gender ||
            !formData.city ||
            !formData.country
          }
          className={`px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 ${
            formData.name &&
            formData.age &&
            formData.gender &&
            formData.city &&
            formData.country
              ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Next →
        </button>

      </div>

    </div>
  );
}