
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";

type AdminRole = "superadmin" | "coordinator" | "event_head";

type DashboardEvent = {
  eventId: string;
  eventName: string;
  eventType: string;
  totalRegistrations: number;
  confirmedRegistrations: number;
};

type DashboardWorkshop = {
  workshopId: string;
  workshopName: string;
  totalRegistrations: number;
  confirmedRegistrations: number;
};

type RecentRegistration = {
  id: string;
  registrationCode: string;
  itemName: string;
  teamName: string | null;
  participantCount: number;
  totalAmountPaise: number;
  currency: string;
  status: string;
  createdAt: string;
};

type DashboardStats = {
  registrations: {
    total: number;
    confirmed: number;
    pending: number;
  };
  teams: number;
  participants: number;
  revenue: {
    totalRupees: number;
  } | null;
  events: DashboardEvent[];
  workshops: DashboardWorkshop[];
  recentRegistrations: RecentRegistration[];
};

type DistributionItem = {
  category: string;
  total: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token || !API_URL) {
    redirect("/admin/login");
  }

  const headers = {
    Authorization: `Bearer ${session.access_token}`,
  };

  const [adminResponse, statsResponse] = await Promise.all([
    fetch(`${API_URL}/api/admin/me`, {
      headers,
      cache: "no-store",
    }),
    fetch(`${API_URL}/api/admin/dashboard/stats`, {
      headers,
      cache: "no-store",
    }),
  ]);

  if (!adminResponse.ok || !statsResponse.ok) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  const adminResult = await adminResponse.json();
  const statsResult = await statsResponse.json();

  const admin = adminResult.admin as {
    role: AdminRole;
  };

  const stats = statsResult.data as DashboardStats;

  const statistics = [
    {
      label: "Total Registrations",
      value: stats.registrations.total,
      description:
        admin.role === "superadmin"
          ? `${stats.registrations.confirmed} confirmed · ${stats.registrations.pending} pending`
          : "Confirmed registrations",
    },
    {
      label: "Total Teams",
      value: stats.teams,
      description: "Registrations for team events",
    },
    {
      label: "Total Participants",
      value: stats.participants,
      description: "Active participants in confirmed registrations",
    },
    ...(stats.revenue
      ? [
          {
            label: "Total Revenue",
            value: new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(stats.revenue.totalRupees),
            description: "Successfully captured payments",
          },
        ]
      : []),
  ];

  const eventGroups: Record<string, DistributionItem> = {};

  for (const event of stats.events) {
    const category = event.eventType;

    if (!eventGroups[category]) {
      eventGroups[category] = {
        category,
        total: 0,
      };
    }

    eventGroups[category].total += event.totalRegistrations;
  }

  const eventDistribution = Object.values(eventGroups);

  const totalCategoryRegistrations = eventDistribution.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const formatCurrency = (amountPaise: number, currency: string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(amountPaise / 100);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div>
      <section>
        <div className={styles.dashboardHeading}>
          <div>
            <h1 className={styles.pageTitle}>Overview</h1>
            <p className={styles.pageSubtitle}>
              Welcome to the TECHNEX 2026 administration dashboard.
            </p>
          </div>
        </div>

        <h2 className={styles.sectionHeading}>Event Overview</h2>

        <div className={styles.statsGrid}>
          {statistics.map((stat) => (
            <article key={stat.label} className={styles.statCard}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString("en-IN")
                  : stat.value}
              </div>
              <div className={styles.statDescription}>
                {stat.description}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel} style={{ marginTop: 22 }}>
        <h2 className={styles.panelTitle}>Recent Registrations</h2>
        <p className={styles.panelDescription}>
          Latest registrations across your accessible events and workshops.
        </p>

        <div className={styles.eventList}>
          {!stats.recentRegistrations ||
          stats.recentRegistrations.length === 0 ? (
            <div className={styles.emptyState}>
              No registrations available yet.
            </div>
          ) : (
            stats.recentRegistrations.map((registration) => (
              <div key={registration.id} className={styles.eventRow}>
                <div style={{ minWidth: 0 }}>
                  <div className={styles.eventName}>
                    {registration.registrationCode}
                  </div>
                  <div className={styles.eventType}>
                    {registration.itemName}
                  </div>
                  <div className={styles.eventType}>
                    {registration.teamName || "Individual registration"}
                    {" · "}
                    {registration.participantCount} participants
                  </div>
                </div>

                <div className={styles.eventCount}>
                  <strong>
                    {formatCurrency(
                      registration.totalAmountPaise,
                      registration.currency,
                    )}
                  </strong>
                  <div className={styles.registrationStatus}>
                    {registration.status.replaceAll("_", " ")}
                  </div>
                  <div className={styles.eventType}>
                    {formatDate(registration.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          <Link
            href="/admin/registrations"
            className={styles.quickLink}
          >
            View All Registrations →
          </Link>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Registration Analytics</h2>
          <p className={styles.panelDescription}>
            Registration statistics across TECHNEX events.
          </p>

          <div className={styles.eventList}>
            {stats.events.length === 0 ? (
              <div className={styles.emptyState}>
                No events have been added yet.
              </div>
            ) : (
              stats.events.map((event) => (
                <div key={event.eventId} className={styles.eventRow}>
                  <div>
                    <div className={styles.eventName}>
                      {event.eventName}
                    </div>
                    <div className={styles.eventType}>
                      {event.eventType.replaceAll("_", " ")}
                    </div>
                  </div>

                  <div className={styles.eventCount}>
                    <strong>{event.totalRegistrations}</strong>{" "}
                    registrations
                    {admin.role === "superadmin" && (
                      <>
                        <br />
                        {event.confirmedRegistrations} confirmed
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Workshop Analytics</h2>
          <p className={styles.panelDescription}>
            Registration statistics across TECHNEX workshops.
          </p>

          <div className={styles.eventList}>
            {!stats.workshops || stats.workshops.length === 0 ? (
              <div className={styles.emptyState}>
                No workshops have been added yet.
              </div>
            ) : (
              stats.workshops.map((workshop) => (
                <div
                  key={workshop.workshopId}
                  className={styles.eventRow}
                >
                  <div>
                    <div className={styles.eventName}>
                      {workshop.workshopName}
                    </div>
                    <div className={styles.eventType}>Workshop</div>
                  </div>

                  <div className={styles.eventCount}>
                    <strong>{workshop.totalRegistrations}</strong>{" "}
                    registrations
                    {admin.role === "superadmin" && (
                      <>
                        <br />
                        {workshop.confirmedRegistrations} confirmed
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Event Distribution</h2>
          <p className={styles.panelDescription}>
            Registrations by event format.
          </p>

          {eventDistribution.length === 0 ||
          totalCategoryRegistrations === 0 ? (
            <div className={styles.distributionEmpty}>
              No registration data available yet.
            </div>
          ) : (
            <div className={styles.distributionList}>
              {eventDistribution.map((item) => {
                const percentage =
                  (item.total / totalCategoryRegistrations) * 100;

                return (
                  <div
                    key={item.category}
                    className={styles.distributionItem}
                  >
                    <div className={styles.distributionHeader}>
                      <span className={styles.distributionName}>
                        {item.category.replaceAll("_", " ")}
                      </span>
                      <span className={styles.distributionCount}>
                        {item.total.toLocaleString("en-IN")} registrations
                        {" · "}
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className={styles.distributionTrack}>
                      <div
                        className={styles.distributionBar}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>

      <section className={styles.panel} style={{ marginTop: 22 }}>
        <h2 className={styles.panelTitle}>Quick Access</h2>
        <p className={styles.panelDescription}>
          Manage the TECHNEX administration workspace.
        </p>

        <div className={styles.quickLinks}>
          <Link href="/admin/events" className={styles.quickLink}>
            <span>◇</span>
            <div>
              <strong>Manage Events</strong>
              <small>View and manage accessible events</small>
            </div>
            <span className={styles.quickArrow}>→</span>
          </Link>

          {admin.role === "superadmin" && (
            <Link href="/admin/team" className={styles.quickLink}>
              <span>♧</span>
              <div>
                <strong>Team Management</strong>
                <small>Manage administrators and access</small>
              </div>
              <span className={styles.quickArrow}>→</span>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
