"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  RefreshCw,
  Users,
  Wallet,
  TrendingUp,
  Presentation,
  Trophy,
} from "lucide-react";

import {
  getEventsAnalytics,
  getWorkshopsAnalytics,
  type AdminAnalytics,
  type AnalyticsDateRange,
  type AnalyticsTrend,
} from "@/lib/api";

import styles from "./analytics.module.css";

type SectionState = {
  data: AdminAnalytics | null;
  loading: boolean;
  error: string | null;
};

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

function getMonthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-01`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

function formatCurrency(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100);
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function getPaymentLabel(status: string) {
  const labels: Record<string, string> = {
    created: "Created",
    pending: "Pending",
    authorized: "Authorized",
    captured: "Captured",
    failed: "Failed",
    cancelled: "Cancelled",
  };

  return labels[status] ?? status;
}

function getPaymentClass(status: string) {
  return styles[`status_${status}`] ?? "";
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
  accent?: string;
}) {
  return (
    <article className={styles.statCard}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        <span className={`${styles.statIcon} ${accent ?? ""}`}>
          <Icon size={19} />
        </span>
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statDetail}>{detail}</div>
    </article>
  );
}

function TrendChart({
  title,
  description,
  data,
  valueKey,
  currency = false,
}: {
  title: string;
  description: string;
  data: AnalyticsTrend[];
  valueKey: "registrations" | "revenuePaise";
  currency?: boolean;
}) {
  const values = data.map((item) => Number(item[valueKey] ?? 0));
  const maximum = Math.max(...values, 1);

  return (
    <article className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className={styles.panelIcon}>
          <TrendingUp size={18} />
        </span>
      </div>

      {data.length === 0 ? (
        <div className={styles.chartEmpty}>
          No trend data available for this period.
        </div>
      ) : (
        <div className={styles.chart}>
          <div className={styles.chartBars}>
            {data.map((item) => {
              const value = Number(item[valueKey] ?? 0);
              const height = Math.max((value / maximum) * 100, value ? 5 : 1);

              return (
                <div className={styles.barColumn} key={item.date}>
                  <div className={styles.barValue}>
                    {currency
                      ? formatCurrency(value)
                      : formatNumber(value)}
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.bar} ${
                        currency ? styles.revenueBar : ""
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${item.date}: ${
                        currency
                          ? formatCurrency(value)
                          : formatNumber(value)
                      }`}
                    />
                  </div>
                  <span className={styles.barDate}>
                    {formatDate(item.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

function PaymentBreakdown({
  data,
}: {
  data: AdminAnalytics["paymentRecordsByStatus"];
}) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  const colors: Record<string, string> = {
    captured: styles.segmentCaptured,
    pending: styles.segmentPending,
    created: styles.segmentCreated,
    authorized: styles.segmentAuthorized,
    failed: styles.segmentFailed,
    cancelled: styles.segmentCancelled,
  };

  return (
    <article className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3>Payment records</h3>
          <p>Current payment status distribution</p>
        </div>
        <span className={styles.panelIcon}>
          <CreditCard size={18} />
        </span>
      </div>

      {total === 0 ? (
        <div className={styles.chartEmpty}>
          No payment records found for this period.
        </div>
      ) : (
        <>
          <div className={styles.paymentTotal}>
            {formatNumber(total)}
            <span>payment records</span>
          </div>

          <div className={styles.paymentStack}>
            {data.map((item) => (
              <div
                key={item.status}
                className={colors[item.status] ?? styles.segmentOther}
                style={{ width: `${(item.total / total) * 100}%` }}
                title={`${getPaymentLabel(item.status)}: ${item.total}`}
              />
            ))}
          </div>

          <div className={styles.paymentLegend}>
            {data.map((item) => (
              <div className={styles.legendItem} key={item.status}>
                <span
                  className={`${styles.legendDot} ${
                    colors[item.status] ?? styles.segmentOther
                  }`}
                />
                <span>{getPaymentLabel(item.status)}</span>
                <strong>{formatNumber(item.total)}</strong>
              </div>
            ))}
          </div>

          <p className={styles.chartFootnote}>
            Counts represent payment records, not individual checkout attempts.
          </p>
        </>
      )}
    </article>
  );
}

function ItemPerformance({
  data,
  isWorkshop,
}: {
  data: AdminAnalytics["itemBreakdown"];
  isWorkshop: boolean;
}) {
  return (
    <article className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3>{isWorkshop ? "Workshop performance" : "Event performance"}</h3>
          <p>Registration and revenue comparison by item</p>
        </div>
        <span className={styles.panelIcon}>
          <Trophy size={18} />
        </span>
      </div>

      {data.length === 0 ? (
        <div className={styles.chartEmpty}>
          No {isWorkshop ? "workshops" : "events"} found.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.performanceTable}>
            <thead>
              <tr>
                <th>Name</th>
                {!isWorkshop && <th>Type</th>}
                <th>Registrations</th>
                <th>Confirmed</th>
                {!isWorkshop && <th>Teams</th>}
                <th>Participants</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td className={styles.itemName}>{item.name}</td>
                  {!isWorkshop && (
                    <td>
                      <span className={styles.typeTag}>{item.category}</span>
                    </td>
                  )}
                  <td>{formatNumber(item.registrations)}</td>
                  <td>{formatNumber(item.confirmed)}</td>
                  {!isWorkshop && <td>{formatNumber(item.teams)}</td>}
                  <td>{formatNumber(item.participants)}</td>
                  <td className={styles.revenueCell}>
                    {formatCurrency(item.revenuePaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
function RegistrationParticipantChart({
  data,
  isWorkshop,
}: {
  data: AdminAnalytics["itemBreakdown"];
  isWorkshop: boolean;
}) {
  const maxValue = Math.max(
    ...data.map((item) =>
      Math.max(item.registrations, item.participants),
    ),
    1,
  );

  return (
    <article className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3>
            {isWorkshop
              ? "Workshop registrations vs participants"
              : "Event registrations vs participants"}
          </h3>
          <p>
            Compare registrations and actual participant counts
            for each {isWorkshop ? "workshop" : "event"}
          </p>
        </div>
        <span className={styles.panelIcon}>
          <Users size={18} />
        </span>
      </div>

      {data.length === 0 ? (
        <div className={styles.chartEmpty}>
          No comparison data available.
        </div>
      ) : (
        <>
          <div className={styles.comparisonLegend}>
            <span><i className={styles.registrationLegend} /> Registrations</span>
            <span><i className={styles.participantLegend} /> Participants</span>
          </div>

          <div className={styles.comparisonChart}>
            {data.map((item) => (
              <div className={styles.comparisonRow} key={item.id}>
                <div className={styles.comparisonName}>
                  {item.name}
                </div>

                <div className={styles.comparisonBars}>
                  <div className={styles.comparisonBarLine}>
                    <div
                      className={styles.registrationBar}
                      style={{
                        width: `${(item.registrations / maxValue) * 100}%`,
                      }}
                    />
                    <strong>{formatNumber(item.registrations)}</strong>
                  </div>

                  <div className={styles.comparisonBarLine}>
                    <div
                      className={styles.participantBar}
                      style={{
                        width: `${(item.participants / maxValue) * 100}%`,
                      }}
                    />
                    <strong>{formatNumber(item.participants)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
function AnalyticsSection({
  title,
  subtitle,
  icon: Icon,
  state,
  isWorkshop = false,
}: {
  title: string;
  subtitle: string;
  icon: typeof Activity;
  state: SectionState;
  isWorkshop?: boolean;
}) {
  if (state.loading && !state.data) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionIcon}>
            <Icon size={21} />
          </span>
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className={styles.loadingPanel}>
          <span className={styles.spinner} />
          Loading {title.toLowerCase()}...
        </div>
      </section>
    );
  }

  if (state.error && !state.data) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionIcon}>
            <Icon size={21} />
          </span>
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className={styles.errorPanel}>
          <AlertCircle size={20} />
          <span>{state.error}</span>
        </div>
      </section>
    );
  }

  const data = state.data;

  if (!data) return null;

  const overview = data.overview;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <span className={styles.sectionIcon}>
          <Icon size={21} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {state.loading && (
          <span className={styles.updating}>Updating...</span>
        )}
      </div>

      {state.error && (
        <div className={styles.inlineError}>
          <AlertCircle size={15} />
          {state.error}
        </div>
      )}

      <div className={styles.statsGrid}>
        <StatCard
          label="Total registrations"
          value={formatNumber(overview.registrations)}
          detail={`${formatNumber(
            overview.confirmedRegistrations,
          )} confirmed`}
          icon={CalendarDays}
        />
        <StatCard
          label="Participants"
          value={formatNumber(overview.participants)}
          detail={
            isWorkshop
              ? "Active workshop participants"
              : `${formatNumber(overview.teams)} team registrations`
          }
          icon={Users}
        />
        <StatCard
          label="Captured revenue"
          value={formatCurrency(overview.capturedRevenuePaise)}
          detail={`${formatNumber(
            overview.capturedPaymentRecords,
          )} captured payment records`}
          icon={Wallet}
          accent={styles.goldAccent}
        />
        <StatCard
          label="Requires review"
          value={formatCurrency(overview.requiresReviewRevenuePaise)}
          detail={`${formatNumber(
            overview.requiresReviewRecords,
          )} captured records`}
          icon={Clock3}
          accent={styles.warningAccent}
        />
      </div>

      <div className={styles.chartsGrid}>
        <TrendChart
          title="Registration trend"
          description="Registrations created per day"
          data={data.registrationTrend}
          valueKey="registrations"
        />
        <TrendChart
          title="Revenue trend"
          description="Captured revenue per day"
          data={data.revenueTrend}
          valueKey="revenuePaise"
          currency
        />
      </div>
      <RegistrationParticipantChart
  data={data.itemBreakdown}
  isWorkshop={isWorkshop}
/>

      <div className={styles.bottomGrid}>
        <PaymentBreakdown data={data.paymentRecordsByStatus} />
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>Registration status</h3>
              <p>Current status of registrations created in this period</p>
            </div>
            <span className={styles.panelIcon}>
              <CheckCircle2 size={18} />
            </span>
          </div>

          <div className={styles.statusList}>
            {[
              {
                label: "Confirmed",
                value: overview.confirmedRegistrations,
                className: styles.statusConfirmed,
              },
              {
                label: "Pending payment",
                value: overview.pendingRegistrations,
                className: styles.statusPending,
              },
              {
                label: "Cancelled",
                value: overview.cancelledRegistrations,
                className: styles.statusCancelled,
              },
              {
                label: "Expired",
                value: overview.expiredRegistrations,
                className: styles.statusExpired,
              },
            ].map((item) => (
              <div className={styles.statusRow} key={item.label}>
                <span className={styles.statusName}>
                  <span className={item.className} />
                  {item.label}
                </span>
                <strong>{formatNumber(item.value)}</strong>
              </div>
            ))}
          </div>

          <div className={styles.confirmedRevenue}>
            <span>Revenue from confirmed registrations</span>
            <strong>
              {formatCurrency(overview.confirmedRevenuePaise)}
            </strong>
          </div>
        </article>
      </div>

      <ItemPerformance data={data.itemBreakdown} isWorkshop={isWorkshop} />
    </section>
  );
}

export default function AnalyticsPage() {
  const [fromDate, setFromDate] = useState(getMonthStart);
  const [toDate, setToDate] = useState(getToday);

  const [events, setEvents] = useState<SectionState>({
    data: null,
    loading: true,
    error: null,
  });

  const [workshops, setWorkshops] = useState<SectionState>({
    data: null,
    loading: true,
    error: null,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const loadAnalytics = useCallback(async () => {
    if (!fromDate || !toDate || fromDate > toDate) {
      setEvents((previous) => ({
        ...previous,
        loading: false,
        error: "Select a valid date range.",
      }));
      setWorkshops((previous) => ({
        ...previous,
        loading: false,
        error: "Select a valid date range.",
      }));
      return;
    }

    const range: AnalyticsDateRange = { fromDate, toDate };

    setEvents((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }));

    setWorkshops((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }));

    const [eventResult, workshopResult] = await Promise.allSettled([
      getEventsAnalytics(range),
      getWorkshopsAnalytics(range),
    ]);

    if (eventResult.status === "fulfilled") {
      setEvents({
        data: eventResult.value,
        loading: false,
        error: null,
      });
    } else {
      setEvents((previous) => ({
        ...previous,
        loading: false,
        error:
          eventResult.reason instanceof Error
            ? eventResult.reason.message
            : "Unable to load events analytics.",
      }));
    }

    if (workshopResult.status === "fulfilled") {
      setWorkshops({
        data: workshopResult.value,
        loading: false,
        error: null,
      });
    } else {
      setWorkshops((previous) => ({
        ...previous,
        loading: false,
        error:
          workshopResult.reason instanceof Error
            ? workshopResult.reason.message
            : "Unable to load workshops analytics.",
      }));
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, refreshKey]);

  const invalidRange = !fromDate || !toDate || fromDate > toDate;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>
            <Activity size={14} />
            PERFORMANCE INTELLIGENCE
          </div>
          <h1>Analytics</h1>
          <p>
            Monitor registrations, participation, revenue and payment
            performance.
          </p>
        </div>

        <button
          className={styles.refreshButton}
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={events.loading || workshops.loading || invalidRange}
        >
          <RefreshCw
            size={16}
            className={
              events.loading || workshops.loading ? styles.spinning : ""
            }
          />
          Refresh data
        </button>
      </div>

      <div className={styles.filterPanel}>
        <div className={styles.filterIntro}>
          <CalendarDays size={19} />
          <div>
            <strong>Reporting period</strong>
            <span>Apply the same date range to both sections</span>
          </div>
        </div>

        <div className={styles.dateFilters}>
          <label>
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || getToday()}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <span className={styles.dateSeparator}>to</span>

          <label>
            <span>To</span>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={getToday()}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>
        </div>
      </div>

      {invalidRange && (
        <div className={styles.inlineError}>
          <AlertCircle size={15} />
          Please select a valid reporting period.
        </div>
      )}

      <AnalyticsSection
        title="Events Analytics"
        subtitle="Performance across all Technex events"
        icon={CalendarDays}
        state={events}
      />

      <div className={styles.sectionDivider}>
        <span />
        WORKSHOP PERFORMANCE
        <span />
      </div>

      <AnalyticsSection
        title="Workshops Analytics"
        subtitle="Independent performance across all workshops"
        icon={Presentation}
        state={workshops}
        isWorkshop
      />

      <div className={styles.footerNote}>
        <Activity size={14} />
        Revenue is based on captured payments. Captured payments linked to
        unconfirmed registrations are shown separately for administrative
        review.
      </div>
    </div>
  );
}