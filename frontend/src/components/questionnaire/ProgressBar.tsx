"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-10">

      <div className="flex justify-between items-center mb-3">

        <h2 className="text-2xl font-bold text-pink-600">
          SkinSense AI Assessment
        </h2>

        <span className="text-gray-600 font-semibold">
          Step {currentStep} of {totalSteps}
        </span>

      </div>

      <div className="w-full bg-pink-100 rounded-full h-3 overflow-hidden">

        <div
          className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}