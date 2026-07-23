"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

        <h1 className="text-2xl font-bold text-pink-600">
          SkinSense AI
        </h1>

        <div className="flex gap-8 font-medium">
          <Link href="/">Home</Link>
          <Link href="#features">Features</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>

      </div>
    </nav>
  );
}