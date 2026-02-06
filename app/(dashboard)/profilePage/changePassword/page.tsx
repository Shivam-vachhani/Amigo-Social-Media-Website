"use client";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/lib/apiCalls";
import { useAuth } from "@/app/context/authContext";

// TypeScript Interfaces
interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordShow {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface PasswordStrength {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

// Custom Input Component
const PasswordInput: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  showPassword: boolean;
  onToggle: () => void;
  error?: string;
  disabled?: boolean;
}> = ({
  label,
  name,
  value,
  onChange,
  onKeyPress,
  placeholder,
  showPassword,
  onToggle,
  error,
  disabled,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all pr-12 ${
            error
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
          } ${disabled ? "bg-gray-50 cursor-not-allowed" : ""}`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <XCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};

// Password Requirement Item Component
const RequirementItem: React.FC<{
  met: boolean;
  text: string;
}> = ({ met, text }) => {
  return (
    <div
      className={`flex items-center gap-2 transition-colors ${
        met ? "text-green-600" : "text-gray-500"
      }`}
    >
      {met ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
      )}
      <span className="text-sm">{text}</span>
    </div>
  );
};

// Alert Component
const Alert: React.FC<{
  type: "success" | "error";
  title: string;
  message: string;
}> = ({ type, title, message }) => {
  const styles =
    type === "success"
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200";
  const iconColor = type === "success" ? "text-green-600" : "text-red-600";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const descColor = type === "success" ? "text-green-700" : "text-red-700";
  const Icon = type === "success" ? CheckCircle : XCircle;

  return (
    <div
      className={`mb-6 p-4 border rounded-lg flex items-start gap-3 ${styles}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1">
        <p className={`font-medium ${textColor}`}>{title}</p>
        <p className={`text-sm mt-1 ${descColor}`}>{message}</p>
      </div>
    </div>
  );
};

export default function ChangePassword() {
  const [formData, setFormData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState<PasswordShow>({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const { user } = useAuth();

  // Validate password requirements
  const validatePassword = (password: string): PasswordStrength => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
    };
  };

  const passwordStrength = validatePassword(formData.newPassword);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccess(null);
  };

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      setIsLoading(false);
      setSuccess(data?.success);
      if (data?.success) {
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    },
    onError: () => {
      setIsLoading(false);
      setSuccess(false);
    },
  });

  const togglePassword = (field: keyof PasswordShow): void => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (): Promise<void> => {
    const newErrors: PasswordData = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!passwordStrength.isValid) {
      newErrors.newPassword = "Password does not meet requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    if (
      newErrors.currentPassword ||
      newErrors.newPassword ||
      newErrors.confirmPassword
    ) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    changePasswordMutation.mutate({
      userId: user?.userId as string,
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="overflow-y-auto w-full bg-gray-50 flex items-center justify-center p-5">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        {/* Left Side - Decorative Background */}
        <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center  max-w-md ">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 shadow-xl">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl lg:text-3xl font-semibold mb-4 leading-tight text-center">
              Secure Your Account
            </h2>
            <p className="text-[15px] text-white/90 mb-8 leading-relaxed">
              Keep your account safe by updating your password regularly. A
              strong password is your first line of defense.
            </p>

            {/* Security Features */}
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">End-to-End Encryption</h3>
                  <p className="text-sm text-white/80">
                    Your password is encrypted and secure
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Verified Protection</h3>
                  <p className="text-sm text-white/80">
                    Industry-standard security protocols
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Privacy First</h3>
                  <p className="text-sm text-white/80">
                    We never store your password in plain text
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:w-1/2 p-8 lg:p-8 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-3 text-center">
                Change Password
              </h1>
              <p className="text-gray-600 text-[15px]">
                Enter your current password and choose a new secure password
              </p>
            </div>

            {/* Success/Error Alerts */}
            {success === true && (
              <Alert
                type="success"
                title="Password changed successfully!"
                message="Your password has been updated. You can now use your new password to sign in."
              />
            )}

            {success === false && (
              <Alert
                type="error"
                title="Failed to change password"
                message="Please check your current password and try again."
              />
            )}

            {/* Form */}
            <div className="space-y-5">
              {/* Current Password */}
              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter current password"
                showPassword={showPasswords.current}
                onToggle={() => togglePassword("current")}
                error={errors.currentPassword}
                disabled={isLoading}
              />

              {/* New Password */}
              <PasswordInput
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter new password"
                showPassword={showPasswords.new}
                onToggle={() => togglePassword("new")}
                error={errors.newPassword}
                disabled={isLoading}
              />

              {/* Password Requirements */}
              {formData.newPassword && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-semibold text-gray-700">
                      Password Requirements
                    </p>
                  </div>
                  <div className="space-y-2">
                    <RequirementItem
                      met={passwordStrength.minLength}
                      text="At least 8 characters"
                    />
                    <RequirementItem
                      met={passwordStrength.hasUpper}
                      text="One uppercase letter (A-Z)"
                    />
                    <RequirementItem
                      met={passwordStrength.hasLower}
                      text="One lowercase letter (a-z)"
                    />
                    <RequirementItem
                      met={passwordStrength.hasNumber}
                      text="One number (0-9)"
                    />
                    <RequirementItem
                      met={passwordStrength.hasSpecial}
                      text="One special character (!@#$%...)"
                    />
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Confirm new password"
                showPassword={showPasswords.confirm}
                onToggle={() => togglePassword("confirm")}
                error={errors.confirmPassword}
                disabled={isLoading}
              />

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-lg font-semibold text-white transition-all shadow-md ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 active:scale-98 shadow-lg hover:shadow-xl"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Changing Password...
                  </span>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Security Tip
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Use a strong, unique password that you don't use for other
                    accounts. Consider using a password manager.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .active\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
