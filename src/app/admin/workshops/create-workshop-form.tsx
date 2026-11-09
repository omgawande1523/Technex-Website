
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import styles from "./create-workshop-form.module.css";

export default function CreateWorkshopForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const registrationOpensAt = formData.get("registrationOpensAt");
      const registrationClosesAt = formData.get("registrationClosesAt");

      const payload = {
        name: String(formData.get("name") || "").trim(),
        slug: String(formData.get("slug") || "").trim().toLowerCase(),
        description:
          String(formData.get("description") || "").trim() || null,
        feeAmountPaise: Math.round(
          Number(formData.get("feeAmount") || 0) * 100,
        ),
        isPublished: formData.get("isPublished") === "on",
        registrationOpen: formData.get("registrationOpen") === "on",
        registrationOpensAt: registrationOpensAt
          ? new Date(String(registrationOpensAt)).toISOString()
          : null,
        registrationClosesAt: registrationClosesAt
          ? new Date(String(registrationClosesAt)).toISOString()
          : null,
      };

      if (!payload.name || !payload.slug) {
        throw new Error("Workshop name and slug are required.");
      }

      if (
        !Number.isFinite(payload.feeAmountPaise) ||
        payload.feeAmountPaise < 0
      ) {
        throw new Error("Enter a valid registration fee.");
      }

      if (
        registrationOpensAt &&
        registrationClosesAt &&
        new Date(String(registrationClosesAt)) <=
          new Date(String(registrationOpensAt))
      ) {
        throw new Error(
          "Registration closing time must be after opening time.",
        );
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/workshops`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Failed to create workshop.");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <div>
          <p className={styles.eyebrow}>WORKSHOP CONFIGURATION</p>
          <h2 className={styles.heading}>Create New Workshop</h2>
          <p className={styles.subheading}>
            Configure workshop details, registration fees and availability.
          </p>
        </div>

        <div className={styles.headerIcon}>✦</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>01</span>
          <div>
            <h3>Basic Information</h3>
            <p>Enter the workshop name and its public description.</p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>
              Workshop Name <b>*</b>
            </span>
            <input
              className={styles.input}
              name="name"
              required
              minLength={2}
              maxLength={150}
              placeholder="Enter workshop name"
            />
          </label>

          <label className={styles.field}>
            <span>
              URL Slug <b>*</b>
            </span>
            <input
              className={styles.input}
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="example-workshop"
            />
            <small>Use lowercase letters, numbers and hyphens.</small>
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Description</span>
            <textarea
              className={styles.textarea}
              name="description"
              maxLength={5000}
              rows={5}
              placeholder="Describe the workshop and what participants can expect..."
            />
          </label>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>02</span>
          <div>
            <h3>Workshop Configuration</h3>
            <p>Set the workshop registration fee.</p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Registration Fee (₹)</span>
            <input
              className={styles.input}
              name="feeAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              placeholder="0"
            />
            <small>Enter 0 if the workshop is free.</small>
          </label>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>03</span>
          <div>
            <h3>Registration Schedule</h3>
            <p>Set the registration opening and closing dates.</p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Registration Opens At</span>
            <input
              className={styles.input}
              name="registrationOpensAt"
              type="datetime-local"
            />
          </label>

          <label className={styles.field}>
            <span>Registration Closes At</span>
            <input
              className={styles.input}
              name="registrationClosesAt"
              type="datetime-local"
            />
          </label>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>04</span>
          <div>
            <h3>Publishing & Availability</h3>
            <p>Choose the initial visibility and registration status.</p>
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxCard}>
            <input name="isPublished" type="checkbox" />
            <span className={styles.customCheckbox} />
            <span className={styles.checkboxContent}>
              <strong>Publish Workshop</strong>
              <small>
                Make this workshop visible on the public website.
              </small>
            </span>
          </label>

          <label className={styles.checkboxCard}>
            <input name="registrationOpen" type="checkbox" />
            <span className={styles.customCheckbox} />
            <span className={styles.checkboxContent}>
              <strong>Open Registration</strong>
              <small>
                Allow participants to register for this workshop.
              </small>
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <span>!</span>
          {error}
        </div>
      )}

      <div className={styles.formFooter}>
        <p>
          <span>*</span> Required fields
        </p>

        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating Workshop..." : "Create Workshop"}
          {!loading && <span>→</span>}
        </button>
      </div>
    </form>
  );
}
