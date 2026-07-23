"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ProgressBar from "@/components/questionnaire/ProgressBar";
import PersonalInfo from "@/components/questionnaire/PersonalInfo";
import SkinAssessment from "@/components/questionnaire/SkinAssessment";
import Lifestyle from "@/components/questionnaire/Lifestyle";
import BudgetLocation from "@/components/questionnaire/BudgetLocation";
import ReviewSubmit from "@/components/questionnaire/ReviewSubmit";

export default function QuestionnairePage() {
  const router = useRouter();

  const totalSteps = 5;

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Personal
    name: "",
    age: "",
    gender: "",

    // Skin
    skinFeeling: "",
    acne: "",
    pigmentation: "",
    pores: "",
    sensitiveSkin: "",
    oiliness: "",
    sunExposure: "",
    makeupUsage: "",
    faceWash: "",

    // Lifestyle
    sleep: "",
    water: "",
    stress: "",
    exercise: "",
    sunscreen: "",
    routine: "",

    // Budget & Location
    budget: "",
    city: "",
    country: "",
    climate: "",
    outdoorTime: "",
  });

  const nextStep = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const finishQuestionnaire = () => {
    localStorage.setItem(
      "questionnaire",
      JSON.stringify(formData)
    );

    router.push("/results");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-6">

      <div className="max-w-4xl mx-auto">

        <ProgressBar
          currentStep={step}
          totalSteps={totalSteps}
        />

        {/* STEP 1 */}

        {step === 1 && (
          <PersonalInfo
            formData={formData}
            handleChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
            nextStep={nextStep}
          />
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <SkinAssessment
            formData={{
              skinFeeling: formData.skinFeeling,
              acne: formData.acne,
              pigmentation: formData.pigmentation,
              pores: formData.pores,
              sensitiveSkin: formData.sensitiveSkin,
              oiliness: formData.oiliness,
              sunExposure: formData.sunExposure,
              makeupUsage: formData.makeupUsage,
              faceWash: formData.faceWash,
            }}
            setFormData={(skinData) =>
              setFormData((prev) => ({
                ...prev,
                ...skinData,
              }))
            }
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {/* STEP 3 */}

        {step === 3 && (
          <Lifestyle
            formData={{
              sleep: formData.sleep,
              water: formData.water,
              stress: formData.stress,
              exercise: formData.exercise,
              sunscreen: formData.sunscreen,
              routine: formData.routine,
            }}
            setFormData={(lifestyleData) =>
              setFormData((prev) => ({
                ...prev,
                ...lifestyleData,
              }))
            }
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {/* STEP 4 */}

        {step === 4 && (
          <BudgetLocation
            formData={{
              budget: formData.budget,
              city: formData.city,
              country: formData.country,
              climate: formData.climate,
              outdoorTime: formData.outdoorTime,
            }}
            setFormData={(budgetData) =>
              setFormData((prev) => ({
                ...prev,
                ...budgetData,
              }))
            }
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {/* STEP 5 */}

        {step === 5 && (
          <ReviewSubmit
            formData={formData}
            prevStep={prevStep}
            finishQuestionnaire={finishQuestionnaire}
          />
        )}

      </div>

    </div>
  );
}