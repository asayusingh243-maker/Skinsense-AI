"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaUserShield } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      toast.success("🎉 Login Successful!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Login Failed"
        );
      } else {
        toast.error("Something went wrong.");
      }
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
            <FaUserShield className="text-6xl" />
          </div>

          <h1 className="text-5xl font-extrabold">
            SkinSense AI
          </h1>

          <p className="mt-8 text-xl leading-9 text-pink-100">
            Your personal AI skincare assistant that analyzes your skin,
            understands your concerns, and recommends products that fit
            your budget.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center bg-pink-50 px-6 py-10">
        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md">
          <h2 className="text-4xl font-bold text-center text-pink-600">
            Welcome Back 👋
          </h2>

          <p className="text-center text-gray-500 mt-3 mb-8">
            Sign in to continue using SkinSense AI
          </p>

          {/* Email */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block mb-2 font-medium">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-4 focus:ring-pink-200"
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

          {/* Remember Me */}
          <div className="flex justify-between items-center text-sm mb-8">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember Me
            </label>

            <button
              type="button"
              className="text-pink-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700 hover:scale-105 active:scale-95 transition-all duration-300 font-semibold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Register */}
          <p className="text-center mt-8 text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-pink-600 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}