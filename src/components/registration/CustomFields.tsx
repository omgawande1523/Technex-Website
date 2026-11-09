
"use client";

import { useId } from "react";
import type {
  EventFormField,
  RegistrationAnswerInput,
} from "@/lib/api";

type CustomFieldsProps = {
  fields: EventFormField[];
  answers: RegistrationAnswerInput[];
  onChange: (answers: RegistrationAnswerInput[]) => void;
  scope: "registration" | "participant";
  participantIndex?: number;
  title?: string;
  showValidationErrors?: boolean;
};

export default function CustomFields({
  fields,
  answers,
  onChange,
  scope,
  participantIndex,
  title,
  showValidationErrors = false,
}: CustomFieldsProps) {
  const componentId = useId();
  const visibleFields = fields
    .filter((field) => field.scope === scope)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const getAnswer = (fieldId: string) => {
    return answers.find(
      (item) =>
        item.fieldId === fieldId &&
        item.participantIndex === participantIndex,
    )?.answer;
  };

  const updateAnswer = (fieldId: string, value: unknown) => {
    const existingIndex = answers.findIndex(
      (item) =>
        item.fieldId === fieldId &&
        item.participantIndex === participantIndex,
    );

    const updatedAnswers = [...answers];

    const answer: RegistrationAnswerInput = {
      fieldId,
      answer: value,
      ...(scope === "participant" && participantIndex !== undefined
        ? { participantIndex }
        : {}),
    };

    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = answer;
    } else {
      updatedAnswers.push(answer);
    }

    onChange(updatedAnswers);
  };

  if (visibleFields.length === 0) return null;

  const inputClass =
    "w-full rounded-xl border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-black/50 focus:ring-2 focus:ring-black/10";

  return (
    <section className="space-y-6">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {visibleFields.map((field) => {
          const value = getAnswer(field.id);
          const fieldId = `${componentId}-${scope}-${participantIndex ?? "registration"}-${field.id}`;
          const errorId = `${fieldId}-error`;
          const isGroupedField =
            field.fieldType === "radio" ||
            field.fieldType === "multi_select";
          const validation = field.validation ?? {};

          const minLength =
            typeof validation.minLength === "number"
              ? validation.minLength
              : undefined;

          const maxLength =
            typeof validation.maxLength === "number"
              ? validation.maxLength
              : undefined;

          const min =
            typeof validation.min === "number"
              ? validation.min
              : undefined;

          const max =
            typeof validation.max === "number"
              ? validation.max
              : undefined;

          return (
            <div
              key={field.id}
              className="space-y-2"
            >
              {isGroupedField ? (
                <span
                  id={`${fieldId}-label`}
                  className="block text-sm font-medium"
                >
                  {field.label}
                  {field.isRequired && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </span>
              ) : (
                <label
                  htmlFor={fieldId}
                  id={`${fieldId}-label`}
                  className="block text-sm font-medium"
                >
                  {field.label}
                  {field.isRequired && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>
              )}

              {field.fieldType === "short_text" ||
              field.fieldType === "email" ||
              field.fieldType === "url" ? (
                <input
                  id={fieldId}
                  type={
                    field.fieldType === "short_text"
                      ? "text"
                      : field.fieldType
                  }
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) =>
                    updateAnswer(field.id, e.target.value)
                  }
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required={field.isRequired}
                  minLength={minLength}
                  maxLength={maxLength}
                  className={inputClass}
                />
              ) : field.fieldType === "number" ? (
                <input
                  id={fieldId}
                  type="number"
                  value={
                    typeof value === "number" || typeof value === "string"
                      ? value
                      : ""
                  }
                  onChange={(e) =>
                    updateAnswer(
                      field.id,
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value),
                    )
                  }
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required={field.isRequired}
                  min={min}
                  max={max}
                  className={inputClass}
                />
              ) : field.fieldType === "long_text" ? (
                <textarea
                  id={fieldId}
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) =>
                    updateAnswer(field.id, e.target.value)
                  }
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required={field.isRequired}
                  minLength={minLength}
                  maxLength={maxLength}
                  rows={4}
                  className={inputClass}
                />
              ) : field.fieldType === "dropdown" ? (
                <select
                  id={fieldId}
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) =>
                    updateAnswer(field.id, e.target.value)
                  }
                  required={field.isRequired}
                  className={inputClass}
                >
                  <option value="">Select an option</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.fieldType === "radio" ? (
                <div
                  className="space-y-3"
                  role="group"
                  aria-labelledby={`${fieldId}-label`}
                >
                  {field.options.map((option, index) => {
                    const optionId = `${fieldId}-${index}`;
                    return (
                      <label
                        key={optionId}
                        htmlFor={optionId}
                        className="flex items-center gap-3 text-sm"
                      >
                        <input
                          id={optionId}
                          type="radio"
                          name={`${fieldId}-radio`}
                          value={option}
                          checked={value === option}
                          onChange={() =>
                            updateAnswer(field.id, option)
                          }
                          required={field.isRequired}
                        />
                        {option}
                      </label>
                    );
                  })}
                </div>
              ) : field.fieldType === "checkbox" ? (
                <label
                  htmlFor={fieldId}
                  className="flex items-center gap-3 text-sm"
                >
                  <input
                    id={fieldId}
                    type="checkbox"
                    checked={value === true}
                    onChange={(e) =>
                      updateAnswer(field.id, e.target.checked)
                    }
                    required={field.isRequired}
                  />
                  {field.label}
                </label>
              ) : field.fieldType === "multi_select" ? (
                <div
                  className="space-y-3"
                  role="group"
                  aria-labelledby={`${fieldId}-label`}
                  aria-describedby={
                    showValidationErrors &&
                    field.isRequired &&
                    !(Array.isArray(value) && value.length > 0)
                      ? errorId
                      : undefined
                  }
                >
                  {field.options.map((option, index) => {
                    const selected = Array.isArray(value)
                      ? value
                      : [];
                    const optionId = `${fieldId}-${index}`;

                    return (
                      <label
                        key={optionId}
                        htmlFor={optionId}
                        className="flex items-center gap-3 text-sm"
                      >
                        <input
                          id={optionId}
                          type="checkbox"
                          checked={selected.includes(option)}
                          aria-invalid={
                            showValidationErrors &&
                            field.isRequired &&
                            selected.length === 0
                          }
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...selected, option]
                              : selected.filter(
                                  (item) => item !== option,
                                );

                            updateAnswer(field.id, updated);
                          }}
                        />
                        {option}
                      </label>
                    );
                  })}
                  {showValidationErrors &&
                    field.isRequired &&
                    !(Array.isArray(value) && value.length > 0) && (
                      <p
                        id={errorId}
                        className="text-sm text-red-500"
                        role="alert"
                      >
                        Select at least one option.
                      </p>
                    )}
                </div>
              ) : (
                <p className="text-sm text-red-500">
                  Unsupported field type: {field.fieldType}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
