import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import WorkshopManagement, {
  type AdminRole,
  type WorkshopItem,
} from "./workshop-management";
import CreateWorkshopForm from "./create-workshop-form";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export default async function WorkshopsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user || !session?.access_token) {
    redirect("/admin/login");
  }

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const headers = {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };

  const adminResponse = await fetch(`${API_URL}/api/admin/me`, {
    headers,
    cache: "no-store",
  });

  if (!adminResponse.ok) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const adminResult = await adminResponse.json();

const adminRole = (
  adminResult?.admin?.role ?? adminResult?.data?.role
) as AdminRole | undefined;

  if (
    !adminRole ||
    !["superadmin", "coordinator", "event_head"].includes(adminRole)
  ) {
    redirect("/admin");
  }

  const workshopsResponse = await fetch(`${API_URL}/api/admin/workshops`, {
    headers,
    cache: "no-store",
  });

  if (!workshopsResponse.ok) {
    throw new Error("Unable to load workshops.");
  }

  const workshopsResult =
    (await workshopsResponse.json()) as ApiResponse<WorkshopItem[]>;

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100%",
        padding: "0 30px 40px",
        color: "#f3f5f8",
      }}
    >
      {adminRole === "superadmin" && <CreateWorkshopForm />}
<WorkshopManagement
  workshops={workshopsResult.data ?? []}
  role={adminRole}
/>
    </main>
  );
}