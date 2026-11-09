
"use client";

import type { ParticipantInput } from "@/lib/api";

type ParticipantFieldsProps = {
  participant: ParticipantInput;
  onChange: (updated: ParticipantInput) => void;
  title?: string;
  idPrefix?: string;
};

const fields: {
  name: keyof ParticipantInput;
  label: string;
  placeholder: string;
  type?: string;
}[] = [
  {
    name: "fullName",
    label: "Full Name",
    placeholder: "Enter your full name",
  },
  {
    name: "email",
    label: "Email Address",
    placeholder: "Enter your email",
    type: "email",
  },
  {
    name: "mobileNumber",
    label: "Mobile Number",
    placeholder: "Enter your mobile number",
    type: "tel",
  },
  {
    name: "state",
    label: "State",
    placeholder: "Enter your state",
  },
  {
    name: "city",
    label: "City",
    placeholder: "Enter your city",
  },
  {
    name: "collegeName",
    label: "College / Institution",
    placeholder: "Enter your college name",
  },
  {
    name: "department",
    label: "Department",
    placeholder: "e.g. Computer Engineering",
  },
  {
    name: "degree",
    label: "Degree",
    placeholder: "e.g. B.Tech",
  },
];

export default function ParticipantFields({
  participant,
  onChange,
  title = "Participant Details",
  idPrefix = "participant",
}: ParticipantFieldsProps) {
  const updateField = (
    name: keyof ParticipantInput,
    value: string,
  ) => {
    onChange({
      ...participant,
      [name]: value,
    });
  };

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">{title}</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const fieldId = `${idPrefix}-${field.name}`;

          return (
            <div key={field.name} className="space-y-2">
              <label
                htmlFor={fieldId}
                className="block text-sm font-medium"
              >
                {field.label}
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id={fieldId}
                type={field.type ?? "text"}
                value={participant[field.name]}
                onChange={(e) =>
                  updateField(field.name, e.target.value)
                }
                placeholder={field.placeholder}
                required
                className="w-full rounded-xl border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-black/50 focus:ring-2 focus:ring-black/10"
              />
            </div>
          );
        })}

        <div className="space-y-2">
          <label
            htmlFor={`${idPrefix}-gender`}
            className="block text-sm font-medium"
          >
            Gender <span className="text-red-500">*</span>
          </label>

          <select
            id={`${idPrefix}-gender`}
            value={participant.gender}
            onChange={(e) =>
              updateField(
                "gender",
                e.target.value as ParticipantInput["gender"],
              )
            }
            required
            className="w-full rounded-xl border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-black/50 focus:ring-2 focus:ring-black/10"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </section>
  );
}
