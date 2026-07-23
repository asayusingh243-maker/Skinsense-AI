import {
  FaStar,
  FaUserCircle,
  FaTint,
  FaCloudSun,
  FaWallet,
  FaChartLine,
} from "react-icons/fa";

const summary = [
  {
    title: "Skin Score",
    value: "92%",
    icon: <FaStar className="text-yellow-500 text-3xl" />,
  },
  {
    title: "Skin Type",
    value: "Combination",
    icon: <FaUserCircle className="text-pink-500 text-3xl" />,
  },
  {
    title: "Skin Tone",
    value: "Warm",
    icon: <FaTint className="text-blue-500 text-3xl" />,
  },
  {
    title: "Weather",
    value: "34°C Sunny",
    icon: <FaCloudSun className="text-orange-500 text-3xl" />,
  },
  {
    title: "Budget",
    value: "₹1000",
    icon: <FaWallet className="text-green-600 text-3xl" />,
  },
  {
    title: "Progress",
    value: "Excellent",
    icon: <FaChartLine className="text-purple-500 text-3xl" />,
  },
];

export default function SummaryCard() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
      {summary.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg p-6 hover:-translate-y-2 hover:shadow-pink-300 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            {item.icon}

            <span className="text-2xl font-bold text-gray-800">
              {item.value}
            </span>
          </div>

          <p className="mt-5 text-gray-500 font-medium">
            {item.title}
          </p>
        </div>
      ))}
    </div>
  );
}