import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AuditLogManagement from "./audit-log-management";

export const dynamic = "force-dynamic";

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

export default async function AdminAuditLogsPage() {
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

  if (!session?.access_token) {
    redirect("/admin/login");
  }

  const headers = {
    Authorization: `Bearer ${session.access_token}`,
  };

  const meResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/me`,
    { headers, cache: "no-store" },
  );

  if (!meResponse.ok) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  const meData = await meResponse.json();
  const role = meData.admin?.role ?? meData.data?.role;

  if (role !== "superadmin") {
    redirect("/admin/dashboard");
  }

  const logsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/audit-logs?page=1&limit=20`,
    { headers, cache: "no-store" },
  );

  if (!logsResponse.ok) {
    throw new Error("Failed to load audit logs.");
  }

  const result = await logsResponse.json();

  const logs: AuditLog[] = result.data ?? [];

  const pagination: Pagination = result.pagination ?? {
    page: 1,
    limit: 20,
    total: logs.length,
    totalPages: 1,
  };

  return (
    <main>
      <AuditLogManagement
        accessToken={session.access_token}
        initialLogs={logs}
        initialPagination={pagination}
      />
    </main>
  );
}