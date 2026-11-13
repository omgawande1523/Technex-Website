
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import styles from "./event-management.module.css";

type AdminRole = "superadmin" | "coordinator" | "event_head";

type EventItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  eventType: string;
  feeType: string;
  feeAmountPaise: number;
  minParticipants: number;
  maxParticipants: number;
  isPublished: boolean;
  registrationOpen: boolean;
  canManage: boolean;
};

type AssignableAdmin = {
  id: string;
  displayName: string;
  role: "coordinator" | "event_head";
};

type AssignedAdmin = {
  assignmentId: string;
  adminId: string;
  displayName: string;
  role: "coordinator" | "event_head";
};

type Props = {
  events: EventItem[];
  role: AdminRole;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EventManagement({
  events: initialEvents,
  role,
}: Props) {
  const router = useRouter();

  const [events, setEvents] = useState(initialEvents);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const isSuperadmin = role === "superadmin";

  const [assignableAdmins, setAssignableAdmins] = useState<
    AssignableAdmin[]
  >([]);
  const [assignedAdmins, setAssignedAdmins] = useState<
    Record<string, AssignedAdmin[]>
  >({});
  const [selectedAdmin, setSelectedAdmin] = useState<
    Record<string, string>
  >({});
  const [expandedAssignments, setExpandedAssignments] = useState<
    string | null
  >(null);
  const [assignmentLoading, setAssignmentLoading] = useState("");

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Session expired. Please log in again.");
    }

    return session.access_token;
  }

  async function apiRequest(
    path: string,
    method: string,
    body?: object,
  ) {
    if (!API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL is not configured.");
    }

    const token = await getToken();

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const text = await response.text();

    let result: {
      message?: string;
      data?: any;
    } = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(result.message || "Request failed.");
    }

    return result;
  }

  async function loadAssignments(eventId: string) {
    setAssignmentLoading(eventId);

    try {
      const [adminsResult, assignmentsResult] = await Promise.all([
        apiRequest("/api/admin/assignable", "GET"),
        apiRequest(`/api/admin/events/${eventId}/assignments`, "GET"),
      ]);

      setAssignableAdmins(adminsResult.data as AssignableAdmin[]);

      setAssignedAdmins((previous) => ({
        ...previous,
        [eventId]: assignmentsResult.data as AssignedAdmin[],
      }));
    } finally {
      setAssignmentLoading("");
    }
  }

  async function toggleAssignmentPanel(eventId: string) {
    if (expandedAssignments === eventId) {
      setExpandedAssignments(null);
      return;
    }

    setExpandedAssignments(eventId);
    setError("");

    try {
      await loadAssignments(eventId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load assignments.",
      );
    }
  }

  async function assignAdmin(eventId: string) {
    const adminId = selectedAdmin[eventId];

    if (!adminId) {
      setError("Select an admin to assign.");
      return;
    }

    setAssignmentLoading(eventId);
    setError("");

    try {
      await apiRequest(
        `/api/admin/events/${eventId}/assignments`,
        "POST",
        { adminId },
      );

      await loadAssignments(eventId);

      setSelectedAdmin((previous) => ({
        ...previous,
        [eventId]: "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assignment failed.");
    } finally {
      setAssignmentLoading("");
    }
  }

  async function removeAdmin(eventId: string, adminId: string) {
    if (!window.confirm("Remove this admin from the event?")) return;

    setAssignmentLoading(eventId);
    setError("");

    try {
      await apiRequest(
        `/api/admin/events/${eventId}/assignments/${adminId}`,
        "DELETE",
      );

      await loadAssignments(eventId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Removal failed.");
    } finally {
      setAssignmentLoading("");
    }
  }

  async function updateControl(
    event: EventItem,
    field: "isPublished" | "registrationOpen",
  ) {
    const key = `${event.id}-${field}`;

    setLoading(key);
    setError("");

    try {
      const value = !event[field];

      await apiRequest(
        `/api/admin/events/${event.id}/controls`,
        "PATCH",
        { [field]: value },
      );

      setEvents((previous) =>
        previous.map((item) =>
          item.id === event.id ? { ...item, [field]: value } : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setLoading("");
    }
  }

  async function deleteEvent(event: EventItem) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.name}"? This action cannot be undone. Events with existing registrations cannot be deleted.`,
    );

    if (!confirmed) return;

    setLoading(event.id);
    setError("");

    try {
      await apiRequest(`/api/admin/events/${event.id}`, "DELETE");

      setEvents((previous) =>
        previous.filter((item) => item.id !== event.id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deletion failed.");
    } finally {
      setLoading("");
    }
  }

  async function saveEdit(formData: FormData) {
    if (!editing) return;

    setLoading(editing.id);
    setError("");

    const payload = {
      name: String(formData.get("name") || "").trim(),
      slug: String(formData.get("slug") || "").trim(),
      description: String(formData.get("description") || "").trim() || null,
      eventType: String(formData.get("eventType")),
      feeType: String(formData.get("feeType")),
      feeAmountPaise: Math.round(
        Number(formData.get("feeAmount") || 0) * 100,
      ),
      minParticipants: Number(formData.get("minParticipants")),
      maxParticipants: Number(formData.get("maxParticipants")),
    };

    try {
      const result = await apiRequest(
        `/api/admin/events/${editing.id}`,
        "PUT",
        payload,
      );

      setEvents((previous) =>
        previous.map((item) =>
          item.id === editing.id ? { ...item, ...result.data } : item,
        ),
      );

      setEditing(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setLoading("");
    }
  }

  return (
    <section className={styles.container}>
      {/* Page heading */}
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>EVENT MANAGEMENT</p>
          <h2>Existing Events</h2>
          <p className={styles.headingDescription}>
            Manage event details, registration status and assignments.
          </p>
        </div>

        <div className={styles.eventCount}>
          <span>{events.length}</span>
          <small>Total Events</small>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className={styles.error} role="alert">
          <span className={styles.errorIcon}>!</span>
          {error}
        </div>
      )}

      {/* Event list */}
      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✦</div>
          <h3>No Events Found</h3>
          <p>No events have been created yet.</p>
        </div>
      ) : (
        <div className={styles.eventList}>
          {events.map((event) => {
            const canEdit =
              isSuperadmin ||
              (role === "coordinator" && event.canManage);

            return (
              <article key={event.id} className={styles.eventCard}>
                {/* Card header */}
                <div className={styles.cardHeader}>
                  <div className={styles.eventIdentity}>
                    <div className={styles.eventIcon}>
                      {event.name.charAt(0).toUpperCase()}
                    </div>

                    <div className={styles.eventTitle}>
                      <h3>{event.name}</h3>
                      <p>{event.slug}</p>
                    </div>
                  </div>

                  <div className={styles.statusGroup}>
                    <span
                      className={`${styles.status} ${
                        event.isPublished
                          ? styles.published
                          : styles.draft
                      }`}
                    >
                      <span className={styles.statusDot} />
                      {event.isPublished ? "Published" : "Draft"}
                    </span>

                    <span
                      className={`${styles.status} ${
                        event.registrationOpen
                          ? styles.open
                          : styles.closed
                      }`}
                    >
                      <span className={styles.statusDot} />
                      {event.registrationOpen ? "Registration Open" : "Registration Closed"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <p className={styles.description}>
                    {event.description}
                  </p>
                )}

                {/* Event information */}
                <div className={styles.eventDetails}>
                  <div className={styles.detailItem}>
                    <span>EVENT FORMAT</span>
                    <strong>
                      {event.eventType.replace("_", " ")}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>FEE TYPE</span>
                    <strong>
                      {event.feeType.replace("_", " ")}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>PARTICIPANTS</span>
                    <strong>
                      {event.minParticipants} – {event.maxParticipants}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>REGISTRATION FEE</span>
                    <strong className={styles.fee}>
                      {event.feeType === "free"
                        ? "Free"
                        : `₹${(event.feeAmountPaise / 100).toFixed(2)}`}
                    </strong>
                  </div>
                </div>

                {/* Actions */}
                {canEdit && (
                  <div className={styles.actions}>
                    <button
                      type="button"
                      disabled={!!loading}
                      onClick={() => updateControl(event, "isPublished")}
                      className={styles.actionButton}
                    >
                      {loading === `${event.id}-isPublished`
                        ? "Updating..."
                        : event.isPublished
                          ? "Unpublish"
                          : "Publish"}
                    </button>

                    <button
                      type="button"
                      disabled={!!loading}
                      onClick={() =>
                        updateControl(event, "registrationOpen")
                      }
                      className={styles.actionButton}
                    >
                      {loading === `${event.id}-registrationOpen`
                        ? "Updating..."
                        : event.registrationOpen
                          ? "Close Registration"
                          : "Open Registration"}
                    </button>

                    <button
                      type="button"
                      disabled={!!loading}
                      onClick={() => setEditing(event)}
                      className={styles.editButton}
                    >
                      <span>✎</span> Edit Event
                    </button>

                    {isSuperadmin && (
                      <button
                        type="button"
                        disabled={!!loading}
                        onClick={() => deleteEvent(event)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}

                {/* Superadmin assignment management */}
                {isSuperadmin && (
                  <div className={styles.assignmentSection}>
                    <button
                      type="button"
                      disabled={!!assignmentLoading}
                      onClick={() => toggleAssignmentPanel(event.id)}
                      className={styles.assignmentToggle}
                    >
                      <span className={styles.assignmentToggleLeft}>
                        <span className={styles.assignmentIcon}>♙</span>
                        Manage Assigned Administrators
                      </span>

                      <span className={styles.assignmentPlus}>
                        {expandedAssignments === event.id ? (
                          <Minus size={16} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <Plus size={16} strokeWidth={2} aria-hidden="true" />
                        )}
                      </span>
                    </button>

                    {expandedAssignments === event.id && (
                      <div className={styles.assignmentPanel}>
                        <div className={styles.assignmentHeading}>
                          <div>
                            <h4>Event Administrators</h4>
                            <p>Assign coordinators or event heads to this event.</p>
                          </div>
                        </div>

                        {assignmentLoading === event.id ? (
                          <p className={styles.loadingText}>
                            Loading assignments...
                          </p>
                        ) : (
                          <>
                            <div className={styles.assignForm}>
                              <select
                                value={selectedAdmin[event.id] || ""}
                                onChange={(e) =>
                                  setSelectedAdmin((previous) => ({
                                    ...previous,
                                    [event.id]: e.target.value,
                                  }))
                                }
                                className={styles.selectInput}
                              >
                                <option value="">
                                  Select Coordinator or Event Head
                                </option>

                                {assignableAdmins
                                  .filter(
                                    (admin) =>
                                      !(assignedAdmins[event.id] || []).some(
                                        (assigned) =>
                                          assigned.adminId === admin.id,
                                      ),
                                  )
                                  .map((admin) => (
                                    <option
                                      key={admin.id}
                                      value={admin.id}
                                    >
                                      {admin.displayName} —{" "}
                                      {admin.role.replace("_", " ")}
                                    </option>
                                  ))}
                              </select>

                              <button
                                type="button"
                                disabled={
                                  !!assignmentLoading ||
                                  !selectedAdmin[event.id]
                                }
                                onClick={() => assignAdmin(event.id)}
                                className={styles.assignButton}
                              >
                                {assignmentLoading === event.id
                                  ? "Assigning..."
                                  : "＋ Assign Admin"}
                              </button>
                            </div>

                            <div className={styles.assignedList}>
                              <div className={styles.assignedListHeader}>
                                <h5>Currently Assigned</h5>
                                <span>
                                  {(assignedAdmins[event.id] || []).length}{" "}
                                  Assigned
                                </span>
                              </div>

                              {(assignedAdmins[event.id] || []).length ===
                              0 ? (
                                <p className={styles.noAssignments}>
                                  No administrators assigned yet.
                                </p>
                              ) : (
                                (assignedAdmins[event.id] || []).map(
                                  (admin) => (
                                    <div
                                      key={admin.assignmentId}
                                      className={styles.assignedAdmin}
                                    >
                                      <div className={styles.adminAvatar}>
                                        {admin.displayName
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>

                                      <div className={styles.adminDetails}>
                                        <strong>{admin.displayName}</strong>
                                        <span>
                                          {admin.role.replace("_", " ")}
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        disabled={!!assignmentLoading}
                                        onClick={() =>
                                          removeAdmin(
                                            event.id,
                                            admin.adminId,
                                          )
                                        }
                                        className={styles.removeButton}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ),
                                )
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!canEdit && (
                  <div className={styles.readOnlyNote}>
                    <span>ⓘ</span>
                    You have view-only access to this event.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Edit event modal */}
      {editing && (
        <div className={styles.modalBackdrop}>
          <form
            action={saveEdit}
            className={styles.modal}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>EVENT CONFIGURATION</p>
                <h2>Edit Event</h2>
                <p>Update the event information and settings.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setError("");
                }}
                className={styles.closeButton}
                aria-label="Close edit modal"
              >
                ×
              </button>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Event Name</span>
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={150}
                  defaultValue={editing.name}
                />
              </label>

              <label className={styles.field}>
                <span>URL Slug</span>
                <input
                  name="slug"
                  required
                  defaultValue={editing.slug}
                />
              </label>

              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>Description</span>
                <textarea
                  name="description"
                  defaultValue={editing.description || ""}
                  rows={4}
                />
              </label>

              <label className={styles.field}>
                <span>Event Format</span>
                <select
                  name="eventType"
                  defaultValue={editing.eventType}
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Fee Type</span>
                <select
                  name="feeType"
                  defaultValue={editing.feeType}
                >
                  <option value="free">Free</option>
                  <option value="per_participant">Per Participant</option>
                  <option value="per_team">Per Team</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Fee Amount (₹)</span>
                <input
                  name="feeAmount"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={editing.feeAmountPaise / 100}
                />
              </label>

              <label className={styles.field}>
                <span>Minimum Participants</span>
                <input
                  name="minParticipants"
                  type="number"
                  min="1"
                  required
                  defaultValue={editing.minParticipants}
                />
              </label>

              <label className={styles.field}>
                <span>Maximum Participants</span>
                <input
                  name="maxParticipants"
                  type="number"
                  min="1"
                  required
                  defaultValue={editing.maxParticipants}
                />
              </label>
            </div>

            {error && (
              <p role="alert" className={styles.modalError}>
                {error}
              </p>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setError("");
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!!loading}
                className={styles.saveButton}
              >
                {loading === editing.id
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
