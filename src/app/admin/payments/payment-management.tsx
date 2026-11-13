
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./payment-management.module.css";

type PaymentStatus =
  | "created"
  | "pending"
  | "authorized"
  | "captured"
  | "failed"
  | "cancelled";

type Payment = {
  id: string;
  registrationId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  failureCode: string | null;
  failureDescription: string | null;
  createdAt: string;
  capturedAt: string | null;
  registrationCode: string;
  registrationStatus: string;
  registrationAmountPaise: number;
  registrationCurrency: string;
  registrationCreatedAt: string;
  confirmedAt: string | null;
  teamName: string | null;
  teamSize: number;
  registrableItemId: string;
  itemType: "event" | "workshop";
  itemName: string;
  participants: {
    id: string;
    registrationId: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    role: string;
  }[];
  participantCount: number;
  participantNames: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type AdminRole = "superadmin" | "coordinator";

type Props = {
  accessToken: string;
  role: AdminRole;
  initialPayments: Payment[];
  initialPagination: Pagination;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusLabels: Record<PaymentStatus, string> = {
  created: "Created",
  pending: "Pending",
  authorized: "Authorized",
  captured: "Captured",
  failed: "Failed",
  cancelled: "Cancelled",
};

const formatDate = (value: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatCurrency = (amountPaise: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountPaise / 100);

const escapeCsv = (value: unknown) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function PaymentManagement({
  accessToken,
  role,
  initialPayments,
  initialPagination,
}: Props) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [pagination, setPagination] = useState(initialPagination);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

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
      if (status) params.set("status", status);
      if (registrationStatus) {
        params.set("registrationStatus", registrationStatus);
      }
      if (type) params.set("type", type);
      if (dateFrom) params.set("fromDate", dateFrom);
      if (dateTo) params.set("toDate", dateTo);

      return params;
    },
    [search, status, registrationStatus, type, dateFrom, dateTo, sort],
  );

  const fetchPayments = useCallback(async () => {
    if (!API_URL) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = buildParams(page);

      const response = await fetch(
        `${API_URL}/api/admin/payments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Failed to load payments.");
      }

      const result = await response.json();

      setPayments(result.data ?? []);
      setPagination(
        result.pagination ?? {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, buildParams]);

  useEffect(() => {
    const queryKey = buildParams(page).toString();

    if (lastFetchedQuery.current === queryKey) return;

    lastFetchedQuery.current = queryKey;

    const timeout = setTimeout(() => {
      fetchPayments();
    }, 350);

    return () => clearTimeout(timeout);
  }, [buildParams, fetchPayments, page]);

  useEffect(() => {
    if (!selectedPayment) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPayment(null);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPayment]);

  const updateFilter =
    (setter: (value: string) => void) => (value: string) => {
      setter(value);
      setPage(1);
    };

  const exportPayments = async () => {
    if (!API_URL) return;

    setExportLoading(true);
    setError("");

    try {
      const exportLimit = 100;
      const firstParams = buildParams(1, exportLimit);

      const firstResponse = await fetch(
        `${API_URL}/api/admin/payments?${firstParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );

      if (!firstResponse.ok) {
        throw new Error("Unable to export payments.");
      }

      const firstResult = await firstResponse.json();
      const allPayments: Payment[] = [...(firstResult.data ?? [])];
      const totalPages = firstResult.pagination?.totalPages ?? 1;

      for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
        const params = buildParams(currentPage, exportLimit);

        const response = await fetch(
          `${API_URL}/api/admin/payments?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Unable to complete the payment export.");
        }

        const result = await response.json();
        allPayments.push(...(result.data ?? []));
      }

      const columns = [
        "Payment ID",
        "Razorpay Order ID",
        "Razorpay Payment ID",
        "Amount",
        "Currency",
        "Payment Status",
        "Payment Method",
        "Registration Code",
        "Registration Status",
        "Event / Workshop",
        "Type",
        "Team Name",
        "Participants",
        "Payment Created",
        "Captured At",
        "Failure Code",
        "Failure Description",
      ];

      const rows = allPayments.map((payment) => [
        payment.id,
        payment.razorpayOrderId,
        payment.razorpayPaymentId,
        payment.amountPaise / 100,
        payment.currency,
        payment.status,
        payment.paymentMethod,
        payment.registrationCode,
        payment.registrationStatus,
        payment.itemName,
        payment.itemType,
        payment.teamName,
        payment.participantNames,
        payment.createdAt,
        payment.capturedAt,
        payment.failureCode,
        payment.failureDescription,
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
      link.download = `tnx-payments-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExportLoading(false);
    }
  };

  const capturedOnPage = payments.filter(
    (payment) => payment.status === "captured",
  );

  const capturedAmountOnPage = capturedOnPage.reduce(
    (sum, payment) => sum + payment.amountPaise,
    0,
  );

  const failedOnPage = payments.filter(
    (payment) => payment.status === "failed",
  ).length;

  const pendingOnPage = payments.filter((payment) =>
    ["created", "pending", "authorized"].includes(payment.status),
  ).length;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>TNX'26 · FINANCE</span>
          <h1 className={styles.pageTitle}>Payments</h1>
          <p className={styles.pageDescription}>
            Monitor Razorpay transactions, payment attempts, and registration
            collections.
          </p>
        </div>

        <button
          type="button"
          className={styles.exportButton}
          onClick={exportPayments}
          disabled={exportLoading || pagination.total === 0}
        >
          <span aria-hidden="true">↓</span>
          {exportLoading ? "Preparing CSV..." : "Export CSV"}
        </button>
      </header>

      <section className={styles.metrics}>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Matching payment attempts</span>
          <strong>{pagination.total.toLocaleString("en-IN")}</strong>
          <span className={styles.metricHint}>Based on current filters</span>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Captured on this page</span>
          <strong>{capturedOnPage.length}</strong>
          <span className={styles.metricHint}>Successful payment attempts</span>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Captured amount · This page</span>
          <strong>{formatCurrency(capturedAmountOnPage)}</strong>
          <span className={styles.metricHint}>Captured transactions only</span>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Failed / In progress</span>
          <strong>{failedOnPage} / {pendingOnPage}</strong>
          <span className={styles.metricHint}>On the current page</span>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}>TRANSACTION LEDGER</span>
            <h2>Payment attempts</h2>
            <p>
              Each row represents one payment attempt. A registration may have
              multiple attempts.
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
              placeholder="Search payment, order, registration, participant..."
              value={search}
              onChange={(event) => updateFilter(setSearch)(event.target.value)}
            />
          </label>

          <select
            aria-label="Payment status"
            value={status}
            onChange={(event) => updateFilter(setStatus)(event.target.value)}
          >
            <option value="">All payment statuses</option>
            <option value="created">Created</option>
            <option value="pending">Pending</option>
            <option value="authorized">Authorized</option>
            <option value="captured">Captured</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {isSuperadmin && (
            <select
              aria-label="Registration status"
              value={registrationStatus}
              onChange={(event) =>
                updateFilter(setRegistrationStatus)(event.target.value)
              }
            >
              <option value="">All registration statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending_payment">Pending payment</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          )}

          <select
            aria-label="Item type"
            value={type}
            onChange={(event) => updateFilter(setType)(event.target.value)}
          >
            <option value="">Events & workshops</option>
            <option value="event">Events</option>
            <option value="workshop">Workshops</option>
          </select>

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
              min={dateFrom || undefined}
              value={dateTo}
              onChange={(event) =>
                updateFilter(setDateTo)(event.target.value)
              }
            />
          </label>

          <select
            aria-label="Sort payment attempts"
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
              setStatus("");
              setRegistrationStatus("");
              setType("");
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
                <th>Transaction</th>
                <th>Registration</th>
                <th>Event / Workshop</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Payment status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading && payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    <span className={styles.emptyIcon}>₹</span>
                    <strong>No payment records found</strong>
                    <span>Try changing your search or filters.</span>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <div className={styles.transactionInfo}>
                        <strong>
                          {payment.razorpayPaymentId || "Payment not generated"}
                        </strong>
                        <span>Order: {payment.razorpayOrderId}</span>
                      </div>
                    </td>

                    <td>
                      <div className={styles.registrationInfo}>
                        <strong>{payment.registrationCode}</strong>
                        <span>
                          {payment.teamName || "Individual registration"}
                        </span>
                        <span className={styles.participantCount}>
                          {payment.participantCount} participant
                          {payment.participantCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className={styles.itemInfo}>
                        <strong>{payment.itemName}</strong>
                        <span
                          className={
                            payment.itemType === "event"
                              ? styles.eventTag
                              : styles.workshopTag
                          }
                        >
                          {payment.itemType}
                        </span>
                      </div>
                    </td>

                    <td className={styles.amountCell}>
                      {formatCurrency(payment.amountPaise, payment.currency)}
                    </td>

                    <td className={styles.methodCell}>
                      {payment.paymentMethod || "—"}
                    </td>

                    <td>
                      <span
                        className={`${styles.status} ${styles[payment.status]}`}
                      >
                        {statusLabels[payment.status]}
                      </span>
                    </td>

                    <td className={styles.dateCell}>
                      {formatDate(payment.createdAt)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className={styles.viewButton}
                        onClick={() => setSelectedPayment(payment)}
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
            {Math.min(
              pagination.page * pagination.limit,
              pagination.total,
            )}{" "}
            of {pagination.total.toLocaleString("en-IN")} payment attempts
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

      {selectedPayment && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPayment(null);
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>PAYMENT DETAILS</span>
                <h2 id="payment-modal-title">
                  {formatCurrency(
                    selectedPayment.amountPaise,
                    selectedPayment.currency,
                  )}
                </h2>
                <p>{selectedPayment.registrationCode}</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close payment details"
                onClick={() => setSelectedPayment(null)}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Transaction information</h3>
                <div className={styles.detailGrid}>
                  <Detail
                    label="Payment status"
                    value={statusLabels[selectedPayment.status]}
                    className={`${styles.status} ${styles[selectedPayment.status]}`}
                  />
                  <Detail label="Payment method" value={selectedPayment.paymentMethod} />
                  <Detail label="Amount" value={formatCurrency(selectedPayment.amountPaise, selectedPayment.currency)} />
                  <Detail label="Payment created" value={formatDate(selectedPayment.createdAt)} />
                  <Detail label="Captured at" value={formatDate(selectedPayment.capturedAt)} />
                  <Detail label="Razorpay order ID" value={selectedPayment.razorpayOrderId} />
                  <Detail label="Razorpay payment ID" value={selectedPayment.razorpayPaymentId} />
                  <Detail label="Internal payment ID" value={selectedPayment.id} />
                </div>
              </div>

              {(selectedPayment.failureCode || selectedPayment.failureDescription) && (
                <div className={styles.detailSection}>
                  <h3>Failure information</h3>
                  <div className={styles.detailGrid}>
                    <Detail label="Failure code" value={selectedPayment.failureCode} />
                    <Detail label="Failure description" value={selectedPayment.failureDescription} />
                  </div>
                </div>
              )}

              <div className={styles.detailSection}>
                <h3>Registration information</h3>
                <div className={styles.detailGrid}>
                  <Detail label="Registration code" value={selectedPayment.registrationCode} />
                  <Detail label="Registration status" value={selectedPayment.registrationStatus} />
                  <Detail label="Event / Workshop" value={selectedPayment.itemName} />
                  <Detail label="Type" value={selectedPayment.itemType} />
                  <Detail label="Team name" value={selectedPayment.teamName} />
                  <Detail label="Team size" value={selectedPayment.teamSize} />
                  <Detail label="Registration amount" value={formatCurrency(selectedPayment.registrationAmountPaise, selectedPayment.registrationCurrency)} />
                  <Detail label="Registration date" value={formatDate(selectedPayment.registrationCreatedAt)} />
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Participants ({selectedPayment.participants.length})</h3>
                {selectedPayment.participants.length === 0 ? (
                  <p className={styles.noParticipants}>No active participants found.</p>
                ) : (
                  <div className={styles.participantList}>
                    {selectedPayment.participants.map((participant) => (
                      <div className={styles.participantRow} key={participant.id}>
                        <div>
                          <strong>{participant.fullName}</strong>
                          <span>{participant.email}</span>
                          <span>{participant.mobileNumber}</span>
                        </div>
                        <span className={styles.roleTag}>{participant.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.closeModalButton}
                onClick={() => setSelectedPayment(null)}
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
