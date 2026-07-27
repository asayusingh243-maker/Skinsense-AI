"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ProgressBar from "@/components/questionnaire/ProgressBar";
import PersonalInfo from "@/components/questionnaire/PersonalInfo";
import SkinAssessment from "@/components/questionnaire/SkinAssessment";
import Lifestyle from "@/components/questionnaire/Lifestyle";
import BudgetLocation from "@/components/questionnaire/BudgetLocation";
import ReviewSubmit from "@/components/questionnaire/ReviewSubmit";

interface EnvironmentData {
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPercent: number;
  precipitationMm: number;

  weatherCode: number | null;
  weatherCondition: string;

  uvIndex: number;

  aqi: number;
  pm25: number;
  pm10: number;
  ozone: number;

  timezone: string;
  capturedAt: string;
  dataSource: string;
}

interface QuestionnaireData {
  // Personal information
  name: string;
  age: string;
  gender: string;

  // Skin assessment
  skinFeeling: string;
  acne: string;
  pigmentation: string;
  pores: string;
  sensitiveSkin: string;
  oiliness: string;
  sunExposure: string;
  makeupUsage: string;
  faceWash: string;

  // Lifestyle
  sleep: string;
  water: string;
  stress: string;
  exercise: string;
  sunscreen: string;
  routine: string;

  // Budget and location
  budget: string;
  city: string;
  country: string;
  climate: string;
  outdoorTime: string;

  // Current weather and air-quality summary
  environment: EnvironmentData | null;
}

const initialFormData: QuestionnaireData = {
  // Personal information
  name: "",
  age: "",
  gender: "",

  // Skin assessment
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

  // Budget and location
  budget: "",
  city: "",
  country: "",
  climate: "",
  outdoorTime: "",

  // Environment
  environment: null,
};

export default function QuestionnairePage() {
  const router = useRouter();

  const totalSteps = 5;

  const [step, setStep] = useState(1);

  const [formData, setFormData] =
    useState<QuestionnaireData>(initialFormData);

  const updateFormData = (
    data: Partial<QuestionnaireData>
  ) => {
    setFormData((previousData) => ({
      ...previousData,
      ...data,
    }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep((previousStep) => previousStep + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((previousStep) => previousStep - 1);
    }
  };

  const finishQuestionnaire = () => {
    /*
      This saves the questionnaire together with the
      summarized environmental information.

      Exact latitude and longitude are not stored.
    */
    localStorage.setItem(
      "questionnaire",
      JSON.stringify(formData)
    );

    router.push("/results");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <ProgressBar
          currentStep={step}
          totalSteps={totalSteps}
        />

        {/* Step 1: Personal information */}

        {step === 1 && (
          <PersonalInfo
            formData={formData}
            handleChange={(event) =>
              updateFormData({
                [event.target.name]:
                  event.target.value,
              })
            }
            nextStep={nextStep}
          />
        )}

        {/* Step 2: Skin assessment */}

        {step === 2 && (
          <SkinAssessment
            formData={{
              skinFeeling: formData.skinFeeling,
              acne: formData.acne,
              pigmentation: formData.pigmentation,
              pores: formData.pores,
              sensitiveSkin:
                formData.sensitiveSkin,
              oiliness: formData.oiliness,
              sunExposure: formData.sunExposure,
              makeupUsage: formData.makeupUsage,
              faceWash: formData.faceWash,
            }}
            setFormData={(skinData) =>
              updateFormData(skinData)
            }
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {/* Step 3: Lifestyle */}

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
              updateFormData(lifestyleData)
            }
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {/* Step 4: Budget, location and weather */}

        {step === 4 && (
          <BudgetLocation
            formData={{
              budget: formData.budget,
              city: formData.city,
              country: formData.country,
              climate: formData.climate,
              outdoorTime: formData.outdoorTime,
              environment: formData.environment,
            }}
            setFormData={(budgetLocationData) =>
              updateFormData(
                budgetLocationData
              )
            }
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {/* Step 5: Review and submit */}

        {step === 5 && (
          <ReviewSubmit
            formData={formData}
            prevStep={prevStep}
            finishQuestionnaire={
              finishQuestionnaire
            }
          />
        )}
      </div>
    </main>
  );
}