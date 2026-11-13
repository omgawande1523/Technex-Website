"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import styles from "./workshop-management.module.css";

export type AdminRole = "superadmin" | "coordinator" | "event_head";

export type WorkshopItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  feeAmountPaise: number;
  isPublished: boolean;
  registrationOpen: boolean;
  registrationOpensAt?: string | null;
  registrationClosesAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  isActive?: boolean;
  assignedAt?: string;
};

type Props = {
  workshops: WorkshopItem[];
  role: AdminRole;
};

type WorkshopForm = {
  name: string;
  slug: string;
  description: string;
  feeAmount: string;
  isPublished: boolean;
  registrationOpen: boolean;
  registrationOpensAt: string;
  registrationClosesAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const emptyForm: WorkshopForm = {
  name: "",
  slug: "",
  description: "",
  feeAmount: "0",
  isPublished: false,
  registrationOpen: false,
  registrationOpensAt: "",
  registrationClosesAt: "",
};

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 16);
}

function toIsoDate(value: string) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function formatRupees(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format((paise || 0) / 100);
}

export default function WorkshopManagement({
  workshops: initialWorkshops,
  role,
}: Props) {
  const router = useRouter();

  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [editing, setEditing] = useState<WorkshopItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<WorkshopForm>(emptyForm);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  const [assignableAdmins, setAssignableAdmins] = useState<AssignableAdmin[]>(
    [],
  );
  const [assignedAdmins, setAssignedAdmins] = useState<
    Record<string, AssignedAdmin[]>
  >({});
  const [selectedAdmin, setSelectedAdmin] = useState<Record<string, string>>(
    {},
  );
  const [expandedAssignments, setExpandedAssignments] = useState<
    Record<string, boolean>
  >({});
  const [assignmentLoading, setAssignmentLoading] = useState("");

  const isSuperadmin = role === "superadmin";

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    return session.access_token;
  }

  async function apiRequest<T = any>(
    path: string,
    method = "GET",
    body?: unknown,
  ): Promise<T> {
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

    const responseText = await response.text();

    let result: any = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message || result.error || "Something went wrong.",
      );
    }

    return result as T;
  }

  function openCreateModal() {
    setError("");
    setModalError("");
    setEditing(null);
    setForm(emptyForm);
    setCreating(true);
  }

  function openEditModal(workshop: WorkshopItem) {
    setError("");
    setModalError("");
    setCreating(false);
    setEditing(workshop);
    setForm({
      name: workshop.name,
      slug: workshop.slug,
      description: workshop.description ?? "",
      feeAmount: String((workshop.feeAmountPaise ?? 0) / 100),
      isPublished: workshop.isPublished,
      registrationOpen: workshop.registrationOpen,
      registrationOpensAt: toDateTimeLocal(workshop.registrationOpensAt),
      registrationClosesAt: toDateTimeLocal(workshop.registrationClosesAt),
    });
  }

  function closeModal() {
    if (loading) return;

    setCreating(false);
    setEditing(null);
    setModalError("");
  }

  function updateForm<K extends keyof WorkshopForm>(
    field: K,
    value: WorkshopForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveWorkshop(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalError("");

    if (!form.name.trim() || !form.slug.trim()) {
      setModalError("Workshop name and slug are required.");
      return;
    }

    const fee = Number(form.feeAmount);

    if (!Number.isFinite(fee) || fee < 0) {
      setModalError("Enter a valid non-negative registration fee.");
      return;
    }

    if (
      form.registrationOpensAt &&
      form.registrationClosesAt &&
      new Date(form.registrationClosesAt) <=
        new Date(form.registrationOpensAt)
    ) {
      setModalError("Registration closing time must be after opening time.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description.trim() || null,
      feeAmountPaise: Math.round(fee * 100),
      ...(creating
        ? {
            isPublished: form.isPublished,
            registrationOpen: form.registrationOpen,
            registrationOpensAt: toIsoDate(form.registrationOpensAt),
            registrationClosesAt: toIsoDate(form.registrationClosesAt),
          }
        : {}),
    };

    setLoading(creating ? "create" : "save");

    try {
      if (creating) {
        const result = await apiRequest<{ data: WorkshopItem }>(
          "/api/admin/workshops",
          "POST",
          payload,
        );

        setWorkshops((current) => [result.data, ...current]);
      } else if (editing) {
        const result = await apiRequest<{ data: Partial<WorkshopItem> }>(
          `/api/admin/workshops/${editing.id}`,
          "PUT",
          payload,
        );

        setWorkshops((current) =>
          current.map((workshop) =>
            workshop.id === editing.id
              ? { ...workshop, ...result.data }
              : workshop,
          ),
        );
      }

      setCreating(false);
      setEditing(null);
      router.refresh();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Unable to save workshop.",
      );
    } finally {
      setLoading("");
    }
  }

  async function updateControl(
    workshop: WorkshopItem,
    field: "isPublished" | "registrationOpen",
  ) {
    const nextValue = !workshop[field];
    const actionKey = `${workshop.id}-${field}`;

    setError("");
    setLoading(actionKey);

    try {
      const result = await apiRequest<{ data: Partial<WorkshopItem> }>(
        `/api/admin/workshops/${workshop.id}/controls`,
        "PATCH",
        { [field]: nextValue },
      );

      setWorkshops((current) =>
        current.map((item) =>
          item.id === workshop.id
            ? { ...item, ...result.data, [field]: nextValue }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update workshop.",
      );
    } finally {
      setLoading("");
    }
  }

  async function deleteWorkshop(workshop: WorkshopItem) {
    const confirmed = window.confirm(
      `Delete "${workshop.name}"? This action cannot be undone. Workshops with registrations may not be deletable.`,
    );

    if (!confirmed) return;

    setError("");
    setLoading(`${workshop.id}-delete`);

    try {
      await apiRequest(`/api/admin/workshops/${workshop.id}`, "DELETE");

      setWorkshops((current) =>
        current.filter((item) => item.id !== workshop.id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete workshop.",
      );
    } finally {
      setLoading("");
    }
  }

  async function loadAssignments(workshopId: string) {
    setAssignmentLoading(workshopId);
    setError("");

    try {
      const [adminsResult, assignmentsResult] = await Promise.all([
        apiRequest<{ data: AssignableAdmin[] }>("/api/admin/assignable"),
        apiRequest<{ data: AssignedAdmin[] }>(
          `/api/admin/workshops/${workshopId}/assignments`,
        ),
      ]);

      setAssignableAdmins(adminsResult.data ?? []);
      setAssignedAdmins((current) => ({
        ...current,
        [workshopId]: assignmentsResult.data ?? [],
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load assignments.",
      );
    } finally {
      setAssignmentLoading("");
    }
  }

  async function toggleAssignmentPanel(workshopId: string) {
    const isExpanded = Boolean(expandedAssignments[workshopId]);

    setExpandedAssignments((current) => ({
      ...current,
      [workshopId]: !isExpanded,
    }));

    if (!isExpanded && !assignedAdmins[workshopId]) {
      await loadAssignments(workshopId);
    }
  }

  async function assignAdmin(workshopId: string) {
    const adminId = selectedAdmin[workshopId];

    if (!adminId) {
      setError("Select an admin before assigning.");
      return;
    }

    setAssignmentLoading(workshopId);
    setError("");

    try {
      await apiRequest(
        `/api/admin/workshops/${workshopId}/assignments`,
        "POST",
        { adminId },
      );

      const assignmentsResult = await apiRequest<{ data: AssignedAdmin[] }>(
        `/api/admin/workshops/${workshopId}/assignments`,
      );

      setAssignedAdmins((current) => ({
        ...current,
        [workshopId]: assignmentsResult.data ?? [],
      }));

      setSelectedAdmin((current) => ({ ...current, [workshopId]: "" }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign admin.",
      );
    } finally {
      setAssignmentLoading("");
    }
  }

  async function removeAdmin(workshopId: string, admin: AssignedAdmin) {
    const confirmed = window.confirm(
      `Remove ${admin.displayName} from this workshop?`,
    );

    if (!confirmed) return;

    setAssignmentLoading(workshopId);
    setError("");

    try {
      await apiRequest(
        `/api/admin/workshops/${workshopId}/assignments/${admin.adminId}`,
        "DELETE",
      );

      setAssignedAdmins((current) => ({
        ...current,
        [workshopId]: (current[workshopId] ?? []).filter(
          (item) => item.adminId !== admin.adminId,
        ),
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove assignment.",
      );
    } finally {
      setAssignmentLoading("");
    }
  }

  return (
    <section className={styles.container}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>WORKSHOP MANAGEMENT</p>
          <h2>Existing Workshops</h2>
          <p className={styles.headingDescription}>
            Manage workshop details, publication, registration and assignments.
          </p>
        </div>

        <div className={styles.headingRight}>
          <div className={styles.eventCount}>
            <span>{workshops.length}</span>
            <small>Workshops</small>
          </div>

          {isSuperadmin && (
            <button
              type="button"
              className={styles.createButton}
              onClick={openCreateModal}
            >
              <span>＋</span> Create Workshop
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>!</span>
          {error}
        </div>
      )}

      {workshops.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✦</div>
          <h3>No workshops found</h3>
          <p>
            {isSuperadmin
              ? "Create your first workshop to get started."
              : "There are currently no workshops available for your account."}
          </p>
          {isSuperadmin && (
            <button
              type="button"
              className={styles.createButton}
              onClick={openCreateModal}
            >
              Create Workshop
            </button>
          )}
        </div>
      ) : (
        <div className={styles.eventList}>
          {workshops.map((workshop) => {
            const canEdit =
              isSuperadmin || (role === "coordinator" && workshop.canManage);

            const busy = loading.startsWith(`${workshop.id}-`);

            return (
              <article className={styles.eventCard} key={workshop.id}>
                <div className={styles.cardHeader}>
                  <div className={styles.eventIdentity}>
                    <div className={styles.eventIcon}>
                      {workshop.name.charAt(0).toUpperCase()}
                    </div>

                    <div className={styles.eventTitle}>
                      <h3>{workshop.name}</h3>
                      <p>/{workshop.slug}</p>
                    </div>
                  </div>

                  <div className={styles.statusGroup}>
                    <span
                      className={`${styles.status} ${
                        workshop.isPublished ? styles.published : styles.draft
                      }`}
                    >
                      <span className={styles.statusDot} />
                      {workshop.isPublished ? "Published" : "Draft"}
                    </span>

                    <span
                      className={`${styles.status} ${
                        workshop.registrationOpen ? styles.open : styles.closed
                      }`}
                    >
                      <span className={styles.statusDot} />
                      Registration{" "}
                      {workshop.registrationOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>

                {workshop.description && (
                  <p className={styles.description}>{workshop.description}</p>
                )}

                <div className={styles.eventDetails}>
                  <div className={styles.detailItem}>
                    <span>WORKSHOP TYPE</span>
                    <strong>Workshop</strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>REGISTRATION FEE</span>
                    <strong className={styles.fee}>
                      {formatRupees(workshop.feeAmountPaise)}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>REGISTRATION OPENS</span>
                    <strong>
                      {workshop.registrationOpensAt
                        ? new Date(
                            workshop.registrationOpensAt,
                          ).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Not scheduled"}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>REGISTRATION CLOSES</span>
                    <strong>
                      {workshop.registrationClosesAt
                        ? new Date(
                            workshop.registrationClosesAt,
                          ).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Not scheduled"}
                    </strong>
                  </div>
                </div>

                {canEdit ? (
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      disabled={busy}
                      onClick={() => updateControl(workshop, "isPublished")}
                    >
                      {workshop.isPublished ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      type="button"
                      className={styles.actionButton}
                      disabled={busy}
                      onClick={() =>
                        updateControl(workshop, "registrationOpen")
                      }
                    >
                      {workshop.registrationOpen
                        ? "Close Registration"
                        : "Open Registration"}
                    </button>

                    <button
                      type="button"
                      className={styles.editButton}
                      disabled={busy}
                      onClick={() => openEditModal(workshop)}
                    >
                      <span>✎</span> Edit
                    </button>

                    {isSuperadmin && (
                      <button
                        type="button"
                        className={styles.deleteButton}
                        disabled={busy}
                        onClick={() => deleteWorkshop(workshop)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.readOnlyNote}>
                    <span>ⓘ</span>
                    You have view-only access to this workshop.
                  </div>
                )}

                {isSuperadmin && (
                  <div className={styles.assignmentSection}>
                    <button
                      type="button"
                      className={styles.assignmentToggle}
                      onClick={() => toggleAssignmentPanel(workshop.id)}
                      disabled={assignmentLoading === workshop.id}
                    >
                      <span className={styles.assignmentToggleLeft}>
                        <span className={styles.assignmentIcon}>♙</span>
                        Manage Workshop Assignments
                      </span>
                      <span className={styles.assignmentPlus}>
                        {expandedAssignments[workshop.id] ? (
                          <Minus size={16} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <Plus size={16} strokeWidth={2} aria-hidden="true" />
                        )}
                      </span>
                    </button>

                    {expandedAssignments[workshop.id] && (
                      <div className={styles.assignmentPanel}>
                        <div className={styles.assignmentHeading}>
                          <h4>Assign Coordinators & Event Heads</h4>
                          <p>
                            Select an admin to grant access to this workshop.
                          </p>
                        </div>

                        <div className={styles.assignForm}>
                          <select
                            className={styles.selectInput}
                            value={selectedAdmin[workshop.id] ?? ""}
                            onChange={(event) =>
                              setSelectedAdmin((current) => ({
                                ...current,
                                [workshop.id]: event.target.value,
                              }))
                            }
                          >
                            <option value="">Select an admin</option>
                            {assignableAdmins.map((admin) => (
                              <option key={admin.id} value={admin.id}>
                                {admin.displayName} —{" "}
                                {admin.role.replace("_", " ")}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            className={styles.assignButton}
                            disabled={
                              !selectedAdmin[workshop.id] ||
                              assignmentLoading === workshop.id
                            }
                            onClick={() => assignAdmin(workshop.id)}
                          >
                            {assignmentLoading === workshop.id
                              ? "Please wait..."
                              : "Assign Admin"}
                          </button>
                        </div>

                        <div className={styles.assignedList}>
                          <div className={styles.assignedListHeader}>
                            <h5>Assigned Admins</h5>
                            <span>
                              {(assignedAdmins[workshop.id] ?? []).length}{" "}
                              assigned
                            </span>
                          </div>

                          {assignmentLoading === workshop.id &&
                          !assignedAdmins[workshop.id] ? (
                            <p className={styles.loadingText}>
                              Loading assignments...
                            </p>
                          ) : (assignedAdmins[workshop.id] ?? []).length ===
                            0 ? (
                            <div className={styles.noAssignments}>
                              No admins assigned to this workshop yet.
                            </div>
                          ) : (
                            assignedAdmins[workshop.id].map((admin) => (
                              <div
                                className={styles.assignedAdmin}
                                key={admin.assignmentId}
                              >
                                <div className={styles.adminAvatar}>
                                  {admin.displayName
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className={styles.adminDetails}>
                                  <strong>{admin.displayName}</strong>
                                  <span>{admin.role.replace("_", " ")}</span>
                                </div>

                                <button
                                  type="button"
                                  className={styles.removeButton}
                                  disabled={
                                    assignmentLoading === workshop.id
                                  }
                                  onClick={() =>
                                    removeAdmin(workshop.id, admin)
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="workshop-modal-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>
                  {creating ? "NEW WORKSHOP" : "WORKSHOP SETTINGS"}
                </p>
                <h2 id="workshop-modal-title">
                  {creating ? "Create Workshop" : "Edit Workshop"}
                </h2>
                <p>
                  {creating
                    ? "Add the workshop details and registration settings."
                    : "Update the workshop information."}
                </p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveWorkshop}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Workshop Name *</span>
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateForm("name", event.target.value)
                    }
                    placeholder="e.g. Web Development Workshop"
                  />
                </label>

                <label className={styles.field}>
                  <span>Slug *</span>
                  <input
                    required
                    value={form.slug}
                    onChange={(event) =>
                      updateForm(
                        "slug",
                        event.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-"),
                      )
                    }
                    placeholder="web-development-workshop"
                  />
                </label>

                <label className={styles.field}>
                  <span>Registration Fee (₹) *</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.feeAmount}
                    onChange={(event) =>
                      updateForm("feeAmount", event.target.value)
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>Registration Opens At</span>
                  <input
                    type="datetime-local"
                    value={form.registrationOpensAt}
                    onChange={(event) =>
                      updateForm("registrationOpensAt", event.target.value)
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>Registration Closes At</span>
                  <input
                    type="datetime-local"
                    value={form.registrationClosesAt}
                    onChange={(event) =>
                      updateForm("registrationClosesAt", event.target.value)
                    }
                  />
                </label>

                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>Description</span>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    placeholder="Describe the workshop..."
                  />
                </label>

                {creating && (
                  <div className={`${styles.fullWidth} ${styles.checkOptions}`}>
                    <label>
                      <input
                        type="checkbox"
                        checked={form.isPublished}
                        onChange={(event) =>
                          updateForm("isPublished", event.target.checked)
                        }
                      />
                      Publish workshop
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={form.registrationOpen}
                        onChange={(event) =>
                          updateForm("registrationOpen", event.target.checked)
                        }
                      />
                      Open registration
                    </label>
                  </div>
                )}
              </div>

              {modalError && (
                <div className={styles.modalError}>{modalError}</div>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                  disabled={Boolean(loading)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={Boolean(loading)}
                >
                  {loading
                    ? "Saving..."
                    : creating
                      ? "Create Workshop"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}