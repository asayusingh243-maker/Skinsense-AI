import {
  FaCamera,
  FaBrain,
  FaCloudSun,
  FaWallet,
  FaShoppingBag,
  FaCalendarCheck,
} from "react-icons/fa";

const steps = [
  {
    icon: <FaCamera className="text-4xl text-pink-600" />,
    title: "Upload Selfie",
    description: "Take or upload a clear photo of your face.",
  },
  {
    icon: <FaBrain className="text-4xl text-purple-600" />,
    title: "AI Analysis",
    description: "Our AI analyzes skin type, tone, acne, pores, and pigmentation.",
  },
  {
    icon: <FaCloudSun className="text-4xl text-yellow-500" />,
    title: "Weather Check",
    description: "Local weather is considered before recommending products.",
  },
  {
    icon: <FaWallet className="text-4xl text-green-600" />,
    title: "Set Budget",
    description: "Choose a budget that fits your skincare goals.",
  },
  {
    icon: <FaShoppingBag className="text-4xl text-pink-500" />,
    title: "Recommendations",
    description: "Receive personalized skincare products and routines.",
  },
  {
    icon: <FaCalendarCheck className="text-4xl text-blue-600" />,
    title: "Track Progress",
    description: "Monitor improvements with your personal skin score.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-pink-50">
      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-pink-700 mb-4">
          How SkinSense AI Works
        </h2>

        <p className="text-center text-gray-600 mb-16">
          Just six simple steps to healthier skin.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 text-center hover:-translate-y-2 hover:shadow-pink-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-center mb-5">
                {step.icon}
              </div>

              <h3 className="text-2xl font-semibold mb-3">
                {step.title}
              </h3>

              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}