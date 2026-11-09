
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import styles from "./team.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Admin = {
  id: string;
  displayName: string;
  role: "superadmin" | "coordinator" | "event_head";
  isActive: boolean;
};

type Invitation = {
  id: string;
  email: string;
  displayName: string;
  role: "coordinator" | "event_head";
  status: "pending" | "accepted" | "revoked";
};

export default function TeamManagementPage() {
  const router = useRouter();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"coordinator" | "event_head">(
    "coordinator",
  );

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

  
const loadData = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const token = await getToken();
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Verify the administrator's role first
    const profileResponse = await fetch(`${API_URL}/api/admin/me`, {
      headers,
      cache: "no-store",
    });

    if (profileResponse.status === 401) {
      router.replace("/admin/login");
      return;
    }

    if (!profileResponse.ok) {
      router.replace("/admin/dashboard");
      return;
    }

    const profileData = await profileResponse.json();

    if (profileData.admin?.role !== "superadmin") {
      router.replace("/admin/dashboard");
      return;
    }

    // Load management data only after role verification
    const [adminResponse, invitationResponse] = await Promise.all([
      fetch(`${API_URL}/api/admin/users`, {
        headers,
        cache: "no-store",
      }),
      fetch(`${API_URL}/api/admin/authorized-emails`, {
        headers,
        cache: "no-store",
      }),
    ]);

    if (adminResponse.status === 401 || invitationResponse.status === 401) {
      router.replace("/admin/login");
      return;
    }

    if (adminResponse.status === 403 || invitationResponse.status === 403) {
      router.replace("/admin/dashboard");
      return;
    }

    if (!adminResponse.ok || !invitationResponse.ok) {
      throw new Error("Unable to load administrator data.");
    }

    const adminData = await adminResponse.json();
    const invitationData = await invitationResponse.json();

    setAdmins(adminData.data ?? []);
    setInvitations(invitationData.data ?? []);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Something went wrong.",
    );
  } finally {
    setLoading(false);
  }
}, [getToken, router]);


  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAddAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/api/admin/authorized-emails`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          displayName,
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to authorize email.");
      }

      setEmail("");
      setDisplayName("");
      setRole("coordinator");
      setSuccess("Administrator email authorized successfully.");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (admin: Admin) => {
    setError("");
    setSuccess("");

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/admin/users/${admin.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !admin.isActive,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update status.");
      }

      setSuccess("Administrator status updated.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  const handleRevoke = async (invitation: Invitation) => {
    const confirmed = window.confirm(
      `Revoke access for ${invitation.email}?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/admin/authorized-emails/${invitation.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to revoke access.");
      }

      setSuccess("Administrator access revoked.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  const pendingCount = invitations.filter(
    (item) => item.status === "pending",
  ).length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>TECHNEX 2026 / ADMINISTRATION</p>
          <h1>Team Management</h1>
          <p className={styles.subtitle}>
            Manage administrator accounts and access permissions.
          </p>
        </div>

        <button
          className={styles.refreshButton}
          onClick={() => void loadData()}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      <section className={styles.stats}>
        <article className={styles.statCard}>
          <span>Total Administrators</span>
          <strong>{admins.length}</strong>
        </article>

        <article className={styles.statCard}>
          <span>Active Administrators</span>
          <strong>{admins.filter((a) => a.isActive).length}</strong>
        </article>

        <article className={styles.statCard}>
          <span>Pending Invitations</span>
          <strong>{pendingCount}</strong>
        </article>
      </section>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <h2>Add Administrator</h2>
            <p>Authorize a Google account for the admin portal.</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleAddAdmin}>
          <label>
            Full name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@gmail.com"
              required
            />
          </label>

          <label>
            Administrator role
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "coordinator" | "event_head")
              }
            >
              <option value="coordinator">Coordinator</option>
              <option value="event_head">Event Head</option>
            </select>
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "+ Add Administrator"}
          </button>
        </form>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <h2>Administrator Accounts</h2>
            <p>Manage active administrator profiles.</p>
          </div>
          <span>{admins.length} accounts</span>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading administrators...</div>
        ) : admins.length === 0 ? (
          <div className={styles.empty}>No administrators found.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.displayName}</td>
                    <td>
                      <span className={styles.role}>
                        {admin.role.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          admin.isActive
                            ? styles.active
                            : styles.inactive
                        }
                      >
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {admin.role === "superadmin" ? (
                        <span className={styles.protected}>Protected</span>
                      ) : (
                        <button
                          className={styles.actionButton}
                          onClick={() => void handleStatusChange(admin)}
                        >
                          {admin.isActive ? "Deactivate" : "Activate"}
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
            <h2>Authorized Google Accounts</h2>
            <p>Track pending, accepted and revoked access.</p>
          </div>
          <span>{invitations.length} records</span>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading authorized accounts...</div>
        ) : invitations.length === 0 ? (
          <div className={styles.empty}>No authorized emails yet.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Name / Email</th>
                  <th>Role</th>
                  <th>Access status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td>
                      <strong>{invitation.displayName}</strong>
                      <small className={styles.email}>
                        {invitation.email}
                      </small>
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
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className={styles.protected}>Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
