
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ParticipantManagement from "./participant-management";

export const dynamic = "force-dynamic";

type AdminRole = "superadmin" | "coordinator" | "event_head";

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

export default async function AdminParticipantsPage() {
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const meResponse = await fetch(`${apiUrl}/api/admin/me`, {
    headers,
    cache: "no-store",
  });

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

  const participantsResponse = await fetch(
    `${apiUrl}/api/admin/participants?page=1&limit=20&sort=newest`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!participantsResponse.ok) {
    throw new Error("Failed to load participants.");
  }

  const result = await participantsResponse.json();

  const participants: Participant[] = result.data ?? [];

  const pagination: Pagination = result.pagination ?? {
    page: 1,
    limit: 20,
    total: participants.length,
    totalPages: 1,
  };

  return (
    <main>
      <ParticipantManagement
        accessToken={session.access_token}
        role={adminRole}
        initialParticipants={participants}
        initialPagination={pagination}
      />
    </main>
  );
}
