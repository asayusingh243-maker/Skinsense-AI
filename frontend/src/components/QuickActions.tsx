"use client";

import Link from "next/link";
import {
  FaClipboardList,
  FaShoppingBag,
  FaCamera,
} from "react-icons/fa";

const actions = [
  {
    title: "View Routine",
    href: "/routine",
    icon: <FaClipboardList className="text-3xl text-pink-500" />,
  },
  {
    title: "Recommendations",
    href: "/recommendations",
    icon: <FaShoppingBag className="text-3xl text-green-500" />,
  },
  {
    title: "Analyze Again",
    href: "/analyze",
    icon: <FaCamera className="text-3xl text-blue-500" />,
  },
];

export default function QuickActions() {
  return (
    <div className="mt-10">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Quick Actions
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-pink-300"
          >
            <div className="flex flex-col items-center">
              {action.icon}

              <p className="mt-4 font-semibold text-gray-700">
                {action.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}