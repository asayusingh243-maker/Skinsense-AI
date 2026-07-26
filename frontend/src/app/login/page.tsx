"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaEye,
  FaEyeSlash,
  FaUserShield,
} from "react-icons/fa";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);

  /*
    Check whether the user already has a valid login cookie.

    This is especially useful when "Remember Me" was selected
    during the previous login.
  */
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/auth/me`,
          {
            withCredentials: true,
          }
        );

        if (
          response.data.success &&
          response.data.authenticated
        ) {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );

          router.replace("/dashboard");
          return;
        }
      } catch {
        /*
          A 401 response simply means the user is not logged in.
          No error message is needed here.
        */
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email: normalizedEmail,
          password,
          rememberMe,
        },
        {
          /*
            Required so the browser can receive and send
            the secure authentication cookie.
          */
          withCredentials: true,
        }
      );

      /*
        Remove the old localStorage token because authentication
        now uses a safer HttpOnly cookie.
      */
      localStorage.removeItem("token");

      /*
        The basic user profile may still be stored for displaying
        the user's name in the dashboard or navbar.

        The password is never stored here.
      */
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      toast.success("Login successful!");

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Login failed. Please try again."
        );
      } else {
        toast.error(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />

          <p className="mt-4 font-medium text-gray-600">
            Checking your login session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen">
      {/* Left Side */}
      <section className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-pink-500 via-pink-400 to-purple-600 text-white lg:flex">
        <div className="px-12 text-center">
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-white/20">
            <FaUserShield className="text-6xl" />
          </div>

          <h1 className="text-5xl font-extrabold">
            SkinSense AI
          </h1>

          <p className="mt-8 text-xl leading-9 text-pink-100">
            Your personal AI skincare assistant that
            analyzes your skin, understands your concerns,
            and recommends products that fit your budget.
          </p>
        </div>
      </section>

      {/* Right Side */}
      <section className="flex flex-1 items-center justify-center bg-pink-50 px-6 py-10">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
          <h2 className="text-center text-4xl font-bold text-pink-600">
            Welcome Back 👋
          </h2>

          <p className="mb-8 mt-3 text-center text-gray-500">
            Sign in to continue using SkinSense AI
          </p>

          {/*
            Using a real form with correct names and autocomplete
            values helps browser password managers recognize and
            recommend saved login details.
          */}
          <form
            onSubmit={handleLogin}
            autoComplete="on"
          >
            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="login-email"
                className="mb-2 block font-medium text-gray-800"
              >
                Email Address
              </label>

              <input
                id="login-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label
                htmlFor="login-password"
                className="mb-2 block font-medium text-gray-800"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-gray-900 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (currentValue) =>
                        !currentValue
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-pink-600"
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="mb-8 flex items-center justify-between gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-700">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 cursor-pointer accent-pink-600"
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  toast(
                    "Forgot-password recovery will be added next."
                  )
                }
                className="font-medium text-pink-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pink-600 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-pink-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>
          </form>

          {/* Register */}
          <p className="mt-8 text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-pink-600 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}