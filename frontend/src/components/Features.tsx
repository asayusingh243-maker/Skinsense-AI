import {
  FaBrain,
  FaCloudSun,
  FaWallet,
  FaChartLine
} from "react-icons/fa";

export default function Features() {

  const features = [
    {
      icon: <FaBrain size={30} />,
      title: "AI Skin Analysis",
      desc: "Detect acne, pigmentation, pores and skin type."
    },
    {
      icon: <FaCloudSun size={30} />,
      title: "Weather Based Care",
      desc: "Routine changes according to your local weather."
    },
    {
      icon: <FaWallet size={30} />,
      title: "Budget Friendly",
      desc: "Recommend products according to your budget."
    },
    {
      icon: <FaChartLine size={30} />,
      title: "Progress Tracking",
      desc: "Compare your skin improvement over time."
    }
  ];

  return (
    <section
      id="features"
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto">

        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose SkinSense AI?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {features.map((item, index) => (
            <div
              key={index}
              className="bg-pink-50 p-8 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="text-pink-600 mb-4">
                {item.icon}
              </div>

              <h3 className="font-bold text-xl mb-2">
                {item.title}
              </h3>

              <p>{item.desc}</p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}