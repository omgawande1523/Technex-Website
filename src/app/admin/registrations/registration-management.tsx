
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./registration-management.module.css";

type Registration = {
  id: string;
  registrationCode: string;
  registrableItemId: string;
  itemType: "event" | "workshop";
  itemName: string;
  teamName: string | null;
  teamSize: number;
  activeParticipantCount?: number;
  status: "pending_payment" | "confirmed" | "cancelled" | "expired";
  totalAmountPaise: number;
  currency: string;
  createdAt: string;
  confirmedAt: string | null;
};

type Participant = {
  id: string;
  role: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string | null;
  state: string | null;
  city: string | null;
  collegeName: string | null;
  department: string | null;
  degree: string | null;
};

type RegistrationAnswer = {
  id: string;
  participantId: string | null;
  fieldId: string;
  fieldKey: string;
  label: string;
  fieldType: string;
  scope: string;
  options: unknown;
  answer: unknown;
};

type Payment = {
  id: string;
  registrationId: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  failureCode: string | null;
  failureDescription: string | null;
  createdAt: string;
  capturedAt: string | null;
};

type RegistrationDetails = {
  registration: Omit<
    Registration,
    "itemType" | "itemName" | "activeParticipantCount"
  > & {
    teamLeaderId: string;
    feeTypeSnapshot: string;
    feeAmountSnapshotPaise: number;
    registrableItemSnapshot: { name?: string } | null;
    expiresAt: string | null;
  };
  participants: Participant[];
  payments: Payment[];
  receipt: {
    id: string;
    receiptNumber: string;
    receiptUrl: string | null;
    paymentId: string;
    issuedAt: string;
  } | null;
  registrationAnswers: RegistrationAnswer[];
  participantAnswers: RegistrationAnswer[];
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
  initialRegistrations: Registration[];
  initialPagination: Pagination;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusLabels: Record<Registration["status"], string> = {
  pending_payment: "Pending Payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  expired: "Expired",
};

const statusClasses: Record<Registration["status"], string> = {
  pending_payment: styles.pending,
  confirmed: styles.confirmed,
  cancelled: styles.cancelled,
  expired: styles.expired,
};

export default function RegistrationManagement({
  accessToken,
  role,
  initialRegistrations,
  initialPagination,
}: Props) {
  const [registrations, setRegistrations] =
    useState<Registration[]>(initialRegistrations);
  const [pagination, setPagination] =
    useState<Pagination>(initialPagination);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const lastFetchedQuery = useRef("page=1&limit=20&sort=newest");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const buildParams = useCallback(
    (currentPage: number, limit = 20) => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        sort: "newest",
      });

      if (search.trim()) params.set("search", search.trim());
      if (type) params.set("type", type);
      if (status) params.set("status", status);
      if (dateFrom) params.set("fromDate", dateFrom);
      if (dateTo) params.set("toDate", dateTo);

      return params;
    },
    [search, type, status, dateFrom, dateTo],
  );

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = buildParams(page);

      const response = await fetch(
        `${API_URL}/api/admin/registrations?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load registrations.");
      }

      const result = await response.json();

      setRegistrations(result.data ?? []);
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
      fetchRegistrations();
    }, 350);

    return () => clearTimeout(timeout);
  }, [buildParams, fetchRegistrations, page]);

  useEffect(() => {
    const isModalOpen = detailLoading || selectedRegistration !== null;
    if (!isModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !detailLoading) {
        setSelectedRegistration(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [detailLoading, selectedRegistration]);

  const openDetails = async (registrationCode: string) => {
    setDetailLoading(true);
    setSelectedRegistration(null);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/registrations/${encodeURIComponent(registrationCode)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load registration details.");
      }

      const result = await response.json();
      setSelectedRegistration(result.data ?? result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load details.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const formatAmount = (amountPaise: number, currency: string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(amountPaise / 100);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatAnswer = (answer: unknown): string => {
    if (answer === null || answer === undefined || answer === "") return "—";
    if (Array.isArray(answer)) return answer.map(String).join(", ");
    if (typeof answer === "object") return JSON.stringify(answer);
    return String(answer);
  };

  const exportRegistrationsToCsv = async () => {
    setExportLoading(true);
    setError("");

    try {
      const allRegistrations: Registration[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const params = buildParams(currentPage, 100);

        const response = await fetch(
          `${API_URL}/api/admin/registrations?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to export registrations.");
        }

        const result = await response.json();
        allRegistrations.push(...(result.data ?? []));
        totalPages = result.pagination?.totalPages ?? 1;
        currentPage++;
      } while (currentPage <= totalPages);

      const headers = [
        "Registration Code",
        "Event / Workshop",
        "Type",
        "Team Name",
        "Participants",
        "Amount",
        "Currency",
        "Status",
        "Created At",
        "Confirmed At",
      ];

      const escapeCsv = (value: unknown) => {
        const text = String(value ?? "");
        const safeText = /^[\s]*[=+\-@]/.test(text)
          ? `'${text}`
          : text;
        return `"${safeText.replace(/"/g, '""')}"`;
      };

      const rows = allRegistrations.map((item) => [
        item.registrationCode,
        item.itemName,
        item.itemType,
        item.teamName || "Individual",
        item.activeParticipantCount ?? item.teamSize,
        (item.totalAmountPaise / 100).toFixed(2),
        item.currency,
        statusLabels[item.status],
        item.createdAt,
        item.confirmedAt ?? "",
      ]);

      const csv = [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) => row.map(escapeCsv).join(",")),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "technex-registrations.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to export registrations.",
      );
    } finally {
      setExportLoading(false);
    }
  };

  const detail = selectedRegistration;
  const registration = detail?.registration;

  const confirmedCount = pagination.total
    ? registrations.filter((item) => item.status === "confirmed").length
    : 0;

  const pendingCount = registrations.filter(
    (item) => item.status === "pending_payment",
  ).length;

  const totalOnPage = registrations.reduce(
    (sum, item) => sum + item.totalAmountPaise,
    0,
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>REGISTRATION MANAGEMENT</span>
          <h1 className={styles.pageTitle}>Registrations</h1>
          <p className={styles.pageDescription}>
            Monitor event and workshop sign-ups, participant details and payment records.
          </p>
        </div>

        <button
          className={styles.exportButton}
          onClick={exportRegistrationsToCsv}
          disabled={exportLoading || pagination.total === 0}
        >
          <span aria-hidden="true">↓</span>
          {exportLoading ? "Preparing CSV..." : "Export CSV"}
        </button>
      </section>

      <section className={styles.metrics}>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Total registrations</span>
          <strong>{pagination.total.toLocaleString("en-IN")}</strong>
          <span className={styles.metricHint}>Across all pages</span>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Confirmed on this page</span>
          <strong>{confirmedCount}</strong>
          <span className={styles.metricHint}>Current page results</span>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Pending on this page</span>
          <strong>{pendingCount}</strong>
          <span className={styles.metricHint}>Awaiting payment</span>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Value on this page</span>
          <strong>{formatAmount(totalOnPage, "INR")}</strong>
          <span className={styles.metricHint}>Current page total</span>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}>RECORDS</span>
            <h2>All registrations</h2>
            <p>{pagination.total.toLocaleString("en-IN")} records found</p>
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
              placeholder="Search code, team, participant, email..."
              aria-label="Search registrations"
            />
          </label>

          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            <option value="event">Events</option>
            <option value="workshop">Workshops</option>
          </select>

          <label className={styles.dateFilter}>
            <span>From</span>
            <input
              type="date"
              aria-label="Filter registrations from date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <label className={styles.dateFilter}>
            <span>To</span>
            <input
              type="date"
              aria-label="Filter registrations to date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
          </label>

          {role === "superadmin" && (
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="pending_payment">Pending payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.emptyState}>
            <span className={styles.loader} />
            <p>Loading registrations...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>▤</span>
            <h3>No registrations found</h3>
            <p>Try changing your search or filter criteria.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Registration</th>
                  <th>Event / Workshop</th>
                  <th>Team</th>
                  <th>Participants</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {registrations.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong className={styles.registrationCode}>
                        {item.registrationCode}
                      </strong>
                      <span className={styles.typeLabel}>
                        {item.itemType}
                      </span>
                    </td>
                    <td className={styles.itemName}>{item.itemName}</td>
                    <td>{item.teamName || "Individual"}</td>
                    <td>
                      <span className={styles.participantCount}>
                        {item.activeParticipantCount ?? item.teamSize}
                      </span>
                    </td>
                    <td className={styles.amount}>
                      {formatAmount(item.totalAmountPaise, item.currency)}
                    </td>
                    <td>
                      <span className={`${styles.status} ${statusClasses[item.status]}`}>
                        <span />
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => openDetails(item.registrationCode)}
                      >
                        View details <span aria-hidden="true">↗</span>
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
            Showing {registrations.length ? (page - 1) * 20 + 1 : 0}–{Math.min(page * 20, pagination.total)} of {pagination.total}
          </span>
          <div>
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              ← Previous
            </button>
            <button
              disabled={page >= (pagination.totalPages ?? 1) || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </section>

      {(detailLoading || detail) && (
        <div
          className={styles.modalBackdrop}
          onClick={() => {
            if (!detailLoading) setSelectedRegistration(null);
          }}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            {detailLoading ? (
              <div className={styles.modalLoading}>
                <span className={styles.loader} />
                <p>Loading registration details...</p>
              </div>
            ) : (
              <>
                <header className={styles.modalHeader}>
                  <div>
                    <span className={styles.eyebrow}>REGISTRATION RECORD</span>
                    <h2>Registration details</h2>
                    <p>{registration?.registrationCode}</p>
                  </div>
                  <button
                    className={styles.closeButton}
                    onClick={() => setSelectedRegistration(null)}
                    aria-label="Close details"
                  >
                    ×
                  </button>
                </header>

                <section className={styles.detailGrid}>
                  {[
                    ["Item", registration?.registrableItemSnapshot?.name || "—"],
                    ["Team", registration?.teamName || "Individual"],
                    ["Team size", registration?.teamSize ?? "—"],
                    [
                      "Amount",
                      registration
                        ? formatAmount(registration.totalAmountPaise, registration.currency)
                        : "—",
                    ],
                    [
                      "Status",
                      statusLabels[registration?.status as Registration["status"]] ??
                        registration?.status ??
                        "—",
                    ],
                    [
                      "Registered",
                      registration?.createdAt ? formatDate(registration.createdAt) : "—",
                    ],
                  ].map(([label, value]) => (
                    <div className={styles.detailCard} key={label}>
                      <span>{label}</span>
                      <strong>{String(value)}</strong>
                    </div>
                  ))}
                </section>

                <section className={styles.detailSection}>
                  <div className={styles.sectionHeading}>
                    <h3>Participants</h3>
                    <span>{detail?.participants?.length ?? 0}</span>
                  </div>

                  {detail?.participants?.length ? (
                    <div className={styles.detailTableWrap}>
                      <table className={styles.detailTable}>
                        <thead>
                          <tr>
                            <th>Participant</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Mobile</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.participants.map((person) => (
                            <tr key={person.id}>
                              <td>
                                <strong>{person.fullName}</strong>
                                <span>
                                  {person.degree || "—"} · {person.department || "—"}
                                </span>
                                <span>{person.collegeName || "College not provided"}</span>
                                <span>
                                  {[person.city, person.state].filter(Boolean).join(", ") ||
                                    "Location not provided"}
                                </span>
                              </td>
                              <td>{person.role}</td>
                              <td>{person.email}</td>
                              <td>{person.mobileNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className={styles.mutedText}>No participant details available.</p>
                  )}
                </section>

                <section className={styles.detailSection}>
                  <h3>Registration form responses</h3>
                  {detail?.registrationAnswers?.length ? (
                    <div className={styles.answerGrid}>
                      {detail.registrationAnswers.map((answer) => (
                        <div className={styles.answerCard} key={answer.id}>
                          <span>{answer.label}</span>
                          <p>{formatAnswer(answer.answer)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.mutedText}>No registration-level responses.</p>
                  )}
                </section>

                <section className={styles.detailSection}>
                  <h3>Participant form responses</h3>
                  {detail?.participantAnswers?.length ? (
                    <div className={styles.answerList}>
                      {detail.participantAnswers.map((answer) => {
                        const participant = detail.participants.find(
                          (person) => person.id === answer.participantId,
                        );

                        return (
                          <div className={styles.answerCard} key={answer.id}>
                            <span className={styles.answerPerson}>
                              {participant?.fullName ?? "Unknown participant"}
                            </span>
                            <span>{answer.label}</span>
                            <p>{formatAnswer(answer.answer)}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.mutedText}>No participant-level responses.</p>
                  )}
                </section>

                <section className={styles.detailSection}>
                  <div className={styles.sectionHeading}>
                    <h3>Payment history</h3>
                    <span>{detail?.payments?.length ?? 0}</span>
                  </div>

                  {detail?.payments?.length ? (
                    <div className={styles.paymentList}>
                      {detail.payments.map((payment) => (
                        <article className={styles.paymentCard} key={payment.id}>
                          <div className={styles.paymentTop}>
                            <strong>{payment.status}</strong>
                            <strong>
                              {formatAmount(payment.amountPaise, payment.currency)}
                            </strong>
                          </div>
                          <p>Created: {formatDate(payment.createdAt)}</p>
                          {payment.paymentMethod && (
                            <p>Method: {payment.paymentMethod.toUpperCase()}</p>
                          )}
                          {payment.razorpayOrderId && (
                            <p className={styles.referenceText}>
                              Order ID: {payment.razorpayOrderId}
                            </p>
                          )}
                          {payment.razorpayPaymentId && (
                            <p className={styles.referenceText}>
                              Payment ID: {payment.razorpayPaymentId}
                            </p>
                          )}
                          {payment.capturedAt && (
                            <p className={styles.capturedText}>
                              Captured: {formatDate(payment.capturedAt)}
                            </p>
                          )}
                          {payment.failureDescription && (
                            <p className={styles.failureText}>
                              Failure: {payment.failureDescription}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.mutedText}>No payment attempts found.</p>
                  )}
                </section>

                {detail?.receipt && (
                  <section className={styles.receiptCard}>
                    <h3>Payment receipt</h3>
                    <div className={styles.receiptGrid}>
                      <div>
                        <span>Receipt number</span>
                        <strong>{detail.receipt.receiptNumber}</strong>
                      </div>
                      <div>
                        <span>Issued on</span>
                        <strong>{formatDate(detail.receipt.issuedAt)}</strong>
                      </div>
                      <div>
                        <span>Payment reference</span>
                        <strong className={styles.referenceText}>
                          {detail.receipt.paymentId}
                        </strong>
                      </div>
                    </div>
                    {detail.receipt.receiptUrl ? (
                      <a
                        href={detail.receipt.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.receiptButton}
                      >
                        Open receipt ↗
                      </a>
                    ) : (
                      <p className={styles.mutedText}>
                        Receipt document is not available.
                      </p>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
