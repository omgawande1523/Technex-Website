
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./participant-management.module.css";

type Participant = {
  id: string;
  registrationId: string;
  registrationCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string | null;
  state: string | null;
  city: string | null;
  collegeName: string | null;
  department: string | null;
  degree: string | null;
  participantRole: string;
  registrableItemId: string;
  itemType: "event" | "workshop";
  itemName: string;
  teamName: string | null;
  teamSize: number;
  registrationStatus: "pending_payment" | "confirmed" | "cancelled" | "expired";
  totalAmountPaise: number;
  currency: string;
  registrationCreatedAt: string;
  participantCreatedAt: string;
  confirmedAt: string | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type AdminRole = "superadmin" | "coordinator" | "event_head";

type Props = {
  accessToken: string;
  role: AdminRole;
  initialParticipants: Participant[];
  initialPagination: Pagination;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusLabels: Record<Participant["registrationStatus"], string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  expired: "Expired",
};

const formatDate = (value: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (amountPaise: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amountPaise / 100);

const escapeCsv = (value: unknown) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

export default function ParticipantManagement({
  accessToken,
  role,
  initialParticipants,
  initialPagination,
}: Props) {
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [pagination, setPagination] =
    useState<Pagination>(initialPagination);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);

  const lastFetchedQuery = useRef("page=1&limit=20&sort=newest");

  const isSuperadmin = role === "superadmin";

  const buildParams = useCallback(
    (currentPage: number, limit = 20) => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        sort,
      });

      if (search.trim()) params.set("search", search.trim());
      if (type) params.set("type", type);
      if (status && isSuperadmin) params.set("status", status);
      if (gender) params.set("gender", gender);
      if (state.trim()) params.set("state", state.trim());
      if (dateFrom) params.set("fromDate", dateFrom);
      if (dateTo) params.set("toDate", dateTo);

      return params;
    },
    [search, type, status, gender, state, dateFrom, dateTo, sort, isSuperadmin],
  );

  const fetchParticipants = useCallback(async () => {
    if (!API_URL) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = buildParams(page);

      const response = await fetch(
        `${API_URL}/api/admin/participants?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.message || "Failed to load participants.",
        );
      }

      const result = await response.json();

      setParticipants(result.data ?? []);
      setPagination(
        result.pagination ?? {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, buildParams]);

  useEffect(() => {
    const queryKey = buildParams(page).toString();

    if (lastFetchedQuery.current === queryKey) return;

    lastFetchedQuery.current = queryKey;

    const timeout = setTimeout(() => {
      fetchParticipants();
    }, 350);

    return () => clearTimeout(timeout);
  }, [buildParams, fetchParticipants, page]);

  useEffect(() => {
    if (!selectedParticipant) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedParticipant(null);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedParticipant]);

  const updateFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const exportParticipants = async () => {
    if (!API_URL) return;

    setExportLoading(true);
    setError("");

    try {
      // Fetch all matching records in batches instead of exporting only
      // the currently visible page.
      const exportLimit = 100;
      const firstParams = buildParams(1, exportLimit);

      const firstResponse = await fetch(
        `${API_URL}/api/admin/participants?${firstParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );

      if (!firstResponse.ok) {
        throw new Error("Unable to export participants.");
      }

      const firstResult = await firstResponse.json();
      const allParticipants: Participant[] = [...(firstResult.data ?? [])];
      const totalPages = firstResult.pagination?.totalPages ?? 1;

      for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
        const params = buildParams(currentPage, exportLimit);

        const response = await fetch(
          `${API_URL}/api/admin/participants?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Unable to complete the participant export.");
        }

        const result = await response.json();
        allParticipants.push(...(result.data ?? []));
      }

      const columns = [
        "Name",
        "Email",
        "Mobile",
        "Gender",
        "City",
        "State",
        "College",
        "Department",
        "Degree",
        "Participant Role",
        "Registration Code",
        "Registration Status",
        "Event / Workshop",
        "Type",
        "Team Name",
        "Team Size",
        "Registration Date",
        "Confirmed Date",
      ];

      const rows = allParticipants.map((participant) => [
        participant.fullName,
        participant.email,
        participant.mobileNumber,
        participant.gender,
        participant.city,
        participant.state,
        participant.collegeName,
        participant.department,
        participant.degree,
        participant.participantRole,
        participant.registrationCode,
        participant.registrationStatus,
        participant.itemName,
        participant.itemType,
        participant.teamName,
        participant.teamSize,
        participant.registrationCreatedAt,
        participant.confirmedAt,
      ]);

      const csv = [
        columns.map(escapeCsv).join(","),
        ...rows.map((row) => row.map(escapeCsv).join(",")),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `tnx-participants-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Export failed.",
      );
    } finally {
      setExportLoading(false);
    }
  };

  const confirmedOnPage = participants.filter(
    (participant) => participant.registrationStatus === "confirmed",
  ).length;

  const eventCount = new Set(
    participants
      .filter((participant) => participant.itemType === "event")
      .map((participant) => participant.registrableItemId),
  ).size;

  const workshopCount = new Set(
    participants
      .filter((participant) => participant.itemType === "workshop")
      .map((participant) => participant.registrableItemId),
  ).size;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>TNX'26 · ADMINISTRATION</span>
          <h1 className={styles.pageTitle}>Participants</h1>
          <p className={styles.pageDescription}>
            Explore and manage the participant directory across events and
            workshops.
          </p>
        </div>

        <button
          type="button"
          className={styles.exportButton}
          onClick={exportParticipants}
          disabled={exportLoading || pagination.total === 0}
        >
          <span aria-hidden="true">↓</span>
          {exportLoading ? "Preparing CSV..." : "Export CSV"}
        </button>
      </header>

      <section className={styles.metrics}>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Matching participants</span>
          <strong>{pagination.total.toLocaleString("en-IN")}</strong>
          <span className={styles.metricHint}>Based on current filters</span>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Shown on this page</span>
          <strong>{participants.length}</strong>
          <span className={styles.metricHint}>Current page · {pagination.limit} per page</span>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Events represented</span>
          <strong>{eventCount}</strong>
          <span className={styles.metricHint}>On the current page</span>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Workshops represented</span>
          <strong>{workshopCount}</strong>
          <span className={styles.metricHint}>
            {isSuperadmin
              ? `${confirmedOnPage} confirmed on this page`
              : "Confirmed registrations only"}
          </span>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}>DIRECTORY</span>
            <h2>All participants</h2>
            <p>
              Search participant details and narrow the directory using filters.
            </p>
          </div>

          <span className={styles.pageIndicator}>
            Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
          </span>
        </div>

        <div className={styles.filters}>
          <label className={styles.searchField}>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search name, email, mobile, college..."
              value={search}
              onChange={(event) =>
                updateFilter(setSearch)(event.target.value)
              }
            />
          </label>

          <select
            aria-label="Registration type"
            value={type}
            onChange={(event) => updateFilter(setType)(event.target.value)}
          >
            <option value="">All types</option>
            <option value="event">Events</option>
            <option value="workshop">Workshops</option>
          </select>

          {isSuperadmin && (
            <select
              aria-label="Registration status"
              value={status}
              onChange={(event) => updateFilter(setStatus)(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending_payment">Pending payment</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          )}

          <select
            aria-label="Gender"
            value={gender}
            onChange={(event) => updateFilter(setGender)(event.target.value)}
          >
            <option value="">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            type="text"
            aria-label="Filter by state"
            placeholder="State"
            value={state}
            onChange={(event) => updateFilter(setState)(event.target.value)}
          />

          <label className={styles.dateFilter}>
            <span>From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                updateFilter(setDateFrom)(event.target.value)
              }
            />
          </label>

          <label className={styles.dateFilter}>
            <span>To</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) =>
                updateFilter(setDateTo)(event.target.value)
              }
            />
          </label>

          <select
            aria-label="Sort participants"
            value={sort}
            onChange={(event) => updateFilter(setSort)(event.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              setSearch("");
              setType("");
              setStatus("");
              setGender("");
              setState("");
              setDateFrom("");
              setDateTo("");
              setSort("newest");
              setPage(1);
            }}
          >
            Reset
          </button>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Contact</th>
                <th>Event / Workshop</th>
                <th>Registration</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>

            <tbody>
              {loading && participants.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    Loading participants...
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    <span className={styles.emptyIcon}>◎</span>
                    <strong>No participants found</strong>
                    <span>Try changing your search or filters.</span>
                  </td>
                </tr>
              ) : (
                participants.map((participant) => (
                  <tr key={participant.id}>
                    <td>
                      <div className={styles.participantCell}>
                        <div className={styles.avatar}>
                          {participant.fullName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className={styles.primaryInfo}>
                          <strong>{participant.fullName}</strong>
                          <span>
                            {participant.collegeName || "College not provided"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className={styles.contactInfo}>
                        <span>{participant.email}</span>
                        <span>{participant.mobileNumber}</span>
                      </div>
                    </td>

                    <td>
                      <div className={styles.itemInfo}>
                        <strong>{participant.itemName}</strong>
                        <span
                          className={
                            participant.itemType === "event"
                              ? styles.eventTag
                              : styles.workshopTag
                          }
                        >
                          {participant.itemType}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className={styles.registrationInfo}>
                        <strong>{participant.registrationCode}</strong>
                        <span>
                          {participant.teamName || "Individual registration"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={styles.roleTag}>
                        {participant.participantRole}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`${styles.status} ${
                          styles[participant.registrationStatus]
                        }`}
                      >
                        {statusLabels[participant.registrationStatus] ??
                          participant.registrationStatus}
                      </span>
                    </td>

                    <td className={styles.dateCell}>
                      {formatDate(participant.registrationCreatedAt)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className={styles.viewButton}
                        onClick={() => setSelectedParticipant(participant)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className={styles.pagination}>
          <span>
            Showing{" "}
            {pagination.total === 0
              ? 0
              : (pagination.page - 1) * pagination.limit + 1}
            {"–"}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total.toLocaleString("en-IN")} participants
          </span>

          <div className={styles.paginationActions}>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <span>{pagination.page}</span>
            <button
              type="button"
              disabled={page >= pagination.totalPages || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.totalPages, current + 1),
                )
              }
            >
              Next
            </button>
          </div>
        </footer>
      </section>

      {selectedParticipant && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedParticipant(null);
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="participant-modal-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>PARTICIPANT PROFILE</span>
                <h2 id="participant-modal-title">
                  {selectedParticipant.fullName}
                </h2>
                <p>{selectedParticipant.registrationCode}</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close participant details"
                onClick={() => setSelectedParticipant(null)}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Personal information</h3>
                <div className={styles.detailGrid}>
                  <Detail label="Email" value={selectedParticipant.email} />
                  <Detail label="Mobile" value={selectedParticipant.mobileNumber} />
                  <Detail label="Gender" value={selectedParticipant.gender} />
                  <Detail label="City" value={selectedParticipant.city} />
                  <Detail label="State" value={selectedParticipant.state} />
                  <Detail label="College" value={selectedParticipant.collegeName} />
                  <Detail label="Department" value={selectedParticipant.department} />
                  <Detail label="Degree" value={selectedParticipant.degree} />
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Registration information</h3>
                <div className={styles.detailGrid}>
                  <Detail
                    label="Event / Workshop"
                    value={selectedParticipant.itemName}
                  />
                  <Detail
                    label="Type"
                    value={selectedParticipant.itemType}
                  />
                  <Detail
                    label="Participant role"
                    value={selectedParticipant.participantRole}
                  />
                  <Detail
                    label="Registration code"
                    value={selectedParticipant.registrationCode}
                  />
                  <Detail
                    label="Team name"
                    value={selectedParticipant.teamName}
                  />
                  <Detail
                    label="Team size"
                    value={selectedParticipant.teamSize}
                  />
                  <Detail
                    label="Registration status"
                    value={statusLabels[selectedParticipant.registrationStatus]}
                    className={`${styles.status} ${
                      styles[selectedParticipant.registrationStatus]
                    }`}
                  />
                  <Detail
                    label="Registration date"
                    value={formatDate(selectedParticipant.registrationCreatedAt)}
                  />
                  <Detail
                    label="Confirmed date"
                    value={formatDate(selectedParticipant.confirmedAt)}
                  />
                  {isSuperadmin && (
                    <Detail
                      label="Registration amount"
                      value={formatCurrency(
                        selectedParticipant.totalAmountPaise,
                        selectedParticipant.currency,
                      )}
                    />
                  )}
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.closeModalButton}
                onClick={() => setSelectedParticipant(null)}
              >
                Close details
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}) {
  return (
    <div className={styles.detailItem}>
      <span>{label}</span>
      <strong className={className}>
        {value === null || value === undefined || value === "" ? "—" : value}
      </strong>
    </div>
  );
}
