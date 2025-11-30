"use client";

import { AlertCircle } from "lucide-react";

interface FormErrorBannerProps {
  title: string;
  errors?: Record<string, string>;
  message?: string;
}

export function FormErrorBanner({ title, errors, message }: FormErrorBannerProps) {
  const hasErrors = errors && Object.keys(errors).length > 0;
  
  if (!hasErrors && !message) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
      <div>
        <h4 className="font-semibold text-red-900">{title}</h4>
        {hasErrors && (
          <ul className="list-disc list-inside text-sm text-red-700 mt-1">
            {Object.values(errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
        {message && <p className="text-sm text-red-700 mt-1">{message}</p>}
      </div>
    </div>
  );
}
