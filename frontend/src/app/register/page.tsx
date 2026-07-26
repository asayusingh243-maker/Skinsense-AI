"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName = name.trim();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (
      !trimmedName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (trimmedName.length < 2) {
      toast.error(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (password.length < 8) {
      toast.error(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      toast.error(
        "Please accept the Terms & Conditions."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            email: normalizedEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Registration failed."
        );
      }

      toast.success(
        "Account created successfully! Please sign in."
      );

      /*
        Do not save the password in localStorage.

        The browser password manager can recognize this
        registration form through the autocomplete attributes
        and may offer to save the credentials.
      */
      router.push(
        `/login?email=${encodeURIComponent(
          normalizedEmail
        )}`
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      if (error instanceof TypeError) {
        toast.error(
          "Could not connect to the backend server."
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Registration failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Left Side */}
      <section className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-pink-500 via-pink-400 to-purple-600 text-white lg:flex">
        <div className="px-12 text-center">
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-white/20">
            <FaUserPlus className="text-6xl" />
          </div>

          <h1 className="text-5xl font-extrabold">
            Join SkinSense AI
          </h1>

          <p className="mt-8 text-xl leading-9 text-pink-100">
            Create your account and begin your
            personalized skincare journey with
            AI-powered skin analysis, weather
            insights, and budget-friendly product
            recommendations.
          </p>
        </div>
      </section>

      {/* Right Side */}
      <section className="flex flex-1 items-center justify-center bg-pink-50 px-6 py-10">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
          <h2 className="text-center text-4xl font-bold text-pink-600">
            Create Account ✨
          </h2>

          <p className="mb-8 mt-3 text-center text-gray-500">
            Sign up to start using SkinSense AI
          </p>

          <form
            onSubmit={handleRegister}
            autoComplete="on"
          >
            {/* Full Name */}
            <div className="mb-5">
              <label
                htmlFor="register-name"
                className="mb-2 block font-medium text-gray-800"
              >
                Full Name
              </label>

              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                  minLength={2}
                  maxLength={60}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-gray-900 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="register-email"
                className="mb-2 block font-medium text-gray-800"
              >
                Email Address
              </label>

              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-gray-900 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label
                htmlFor="register-password"
                className="mb-2 block font-medium text-gray-800"
              >
                Password
              </label>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  id="register-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Create a password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 text-gray-900 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
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

              <p className="mt-2 text-xs text-gray-500">
                Use at least 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div className="mb-5">
              <label
                htmlFor="register-confirm-password"
                className="mb-2 block font-medium text-gray-800"
              >
                Confirm Password
              </label>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 text-gray-900 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (currentValue) =>
                        !currentValue
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-pink-600"
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
            <div className="mb-8 flex items-start gap-2 text-sm text-gray-700">
              <input
                id="accept-terms"
                name="acceptTerms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) =>
                  setAcceptedTerms(
                    event.target.checked
                  )
                }
                required
                className="mt-1 h-4 w-4 cursor-pointer accent-pink-600"
              />

              <label
                htmlFor="accept-terms"
                className="cursor-pointer"
              >
                I agree to the Terms &amp;
                Conditions
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pink-600 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-pink-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <p className="mt-8 text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-pink-600 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}