
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import RegistrationManagement from "./registration-management";

export const dynamic = "force-dynamic";

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

type AdminRole = "superadmin" | "coordinator" | "event_head";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default async function AdminRegistrationsPage() {
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
    {
      headers,
      cache: "no-store",
    },
  );

  if (!meResponse.ok) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  const meData = await meResponse.json();
  const adminRole = (meData.admin?.role ?? meData.data?.role) as
    | AdminRole
    | undefined;

  if (
    !adminRole ||
    !["superadmin", "coordinator", "event_head"].includes(adminRole)
  ) {
    redirect("/admin/login?error=unauthorized");
  }

  const registrationsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/registrations`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!registrationsResponse.ok) {
    throw new Error("Failed to load registrations");
  }

  const result = await registrationsResponse.json();

  const registrations: Registration[] = result.data ?? [];

  const pagination: Pagination = result.pagination ?? {
    page: 1,
    limit: 20,
    total: registrations.length,
    totalPages: 1,
  };

  return (
    <main>
      <RegistrationManagement
        accessToken={session.access_token}
        role={adminRole}
        initialRegistrations={registrations}
        initialPagination={pagination}
      />
    </main>
  );
}
