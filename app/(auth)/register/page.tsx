"use client";
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Lock,
  UserPlus,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { RegisterUser } from "@/lib/interfaces";
import { api } from "@/lib/axios";
import Link from "next/link";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterUser>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<RegisterUser>({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  // Calculate password strength (0-5)
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-orange-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  // Get the first error message to display at bottom
  const getFirstError = () => {
    if (errors.name) return errors.name;
    if (errors.email) return errors.email;
    if (errors.password) return errors.password;
    return "";
  };

  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }
    if (passwordStrength < 5) {
      return "Password must meet all requirements";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name as keyof RegisterUser;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;

    // Only hide password requirements on blur, don't validate
    if (name === "password") {
      setPasswordFocus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
    });

    if (!nameError && !emailError && !passwordError) {
      setIsLoading(true);
      try {
        const res = await api.post("/register", formData);
        const data = res.data;
        console.log("Response data:", data);
      } catch (error) {
        console.error("Registration error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-3 shadow-lg">
          <UserPlus className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Join Amigo Today!
        </h2>
        <p className="text-sm text-gray-600">
          Create your account to get started
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Full Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User
                className={`h-5 w-5 transition-colors ${
                  errors.name
                    ? "text-red-400"
                    : "text-gray-400 group-focus-within:text-blue-500"
                }`}
              />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all text-gray-800 ${
                errors.name
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail
                className={`h-5 w-5 transition-colors ${
                  errors.email
                    ? "text-red-400"
                    : "text-gray-400 group-focus-within:text-blue-500"
                }`}
              />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all text-gray-800 ${
                errors.email
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock
                className={`h-5 w-5 transition-colors ${
                  errors.password
                    ? "text-red-400"
                    : "text-gray-400 group-focus-within:text-blue-500"
                }`}
              />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={() => setPasswordFocus(true)}
              className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all text-gray-800 ${
                errors.password
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
              placeholder="Create a strong password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>

          {/* Password Strength Bar */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      level <= passwordStrength
                        ? getStrengthColor()
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              {passwordStrength > 0 && (
                <p className="text-xs font-medium text-gray-600">
                  Password strength: {getStrengthText()}
                </p>
              )}
            </div>
          )}

          {/* Compact Requirements on Focus */}
          {passwordFocus && (
            <div className="mt-2.5 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Requirements:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  {passwordChecks.length ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span
                    className={
                      passwordChecks.length
                        ? "text-green-700 font-medium"
                        : "text-gray-600"
                    }
                  >
                    8+ characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {passwordChecks.uppercase ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span
                    className={
                      passwordChecks.uppercase
                        ? "text-green-700 font-medium"
                        : "text-gray-600"
                    }
                  >
                    Uppercase
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {passwordChecks.lowercase ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span
                    className={
                      passwordChecks.lowercase
                        ? "text-green-700 font-medium"
                        : "text-gray-600"
                    }
                  >
                    Lowercase
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {passwordChecks.number ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span
                    className={
                      passwordChecks.number
                        ? "text-green-700 font-medium"
                        : "text-gray-600"
                    }
                  >
                    Number
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs col-span-2">
                  {passwordChecks.special ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span
                    className={
                      passwordChecks.special
                        ? "text-green-700 font-medium"
                        : "text-gray-600"
                    }
                  >
                    Special character
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Single Error Message at Bottom */}
        {getFirstError() && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Please fill required fields
                </p>
                <p className="text-sm text-red-700 mt-0.5">{getFirstError()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-xl font-bold text-base transition-all focus:outline-none shadow-lg ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create Account
              <Sparkles className="w-5 h-5" />
            </span>
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <p className="mt-5 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
