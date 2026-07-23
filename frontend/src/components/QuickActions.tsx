import {
  FaClipboardList,
  FaShoppingBag,
  FaCamera,
} from "react-icons/fa";

const actions = [
  {
    title: "View Routine",
    icon: <FaClipboardList className="text-3xl text-pink-500" />,
  },
  {
    title: "Recommendations",
    icon: <FaShoppingBag className="text-3xl text-green-500" />,
  },
  {
    title: "Analyze Again",
    icon: <FaCamera className="text-3xl text-blue-500" />,
  },
];

export default function QuickActions() {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Quick Actions
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <button
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 hover:-translate-y-2 hover:shadow-pink-300 transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              {action.icon}

              <p className="mt-4 font-semibold text-gray-700">
                {action.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}