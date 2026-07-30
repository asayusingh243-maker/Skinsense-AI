import { FaCheckCircle } from "react-icons/fa";

type Scan = {
  id: string;
  skinScore: number;
  createdAt: string;
};

type RecentAnalysisProps = {
  scans: Scan[];
};

function getStatus(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Improving";
  return "Needs Attention";
}

export default function RecentAnalysis({
  scans,
}: RecentAnalysisProps) {
  return (
    <div className="mt-10">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Recent Analysis
      </h2>

      {scans.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-gray-500">
            No previous analyses found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-lg transition-all duration-300 hover:shadow-pink-300"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {new Date(scan.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>

                <p className="text-sm text-gray-500">
                  Skin Score: {scan.skinScore}/100
                </p>
              </div>

              <div className="flex items-center gap-2 font-semibold text-green-600">
                <FaCheckCircle />
                {getStatus(scan.skinScore)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}