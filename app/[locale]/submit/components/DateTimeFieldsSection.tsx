"use client";

import { ChangeEvent } from "react";
import { FormSection, DateTimeField } from "@/components/FormControls";

interface DateTimeFieldConfig {
  name: string;
  labelKey: string;
  required?: boolean;
  errorKey?: string;
}

interface DateTimeFieldsSectionProps {
  title: string;
  description?: string;
  fields: DateTimeFieldConfig[];
  formData: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}

export function DateTimeFieldsSection({
  title,
  description,
  fields,
  formData,
  errors,
  onChange,
  t,
}: DateTimeFieldsSectionProps) {
  return (
    <FormSection title={title} description={description}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {fields.map((field) => (
          <DateTimeField
            key={field.name}
            label={t(field.labelKey)}
            name={field.name}
            value={String(formData[field.name] ?? "")}
            onChange={onChange}
            required={field.required}
            error={field.errorKey ? errors[field.errorKey] : errors[field.name]}
          />
        ))}
      </div>
    </FormSection>
  );
}

// Predefined field configurations for common use cases
export const EVENT_TIMELINE_FIELDS: DateTimeFieldConfig[] = [
  { name: "eventStart", labelKey: "fields.eventStart.label", required: true },
  { name: "eventEnd", labelKey: "fields.eventEnd.label", required: true },
];

export const REGISTRATION_FIELDS: DateTimeFieldConfig[] = [
  { name: "registrationStart", labelKey: "fields.registrationStart.label" },
  { name: "registrationEnd", labelKey: "fields.registrationEnd.label" },
];
