"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./audit-log-management.module.css";

type AuditLog = {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type Props = {
  accessToken: string;
  initialLogs: AuditLog[];
  initialPagination: Pagination;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLabel = (value: string) =>
  value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatJson = (value: unknown) => {
  if (value === null || value === undefined) return "No additional details";

  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const getActionClass = (action: string) => {
  const normalized = action.toLowerCase();

  if (
    normalized.includes("delete") ||
    normalized.includes("remove") ||
    normalized.includes("deactivate")
  ) {
    return styles.actionDanger;
  }

  if (
    normalized.includes("create") ||
    normalized.includes("add") ||
    normalized.includes("invite")
  ) {
    return styles.actionCreate;
  }

  if (
    normalized.includes("update") ||
    normalized.includes("edit") ||
    normalized.includes("assign")
  ) {
    return styles.actionUpdate;
  }

  if (
    normalized.includes("login") ||
    normalized.includes("logout")
  ) {
    return styles.actionAuth;
  }

  return styles.actionDefault;
};

export default function AuditLogManagement({
  accessToken,
  initialLogs,
  initialPagination,
}: Props) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [pagination, setPagination] =
    useState<Pagination>(initialPagination);

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [actorId, setActorId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const lastFetchedQuery = useRef("page=1&limit=20");

  const buildParams = useCallback(
    (currentPage: number) => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "20",
      });

      if (search.trim()) params.set("search", search.trim());
      if (action.trim()) params.set("action", action.trim());
      if (entityType.trim()) {
        params.set("entityType", entityType.trim());
      }
      if (actorId.trim()) params.set("actorId", actorId.trim());

      if (dateFrom) {
        params.set("from", `${dateFrom}T00:00:00.000Z`);
      }

      if (dateTo) {
        params.set("to", `${dateTo}T23:59:59.999Z`);
      }

      return params;
    },
    [search, action, entityType, actorId, dateFrom, dateTo],
  );

  const fetchLogs = useCallback(async () => {
    if (!API_URL) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = buildParams(page);

      const response = await fetch(
        `${API_URL}/api/admin/audit-logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load audit logs.",
        );
      }

      setLogs(result.data ?? []);
      setPagination(
        result.pagination ?? {
          page,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load audit logs.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, buildParams, page]);

  useEffect(() => {
    const queryKey = buildParams(page).toString();

    if (lastFetchedQuery.current === queryKey) return;

    const timeout = window.setTimeout(() => {
      lastFetchedQuery.current = queryKey;
      fetchLogs();
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [buildParams, fetchLogs, page]);

  useEffect(() => {
    if (!selectedLog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedLog(null);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedLog]);

  const resetFilters = () => {
    setSearch("");
    setAction("");
    setEntityType("");
    setActorId("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const refreshLogs = () => {
    lastFetchedQuery.current = "";
    fetchLogs();
  };

  const firstRecord = pagination.total
    ? (page - 1) * pagination.limit + 1
    : 0;

  const lastRecord = Math.min(
    page * pagination.limit,
    pagination.total,
  );

  const latestLog = logs[0];

  const uniqueActors = new Set(
    logs.map((log) => log.actorId).filter(Boolean),
  ).size;

  const selectedDetails = selectedLog
    ? formatJson(selectedLog.details)
    : "";

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>
            SYSTEM OVERSIGHT
          </span>

          <h1 className={styles.pageTitle}>Audit Logs</h1>

          <p className={styles.pageDescription}>
            Track administrator activity and monitor important
            changes across the TECHNEX platform.
          </p>
        </div>

        <button
          className={styles.refreshButton}
          onClick={refreshLogs}
          disabled={loading}
        >
          <span aria-hidden="true">↻</span>
          {loading ? "Refreshing..." : "Refresh logs"}
        </button>
      </section>

      <section className={styles.metrics}>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Total log entries</span>
          <strong>{pagination.total.toLocaleString("en-IN")}</strong>
          <span className={styles.metricHint}>
            Across all recorded activity
          </span>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Records on this page</span>
          <strong>{logs.length}</strong>
          <span className={styles.metricHint}>
            Current page results
          </span>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Administrators active</span>
          <strong>{uniqueActors}</strong>
          <span className={styles.metricHint}>
            Unique actors on this page
          </span>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Latest activity</span>
          <strong className={styles.latestValue}>
            {latestLog ? formatDate(latestLog.createdAt) : "—"}
          </strong>
          <span className={styles.metricHint}>
            Most recent record on this page
          </span>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}>ACTIVITY HISTORY</span>
            <h2>All audit records</h2>
            <p>
              {pagination.total.toLocaleString("en-IN")} records found
            </p>
          </div>

          <span className={styles.pageIndicator}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        <div className={styles.filters}>
          <label className={styles.searchField}>
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search action, entity or administrator..."
              aria-label="Search audit logs"
            />
          </label>

          <input
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(1);
            }}
            placeholder="Action"
            aria-label="Filter by action"
          />

          <input
            value={entityType}
            onChange={(event) => {
              setEntityType(event.target.value);
              setPage(1);
            }}
            placeholder="Entity type"
            aria-label="Filter by entity type"
          />

          <input
            value={actorId}
            onChange={(event) => {
              setActorId(event.target.value);
              setPage(1);
            }}
            placeholder="Administrator ID"
            aria-label="Filter by administrator ID"
          />

          <label className={styles.dateFilter}>
            <span>From</span>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              aria-label="Filter from date"
            />
          </label>

          <label className={styles.dateFilter}>
            <span>To</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              aria-label="Filter to date"
            />
          </label>

          <button
            className={styles.clearButton}
            onClick={resetFilters}
          >
            Clear filters
          </button>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.emptyState}>
            <span className={styles.loader} />
            <p>Loading audit records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>◷</span>
            <h3>No audit records found</h3>
            <p>
              Activity will appear here once audit events have been
              recorded. Try changing your filters.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Administrator</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>IP address</th>
                  <th>Date & time</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className={styles.actorCell}>
                        <span className={styles.avatar}>
                          {(log.actorName || "S")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <span className={styles.actorInfo}>
                          <strong>{log.actorName || "System / Unknown"}</strong>
                          <span>
                            {log.actorRole
                              ? formatLabel(log.actorRole)
                              : "No role"}
                          </span>
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`${styles.actionBadge} ${getActionClass(log.action)}`}
                      >
                        {formatLabel(log.action)}
                      </span>
                    </td>

                    <td>
                      <span className={styles.entityType}>
                        {formatLabel(log.entityType)}
                      </span>
                    </td>

                    <td>
                      <span className={styles.idText}>
                        {log.entityId || "—"}
                      </span>
                    </td>

                    <td>
                      <span className={styles.ipText}>
                        {log.ipAddress || "—"}
                      </span>
                    </td>

                    <td className={styles.dateCell}>
                      {formatDate(log.createdAt)}
                    </td>

                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => setSelectedLog(log)}
                      >
                        Inspect <span aria-hidden="true">↗</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.pagination}>
          <span>
            Showing {firstRecord}–{lastRecord} of {pagination.total}
          </span>

          <div>
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              ← Previous
            </button>

            <button
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </section>

      {selectedLog && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedLog(null)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>AUDIT RECORD</span>
                <h2 id="audit-detail-title">Activity details</h2>
                <p className={styles.modalSubtitle}>
                  {selectedLog.id}
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setSelectedLog(null)}
                aria-label="Close details"
              >
                ×
              </button>
            </header>

            <section className={styles.detailGrid}>
              <div className={styles.detailCard}>
                <span>Administrator</span>
                <strong>{selectedLog.actorName || "System / Unknown"}</strong>
              </div>

              <div className={styles.detailCard}>
                <span>Role</span>
                <strong>
                  {selectedLog.actorRole
                    ? formatLabel(selectedLog.actorRole)
                    : "—"}
                </strong>
              </div>

              <div className={styles.detailCard}>
                <span>Action</span>
                <strong>{formatLabel(selectedLog.action)}</strong>
              </div>

              <div className={styles.detailCard}>
                <span>Entity type</span>
                <strong>{formatLabel(selectedLog.entityType)}</strong>
              </div>

              <div className={styles.detailCard}>
                <span>Entity ID</span>
                <strong className={styles.breakable}>
                  {selectedLog.entityId || "—"}
                </strong>
              </div>

              <div className={styles.detailCard}>
                <span>Timestamp</span>
                <strong>{formatDate(selectedLog.createdAt)}</strong>
              </div>

              <div className={styles.detailCard}>
                <span>IP address</span>
                <strong>{selectedLog.ipAddress || "—"}</strong>
              </div>

              <div className={styles.detailCard}>
                <span>Actor ID</span>
                <strong className={styles.breakable}>
                  {selectedLog.actorId || "—"}
                </strong>
              </div>
            </section>

            <section className={styles.detailSection}>
              <h3>Additional details</h3>
              <pre className={styles.jsonBlock}>{selectedDetails}</pre>
            </section>

            <section className={styles.detailSection}>
              <h3>User agent</h3>
              <p className={styles.userAgent}>
                {selectedLog.userAgent || "Not available"}
              </p>
            </section>
          </section>
        </div>
      )}
    </div>
  );
}