import {
  FaStar,
  FaUserCircle,
  FaTint,
  FaCloudSun,
  FaWallet,
  FaChartLine,
} from "react-icons/fa";

type SummaryCardProps = {
  skinScore: number;
  skinType: string;
  skinTone: string;
  weather: string;
  budget: number | string;
  progress: string;
};

export default function SummaryCard({
  skinScore,
  skinType,
  skinTone,
  weather,
  budget,
  progress,
}: SummaryCardProps) {
  const summary = [
    {
      title: "Skin Score",
      value: `${skinScore}/100`,
      icon: <FaStar className="text-3xl text-yellow-500" />,
    },
    {
      title: "Skin Type",
      value: skinType || "Not available",
      icon: <FaUserCircle className="text-3xl text-pink-500" />,
    },
    {
      title: "Skin Tone",
      value: skinTone || "Not available",
      icon: <FaTint className="text-3xl text-blue-500" />,
    },
    {
      title: "Weather",
      value: weather || "Not available",
      icon: <FaCloudSun className="text-3xl text-orange-500" />,
    },
    {
      title: "Budget",
      value:
        budget === 0 || budget === "0"
          ? "Not available"
          : String(budget).startsWith("₹")
            ? String(budget)
            : `₹${budget}`,
      icon: <FaWallet className="text-3xl text-green-600" />,
    },
    {
      title: "Progress",
      value: progress,
      icon: <FaChartLine className="text-3xl text-purple-500" />,
    },
  ];

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {summary.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-pink-300"
        >
          <div className="flex items-center justify-between gap-4">
            {item.icon}

            <span className="text-right text-2xl font-bold text-gray-800">
              {item.value}
            </span>
          </div>

          <p className="mt-5 font-medium text-gray-500">
            {item.title}
          </p>
        </div>
      ))}
    </div>
  );
}