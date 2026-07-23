"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqs = [
  {
    question: "How does SkinSense AI analyze my skin?",
    answer:
      "SkinSense AI uses AI-powered image analysis to detect your skin type, tone, acne, pigmentation, pores, and other visible skin conditions.",
  },
  {
    question: "Is my uploaded selfie secure?",
    answer:
      "Yes. Your images are securely processed and are never shared with third parties without your permission.",
  },
  {
    question: "Can I set my own skincare budget?",
    answer:
      "Absolutely! You can choose your preferred budget, and SkinSense AI will recommend products that fit your price range.",
  },
  {
    question: "Does weather affect the recommendations?",
    answer:
      "Yes. Weather conditions like temperature, humidity, and UV index are considered to provide personalized skincare advice.",
  },
  {
    question: "Can I track my skin progress?",
    answer:
      "Yes. Every analysis is saved so you can monitor your Skin Score and improvements over time.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-pink-50">
      <div className="max-w-4xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-pink-700 mb-4">
          Frequently Asked Questions
        </h2>

        <p className="text-center text-gray-600 mb-14">
          Everything you need to know about SkinSense AI.
        </p>

        <div className="space-y-5">

          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 text-left font-semibold text-lg hover:bg-pink-50 transition"
              >
                {faq.question}

                {openIndex === index ? (
                  <FaChevronUp className="text-pink-600" />
                ) : (
                  <FaChevronDown className="text-pink-600" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 leading-7">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}