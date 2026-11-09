
"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import styles from "./admin-shell.module.css";

type AdminRole = "superadmin" | "coordinator" | "event_head";

type Admin = {
  id: string;
  displayName: string;
  role: AdminRole;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const navigation = [
  { label: "Overview", href: "/admin/dashboard", icon: "◫" },
  { label: "Registrations", href: "/admin/registrations", icon: "▤" },
  { label: "Events", href: "/admin/events", icon: "◇" },
  { label: "Workshops", href: "/admin/workshops", icon: "▦" },
  { label: "Participants", href: "/admin/participants", icon: "♙" },
  { label: "Payments", href: "/admin/payments", icon: "₹" },
];

function getRoleLabel(role: AdminRole) {
  if (role === "superadmin") return "Super Administrator";
  if (role === "coordinator") return "Coordinator";
  return "Event Head";
}

export default function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadAdmin() {
      try {
        if (!API_URL) {
          throw new Error("API URL is not configured.");
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          router.replace("/admin/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/admin/me`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          await supabase.auth.signOut();
          router.replace("/admin/login?error=unauthorized");
          return;
        }

        const result = await response.json();

        if (!active) return;

        setAdmin(result.admin);
      } catch {
        router.replace("/admin/login?error=unauthorized");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAdmin();

    return () => {
      active = false;
    };
  }, [isLoginPage, pathname, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !admin) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loader} />
        <p>Loading administration portal...</p>
      </div>
    );
  }

  const initials = admin.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const visibleNavigation = navigation.filter((item) => {
    if (admin.role === "event_head") {
      return !["/admin/payments"].includes(item.href);
    }

    return true;
  });

  return (
    <div className={styles.shell}>
      {menuOpen && (
        <button
          className={styles.mobileOverlay}
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          menuOpen ? styles.sidebarOpen : ""
        }`}
      >
        <Link
          href="/admin/dashboard"
          className={styles.brand}
          onClick={() => setMenuOpen(false)}
        >
          <span className={styles.brandName}>TECHNEX</span>
          <span className={styles.brandSubtitle}>
            2026 · ADMIN PORTAL
          </span>
        </Link>

        <div className={styles.navLabel}>MAIN MENU</div>

        <nav className={styles.nav}>
          {visibleNavigation.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`${styles.navItem} ${
                  active ? styles.navActive : ""
                }`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
                {active && <span className={styles.activeIndicator} />}
              </Link>
            );
          })}
        </nav>

        <div className={styles.navLabel}>ADMINISTRATION</div>

        <nav className={styles.nav}>
          {admin.role === "superadmin" && (
            <Link
              href="/admin/team"
              className={`${styles.navItem} ${
                pathname.startsWith("/admin/team")
                  ? styles.navActive
                  : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles.navIcon}>♧</span>
              Team Management
            </Link>
          )}

          <Link
            href="/admin/settings"
            className={`${styles.navItem} ${
              pathname.startsWith("/admin/settings")
                ? styles.navActive
                : ""
            }`}
            onClick={() => setMenuOpen(false)}
          >
            <span className={styles.navIcon}>⚙</span>
            Settings
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <span>TNX-26 Administration</span>
          <span>Authorized access only</span>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuButton}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? "✕" : "☰"}
            </button>

            <div className={styles.breadcrumb}>
              <span>TECHNEX</span>
              <span className={styles.breadcrumbDivider}>/</span>
              <strong>
                {navigation.find((item) =>
                  pathname.startsWith(item.href)
                )?.label || "Administration"}
              </strong>
            </div>
          </div>

          <div className={styles.profile}>
            <div className={styles.avatar}>{initials}</div>

            <div className={styles.profileInfo}>
              <div className={styles.profileName}>
                {admin.displayName}
              </div>
              <div className={styles.profileRole}>
                {getRoleLabel(admin.role)}
              </div>
            </div>

            <button
              className={styles.logoutButton}
              onClick={handleLogout}
              title="Sign out"
            >
              ↗
            </button>
          </div>
        </header>

        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
}
