import { FaCheckCircle } from "react-icons/fa";

const history = [
  {
    date: "15 July 2026",
    score: "92%",
    status: "Excellent",
  },
  {
    date: "10 July 2026",
    score: "89%",
    status: "Good",
  },
  {
    date: "05 July 2026",
    score: "86%",
    status: "Improving",
  },
];

export default function RecentAnalysis() {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Recent Analysis
      </h2>

      <div className="space-y-4">
        {history.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-5 flex justify-between items-center hover:shadow-pink-300 transition-all duration-300"
          >
            <div>
              <p className="font-semibold text-gray-800">
                {item.date}
              </p>

              <p className="text-gray-500 text-sm">
                Skin Score: {item.score}
              </p>
            </div>

            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <FaCheckCircle />
              {item.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}