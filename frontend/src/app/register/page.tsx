"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Registration Failed");
        return;
      }

      toast.success("🎉 Registration Successful!");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-pink-500 via-pink-400 to-purple-600 text-white items-center justify-center">

        <div className="text-center px-12">

          <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-8">
            <FaUserPlus className="text-6xl" />
          </div>

          <h1 className="text-5xl font-extrabold">
            Join SkinSense AI
          </h1>

          <p className="mt-8 text-xl leading-9 text-pink-100">
            Create your account and begin your personalized skincare
            journey with AI-powered skin analysis, weather insights,
            and budget-friendly product recommendations.
          </p>

        </div>

      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center bg-pink-50 px-6 py-10">

        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md">

          <h2 className="text-4xl font-bold text-center text-pink-600">
            Create Account ✨
          </h2>

          <p className="text-center text-gray-500 mt-3 mb-8">
            Sign up to start using SkinSense AI
          </p>

          {/* Full Name */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">
              Full Name
            </label>

            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-gray-400" />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-pink-200"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">
              Email Address
            </label>

            <div className="relative">
              <FaEnvelope className="absolute left-4 top-4 text-gray-400" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-pink-200"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">
              Password
            </label>

            <div className="relative">

              <FaLock className="absolute left-4 top-4 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full border rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:ring-4 focus:ring-pink-200"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>

            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">
              Confirm Password
            </label>

            <div className="relative">

              <FaLock className="absolute left-4 top-4 text-gray-400" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full border rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:ring-4 focus:ring-pink-200"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-4 text-gray-500"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <input type="checkbox" />
            <span>
              I agree to the Terms &amp; Conditions
            </span>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700 hover:scale-105 active:scale-95 transition-all duration-300 font-semibold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login */}
          <p className="text-center mt-8 text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-pink-600 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}