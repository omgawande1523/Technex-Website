
"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import styles from "./team.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Admin = {
  id: string;
  displayName: string;
  role: "superadmin" | "coordinator" | "event_head";
  isActive: boolean;
  createdAt?: string;
};

type Invitation = {
  id: string;
  email: string;
  displayName: string;
  role: "coordinator" | "event_head";
  status: "pending" | "accepted" | "revoked";
  acceptedAdminId?: string | null;
  acceptedAt?: string | null;
  createdAt?: string;
};

type AssignableAdmin = {
  id: string;
  displayName: string;
  role: "coordinator" | "event_head";
  isActive: boolean;
};

type ManagedResource = {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  registrationOpen: boolean;
  canManage: boolean;
};

type Assignment = {
  assignmentId: string;
  adminId: string;
  displayName: string;
  role: "superadmin" | "coordinator" | "event_head";
  isActive: boolean;
  assignedAt: string;
};

type ResourceType = "events" | "workshops";

type ApiResult<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

async function readResponse<T>(response: Response): Promise<T> {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      result?.message ||
      result?.error ||
      `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return result as T;
}

export default function TeamManagementPage() {
  const router = useRouter();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [assignableAdmins, setAssignableAdmins] = useState<AssignableAdmin[]>([]);
  const [events, setEvents] = useState<ManagedResource[]>([]);
  const [workshops, setWorkshops] = useState<ManagedResource[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"coordinator" | "event_head">("coordinator");

  const [resourceType, setResourceType] = useState<ResourceType>("events");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [assignedAdmins, setAssignedAdmins] = useState<Assignment[]>([]);
  const [resourceSearch, setResourceSearch] = useState("");

  const resources = resourceType === "events" ? events : workshops;

  const selectedResource = useMemo(
    () => resources.find((item) => item.id === selectedResourceId) ?? null,
    [resources, selectedResourceId],
  );

  const availableAdmins = useMemo(() => {
    const assignedIds = new Set(assignedAdmins.map((item) => item.adminId));

    return assignableAdmins.filter(
      (admin) => admin.isActive && !assignedIds.has(admin.id),
    );
  }, [assignableAdmins, assignedAdmins]);

  const filteredResources = useMemo(() => {
    const query = resourceSearch.trim().toLowerCase();

    if (!query) return resources;

    return resources.filter(
      (resource) =>
        resource.name.toLowerCase().includes(query) ||
        resource.slug.toLowerCase().includes(query),
    );
  }, [resources, resourceSearch]);

  const getToken = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      router.replace("/admin/login");
      return null;
    }

    return session.access_token;
  }, [router]);

  const apiFetch = useCallback(
    async <T,>(
      path: string,
      token: string,
      options: RequestInit = {},
    ): Promise<T> => {
      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/admin/login");
        throw new Error("Your session has expired. Please log in again.");
      }

      if (response.status === 403) {
        router.replace("/admin/dashboard");
        throw new Error("You do not have permission to access this page.");
      }

      return readResponse<T>(response);
    },
    [router],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      if (!token) return;

      const profileResult = await apiFetch<ApiResult<{ role: string }>>(
        "/api/admin/me",
        token,
      );

      const profile = profileResult.data ?? (profileResult as unknown as { admin?: { role: string } }).admin;

      if (profile?.role !== "superadmin") {
        router.replace("/admin/dashboard");
        return;
      }

      const [adminResult, invitationResult, assignableResult, eventResult, workshopResult] =
        await Promise.all([
          apiFetch<ApiResult<Admin[]>>("/api/admin/users", token),
          apiFetch<ApiResult<Invitation[]>>("/api/admin/authorized-emails", token),
          apiFetch<ApiResult<AssignableAdmin[]>>("/api/admin/assignable", token),
          apiFetch<ApiResult<ManagedResource[]>>("/api/admin/events", token),
          apiFetch<ApiResult<ManagedResource[]>>("/api/admin/workshops", token),
        ]);

      setAdmins(adminResult.data ?? []);
      setInvitations(invitationResult.data ?? []);
      setAssignableAdmins(assignableResult.data ?? []);
      setEvents(eventResult.data ?? []);
      setWorkshops(workshopResult.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load team data.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, getToken, router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!resources.length) {
      setSelectedResourceId("");
      setAssignedAdmins([]);
      return;
    }

    if (!resources.some((item) => item.id === selectedResourceId)) {
      setSelectedResourceId(resources[0].id);
    }
  }, [resources, selectedResourceId]);

  const loadAssignments = useCallback(async () => {
    if (!selectedResourceId) {
      setAssignedAdmins([]);
      return;
    }

    setAssignmentLoading(true);
    setError("");

    try {
      const token = await getToken();
      if (!token) return;

      const result = await apiFetch<ApiResult<Assignment[]>>(
        `/api/admin/${resourceType}/${selectedResourceId}/assignments`,
        token,
      );

      setAssignedAdmins(result.data ?? []);
    } catch (err) {
      setAssignedAdmins([]);
      setError(
        err instanceof Error ? err.message : "Unable to load assignments.",
      );
    } finally {
      setAssignmentLoading(false);
    }
  }, [apiFetch, getToken, resourceType, selectedResourceId]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const handleAddAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const token = await getToken();
      if (!token) return;

      await apiFetch("/api/admin/authorized-emails", token, {
        method: "POST",
        body: JSON.stringify({ email, displayName, role }),
      });

      setEmail("");
      setDisplayName("");
      setRole("coordinator");
      setSuccess("Administrator invitation created successfully.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to authorize email.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (admin: Admin) => {
    const nextStatus = !admin.isActive;

    const confirmed = window.confirm(
      `${nextStatus ? "Activate" : "Deactivate"} ${admin.displayName}'s account?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setActionLoading(`status-${admin.id}`);

    try {
      const token = await getToken();
      if (!token) return;

      await apiFetch(`/api/admin/users/${admin.id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextStatus }),
      });

      setSuccess(
        `${admin.displayName}'s account has been ${nextStatus ? "activated" : "deactivated"}.`,
      );

      await loadData();
      await loadAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update account status.");
    } finally {
      setActionLoading("");
    }
  };

  const handleRevoke = async (invitation: Invitation) => {
    const confirmed = window.confirm(
      `Revoke authorized access for ${invitation.email}?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setActionLoading(`revoke-${invitation.id}`);

    try {
      const token = await getToken();
      if (!token) return;

      await apiFetch(
        `/api/admin/authorized-emails/${invitation.id}`,
        token,
        { method: "DELETE" },
      );

      setSuccess(`Access for ${invitation.email} has been revoked.`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to revoke access.");
    } finally {
      setActionLoading("");
    }
  };

  const handleAssign = async () => {
    if (!selectedResourceId || !selectedAdminId) return;

    setError("");
    setSuccess("");
    setActionLoading("assign");

    try {
      const token = await getToken();
      if (!token) return;

      await apiFetch(
        `/api/admin/${resourceType}/${selectedResourceId}/assignments`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ adminId: selectedAdminId }),
        },
      );

      const assignedAdmin = assignableAdmins.find(
        (admin) => admin.id === selectedAdminId,
      );

      setSelectedAdminId("");
      setSuccess(
        `${assignedAdmin?.displayName ?? "Administrator"} assigned successfully.`,
      );

      await loadAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create assignment.");
    } finally {
      setActionLoading("");
    }
  };

  const handleRemoveAssignment = async (assignment: Assignment) => {
    const resourceLabel = resourceType === "events" ? "event" : "workshop";

    const confirmed = window.confirm(
      `Remove ${assignment.displayName} from this ${resourceLabel}?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setActionLoading(`remove-${assignment.adminId}`);

    try {
      const token = await getToken();
      if (!token) return;

      await apiFetch(
        `/api/admin/${resourceType}/${selectedResourceId}/assignments/${assignment.adminId}`,
        token,
        { method: "DELETE" },
      );

      setSuccess(`${assignment.displayName} removed from the assignment.`);
      await loadAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove assignment.");
    } finally {
      setActionLoading("");
    }
  };

  const pendingCount = invitations.filter(
    (item) => item.status === "pending",
  ).length;

  const activeCount = admins.filter((admin) => admin.isActive).length;

  const assignmentCount = assignedAdmins.length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>TECHNEX 2026 / ADMINISTRATION</p>
          <h1>Team Management</h1>
          <p className={styles.subtitle}>
            Manage administrator accounts, access permissions and event responsibilities.
          </p>
        </div>

        <button
          className={styles.refreshButton}
          onClick={() => void loadData()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </header>

      <section className={styles.stats}>
        <article className={styles.statCard}>
          <span>Total Administrators</span>
          <strong>{admins.length}</strong>
          <small>Registered admin profiles</small>
        </article>

        <article className={styles.statCard}>
          <span>Active Administrators</span>
          <strong>{activeCount}</strong>
          <small>Accounts currently enabled</small>
        </article>

        <article className={styles.statCard}>
          <span>Pending Invitations</span>
          <strong>{pendingCount}</strong>
          <small>Awaiting Google sign-in</small>
        </article>

        <article className={styles.statCard}>
          <span>Assignable Members</span>
          <strong>{assignableAdmins.length}</strong>
          <small>Active Coordinators and Event Heads</small>
        </article>
      </section>

      {error && (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">×</button>
        </div>
      )}

      {success && (
        <div className={styles.success} role="status">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} aria-label="Dismiss message">×</button>
        </div>
      )}

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.sectionIndex}>01 / ACCESS CONTROL</span>
            <h2>Authorize Administrator</h2>
            <p>Add a Google account and choose its administrative role.</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleAddAdmin}>
          <label>
            Full name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Enter full name"
              minLength={2}
              maxLength={100}
              required
            />
          </label>

          <label>
            Google email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@gmail.com"
              required
            />
          </label>

          <label>
            Administrator role
            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as "coordinator" | "event_head")
              }
            >
              <option value="coordinator">Coordinator</option>
              <option value="event_head">Event Head</option>
            </select>
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Authorizing..." : "+ Authorize account"}
          </button>
        </form>

        <p className={styles.formNote}>
          The invited person must sign in using the exact Google account authorized here.
        </p>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.sectionIndex}>02 / TEAM DIRECTORY</span>
            <h2>Administrator Accounts</h2>
            <p>View account roles and control administrator access.</p>
          </div>
          <span className={styles.countLabel}>{admins.length} accounts</span>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading administrator accounts...</div>
        ) : admins.length === 0 ? (
          <div className={styles.empty}>No administrator profiles found.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Administrator</th>
                  <th>Role</th>
                  <th>Account status</th>
                  <th>Access control</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <strong className={styles.personName}>{admin.displayName}</strong>
                      <small className={styles.email}>ID: {admin.id}</small>
                    </td>
                    <td>
                      <span className={styles.role}>
                        {admin.role.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className={admin.isActive ? styles.active : styles.inactive}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {admin.role === "superadmin" ? (
                        <span className={styles.protected}>Protected account</span>
                      ) : (
                        <button
                          className={styles.actionButton}
                          onClick={() => void handleStatusChange(admin)}
                          disabled={actionLoading === `status-${admin.id}`}
                        >
                          {actionLoading === `status-${admin.id}`
                            ? "Updating..."
                            : admin.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.sectionIndex}>03 / GOOGLE ACCESS</span>
            <h2>Authorized Google Accounts</h2>
            <p>Track invitation status and revoke access when required.</p>
          </div>
          <span className={styles.countLabel}>{invitations.length} records</span>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading authorized accounts...</div>
        ) : invitations.length === 0 ? (
          <div className={styles.empty}>No authorized Google accounts yet.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Role</th>
                  <th>Invitation status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td>
                      <strong className={styles.personName}>{invitation.displayName}</strong>
                      <small className={styles.email}>{invitation.email}</small>
                    </td>
                    <td>
                      <span className={styles.role}>
                        {invitation.role.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          invitation.status === "accepted"
                            ? styles.active
                            : invitation.status === "pending"
                              ? styles.pending
                              : styles.inactive
                        }
                      >
                        {invitation.status}
                      </span>
                    </td>
                    <td>
                      {invitation.status !== "revoked" ? (
                        <button
                          className={styles.revokeButton}
                          onClick={() => void handleRevoke(invitation)}
                          disabled={actionLoading === `revoke-${invitation.id}`}
                        >
                          {actionLoading === `revoke-${invitation.id}`
                            ? "Revoking..."
                            : "Revoke access"}
                        </button>
                      ) : (
                        <span className={styles.protected}>Access revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.sectionIndex}>04 / RESPONSIBILITY CONTROL</span>
            <h2>Assignment Management</h2>
            <p>Assign Coordinators and Event Heads to events and workshops.</p>
          </div>
          <span className={styles.countLabel}>
            {assignmentCount} selected assignments
          </span>
        </div>

        <div className={styles.assignmentTabs}>
          <button
            className={resourceType === "events" ? styles.tabActive : styles.tab}
            onClick={() => {
              setResourceType("events");
              setResourceSearch("");
              setSelectedAdminId("");
            }}
          >
            <span>Events</span>
            <small>{events.length}</small>
          </button>
          <button
            className={resourceType === "workshops" ? styles.tabActive : styles.tab}
            onClick={() => {
              setResourceType("workshops");
              setResourceSearch("");
              setSelectedAdminId("");
            }}
          >
            <span>Workshops</span>
            <small>{workshops.length}</small>
          </button>
        </div>

        <div className={styles.assignmentLayout}>
          <div className={styles.resourceColumn}>
            <div className={styles.resourceHeader}>
              <div>
                <h3>Select {resourceType === "events" ? "event" : "workshop"}</h3>
                <p>Choose a resource to manage its team.</p>
              </div>
              <span>{resources.length}</span>
            </div>

            <input
              className={styles.searchInput}
              value={resourceSearch}
              onChange={(event) => setResourceSearch(event.target.value)}
              placeholder={`Search ${resourceType}...`}
            />

            <div className={styles.resourceList}>
              {loading ? (
                <div className={styles.empty}>Loading resources...</div>
              ) : filteredResources.length === 0 ? (
                <div className={styles.empty}>No matching resources found.</div>
              ) : (
                filteredResources.map((resource) => (
                  <button
                    key={resource.id}
                    className={
                      selectedResourceId === resource.id
                        ? styles.resourceActive
                        : styles.resourceItem
                    }
                    onClick={() => {
                      setSelectedResourceId(resource.id);
                      setSelectedAdminId("");
                    }}
                  >
                    <span className={styles.resourceName}>{resource.name}</span>
                    <span className={styles.resourceMeta}>
                      <span>{resource.isPublished ? "Published" : "Unpublished"}</span>
                      <span className={styles.resourceArrow}>→</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className={styles.assignmentDetails}>
            {selectedResource ? (
              <>
                <div className={styles.selectedResourceHeader}>
                  <div>
                    <span className={styles.selectedLabel}>
                      SELECTED {resourceType === "events" ? "EVENT" : "WORKSHOP"}
                    </span>
                    <h3>{selectedResource.name}</h3>
                    <p>/{selectedResource.slug}</p>
                  </div>
                  <span
                    className={
                      selectedResource.isPublished
                        ? styles.active
                        : styles.inactive
                    }
                  >
                    {selectedResource.isPublished ? "Published" : "Unpublished"}
                  </span>
                </div>

                <div className={styles.assignmentForm}>
                  <label htmlFor="assign-admin">Add administrator</label>
                  <div className={styles.assignControls}>
                    <select
                      id="assign-admin"
                      value={selectedAdminId}
                      onChange={(event) => setSelectedAdminId(event.target.value)}
                    >
                      <option value="">Select an active administrator</option>
                      {availableAdmins.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.displayName} — {admin.role.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => void handleAssign()}
                      disabled={
                        !selectedAdminId ||
                        assignmentLoading ||
                        actionLoading === "assign"
                      }
                    >
                      {actionLoading === "assign" ? "Assigning..." : "+ Assign"}
                    </button>
                  </div>
                  {availableAdmins.length === 0 && (
                    <p className={styles.formNote}>
                      No additional active administrators are available to assign.
                    </p>
                  )}
                </div>

                <div className={styles.assignedHeader}>
                  <div>
                    <h3>Assigned administrators</h3>
                    <p>People currently responsible for this resource.</p>
                  </div>
                  <span>{assignedAdmins.length} assigned</span>
                </div>

                {assignmentLoading ? (
                  <div className={styles.empty}>Loading assignments...</div>
                ) : assignedAdmins.length === 0 ? (
                  <div className={styles.empty}>
                    <span className={styles.emptyIcon}>＋</span>
                    <strong>No administrators assigned</strong>
                    <p>Use the selector above to assign a Coordinator or Event Head.</p>
                  </div>
                ) : (
                  <div className={styles.assignedList}>
                    {assignedAdmins.map((assignment) => (
                      <div className={styles.assignedPerson} key={assignment.assignmentId}>
                        <div className={styles.avatar}>
                          {assignment.displayName.trim().charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.assignedPersonInfo}>
                          <strong>{assignment.displayName}</strong>
                          <span>
                            {assignment.role.replace("_", " ")}
                            {!assignment.isActive && " · Inactive account"}
                          </span>
                        </div>
                        <button
                          className={styles.removeButton}
                          onClick={() => void handleRemoveAssignment(assignment)}
                          disabled={
                            actionLoading === `remove-${assignment.adminId}`
                          }
                        >
                          {actionLoading === `remove-${assignment.adminId}`
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>↖</span>
                <strong>Select a resource</strong>
                <p>Choose an event or workshop from the list to manage its assignments.</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.assignmentNote}>
          <strong>Assignment rules</strong>
          <p>
            Only active Coordinators and Event Heads can be assigned. Superadmin
            accounts are protected and cannot be assigned through this interface.
            Account permissions are enforced by the backend.
          </p>
        </div>
      </section>
    </main>
  );
}
