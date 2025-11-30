"use client";

import { useState, FormEvent } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { verifySubmitPassword, SUBMIT_PASSWORD_STORAGE_KEY } from "@/lib/password";

interface PasswordGateProps {
  t: (key: string) => string;
  onUnlock: () => void;
}

export function PasswordGate({ t, onUnlock }: PasswordGateProps) {
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError(t("auth.required"));
      return;
    }

    setIsUnlocking(true);
    try {
      const isValid = await verifySubmitPassword(passwordInput);
      if (isValid) {
        setPasswordError(null);
        if (typeof window !== "undefined") {
          localStorage.setItem(SUBMIT_PASSWORD_STORAGE_KEY, "granted");
        }
        onUnlock();
        return;
      }
      setPasswordError(t("auth.invalid"));
    } catch (error) {
      console.error("Failed to verify submit password", error);
      setPasswordError(t("auth.error"));
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {t("auth.title")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t("auth.description")}</p>
          </div>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("auth.passwordLabel")}
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              placeholder={t("auth.placeholder")}
              className={cn(
                "w-full rounded-md border p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                passwordError
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-300",
              )}
            />
            {passwordError && (
              <p className="text-sm text-red-600 mt-2">{passwordError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isUnlocking}
            className="w-full rounded-md bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUnlocking ? t("auth.unlocking") : t("auth.submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
