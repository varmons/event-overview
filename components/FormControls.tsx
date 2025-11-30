/**
 * @fileoverview Reusable form control components.
 * Provides consistent styling and behavior for form inputs.
 */

"use client";

import {
  ReactNode,
  SelectHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

/** Option for select dropdowns */
type Option = { value: string; label: string };

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

interface BaseFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children?: ReactNode;
  className?: string;
}

const FieldWrapper = ({
  label,
  required,
  error,
  helperText,
  children,
  className,
}: BaseFieldProps) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {helperText && !error && (
      <p className="text-xs text-gray-500 mt-1">{helperText}</p>
    )}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export function InputField(
  props: BaseFieldProps &
    InputHTMLAttributes<HTMLInputElement> & {
      rightSlot?: ReactNode;
    },
) {
  const { label, required, error, helperText, className, rightSlot, ...rest } =
    props;
  return (
    <FieldWrapper
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={className}
    >
      <div className="relative">
        <input
          {...rest}
          className={cn(
            "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
            rightSlot ? "pr-9" : "",
            error ? "border-red-300 focus:ring-red-200" : "border-gray-300",
          )}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-2 flex items-center text-gray-400">
            {rightSlot}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}

export function TextareaField(
  props: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { label, required, error, helperText, className, ...rest } = props;
  return (
    <FieldWrapper
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={className}
    >
      <textarea
        {...rest}
        className={cn(
          "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
          error ? "border-red-300 focus:ring-red-200" : "border-gray-300",
        )}
      />
    </FieldWrapper>
  );
}

export function SelectField(
  props: BaseFieldProps &
    SelectHTMLAttributes<HTMLSelectElement> & {
      options: Option[];
    },
) {
  const { label, required, error, helperText, options, className, ...rest } =
    props;
  return (
    <FieldWrapper
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={className}
    >
      <select
        {...rest}
        className={cn(
          "w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all",
          error ? "border-red-300 focus:ring-red-200" : "border-gray-300",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

export function DateTimeField(
  props: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <InputField {...props} type="datetime-local" className={props.className} />
  );
}

export function CheckboxField(
  props: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>,
) {
  const { label, required, error, helperText, className, ...rest } = props;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        {...rest}
        type="checkbox"
        className={cn(
          "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
          error ? "border-red-400" : "",
        )}
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        {helperText && !error && (
          <span className="text-xs text-gray-500">{helperText}</span>
        )}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </div>
  );
}
