"use client";

import Link from "next/link";
import { FaBell, FaUserCircle } from "react-icons/fa";

export default function DashboardNavbar() {
  return (
    <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
      <Link
        href="/"
        className="text-3xl font-extrabold text-pink-600"
      >
        SkinSense AI
      </Link>

      <div className="flex items-center gap-6">
        <button className="text-2xl text-gray-600 hover:text-pink-600 transition">
          <FaBell />
        </button>

        <div className="flex items-center gap-3">
          <FaUserCircle className="text-4xl text-pink-600" />

          <div>
            <p className="font-semibold">Ayushi</p>
            <p className="text-sm text-gray-500">
              Premium User
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}