
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "./create-event-form.module.css";

export default function CreateEventForm() {
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

      const payload = {
        name: String(formData.get("name") || "").trim(),
        slug: String(formData.get("slug") || "").trim(),
        description:
          String(formData.get("description") || "").trim() || null,
        eventType: String(formData.get("eventType")),
        feeType: String(formData.get("feeType")),
        feeAmountPaise: Math.round(
          Number(formData.get("feeAmountPaise") || 0) * 100,
        ),
        minParticipants: Number(formData.get("minParticipants") || 1),
        maxParticipants: Number(formData.get("maxParticipants") || 1),
        isPublished: formData.get("isPublished") === "on",
        registrationOpen: formData.get("registrationOpen") === "on",
        registrationOpensAt: formData.get("registrationOpensAt")
          ? new Date(
              String(formData.get("registrationOpensAt")),
            ).toISOString()
          : null,
        registrationClosesAt: formData.get("registrationClosesAt")
          ? new Date(
              String(formData.get("registrationClosesAt")),
            ).toISOString()
          : null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/events`,
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

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create event.",
        );
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
      {/* Header */}
      <div className={styles.formHeader}>
        <div>
          <p className={styles.eyebrow}>EVENT CONFIGURATION</p>
          <h2 className={styles.heading}>Create New Event</h2>
          <p className={styles.subheading}>
            Configure your event details, participation rules and registration settings.
          </p>
        </div>

        <div className={styles.headerIcon}>✦</div>
      </div>

      {/* Basic Information */}
      <div className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>01</span>
          <div>
            <h3>Basic Information</h3>
            <p>Enter the event name and its public description.</p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Event Name <b>*</b></span>
            <input
              className={styles.input}
              name="name"
              required
              minLength={2}
              maxLength={150}
              placeholder="Enter event name"
            />
          </label>

          <label className={styles.field}>
            <span>URL Slug <b>*</b></span>
            <input
              className={styles.input}
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="example-event"
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
              placeholder="Describe the event, its objectives and what participants can expect..."
            />
          </label>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Event Configuration */}
      <div className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>02</span>
          <div>
            <h3>Event Configuration</h3>
            <p>Define the event format, fee structure and participant limits.</p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Event Format</span>
            <select
              className={styles.select}
              name="eventType"
              defaultValue="individual"
            >
              <option value="individual">Individual</option>
              <option value="team">Team</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Fee Type</span>
            <select
              className={styles.select}
              name="feeType"
              defaultValue="free"
            >
              <option value="free">Free</option>
              <option value="per_participant">Per Participant</option>
              <option value="per_team">Per Team</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Fee Amount (₹)</span>
            <input
              className={styles.input}
              name="feeAmountPaise"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
              placeholder="0"
            />
          </label>

          <label className={styles.field}>
            <span>Minimum Participants</span>
            <input
              className={styles.input}
              name="minParticipants"
              type="number"
              min="1"
              defaultValue="1"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Maximum Participants</span>
            <input
              className={styles.input}
              name="maxParticipants"
              type="number"
              min="1"
              defaultValue="1"
              required
            />
          </label>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Registration Schedule */}
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

      {/* Publishing Settings */}
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
              <strong>Publish Event</strong>
              <small>Make this event visible on the public website.</small>
            </span>
          </label>

          <label className={styles.checkboxCard}>
            <input name="registrationOpen" type="checkbox" />
            <span className={styles.customCheckbox} />

            <span className={styles.checkboxContent}>
              <strong>Open Registration</strong>
              <small>Allow participants to register for this event.</small>
            </span>
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.error} role="alert">
          <span>!</span>
          {error}
        </div>
      )}

      {/* Footer */}
      <div className={styles.formFooter}>
        <p>
          <span>*</span> Required fields
        </p>

        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating Event..." : "Create Event"}
          {!loading && <span>→</span>}
        </button>
      </div>
    </form>
  );
}
