
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CreateEventForm from "./create-event-form";
import EventManagement from "./event-management";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
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

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/me`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  const meData = await response.json();
  const adminRole = meData.admin?.role;

  if (
    !["superadmin", "coordinator", "event_head"].includes(adminRole)
  ) {
    redirect("/admin/login?error=unauthorized");
  }

  const eventsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/events`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    },
  );

  if (!eventsResponse.ok) {
    throw new Error("Failed to load events");
  }

  const { data: events } = await eventsResponse.json();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#f5f5f5",
        padding: "30px",
      }}
    >
 

      <h1
        style={{
          marginTop: "10px",
          fontSize: "30px",
          fontWeight: 700,
          color: "#ffffff",
        }}
      >
        Events Management
      </h1>

      <p style={{ color: "#a2a2a2", marginTop: "8px" }}>
        View and manage all TECHNEX events.
      </p>

      {adminRole === "superadmin" && (
        <div style={{ marginTop: "30px" }}>
          <CreateEventForm />
        </div>
      )}

      <EventManagement events={events} role={adminRole} />
    </main>
  );
}
