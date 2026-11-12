
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PaymentManagement from "./payment-management";

export const dynamic = "force-dynamic";

type AdminRole = "superadmin" | "coordinator";

type Payment = {
  id: string;
  registrationId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  status: "created" | "pending" | "authorized" | "captured" | "failed" | "cancelled";
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

export default async function AdminPaymentsPage() {
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const headers = {
    Authorization: `Bearer ${session.access_token}`,
  };

  const meResponse = await fetch(`${apiUrl}/api/admin/me`, {
    headers,
    cache: "no-store",
  });

  if (!meResponse.ok) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  const meData = await meResponse.json();
  const role = (meData.admin?.role ?? meData.data?.role) as
    | AdminRole
    | "event_head"
    | undefined;

  if (role !== "superadmin" && role !== "coordinator") {
    redirect("/admin?error=unauthorized");
  }

  const response = await fetch(
    `${apiUrl}/api/admin/payments?page=1&limit=20&sort=newest`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load payments.");
  }

  const result = await response.json();

  const payments: Payment[] = result.data ?? [];

  const pagination: Pagination = result.pagination ?? {
    page: 1,
    limit: 20,
    total: payments.length,
    totalPages: 1,
  };

  return (
    <main>
      <PaymentManagement
        accessToken={session.access_token}
        role={role}
        initialPayments={payments}
        initialPagination={pagination}
      />
    </main>
  );
}
