
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const WORKSHOP_ID = "df2ff051-047c-461f-9782-f24423030664";
type Admin = {
  id: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminApiTestPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"coordinator" | "event_head">("coordinator");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [workshopResult, setWorkshopResult] = useState("");
  const [workshopLoading, setWorkshopLoading] = useState(false);

  async function apiRequest(path: string, method = "GET", body?: object) {
    if (!API_URL) throw new Error("API URL is not configured.");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) throw new Error("Please log in first.");

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || JSON.stringify(result) || "Request failed."
      );
    }

    return result;
  }

  async function loadAdmins() {
    const result = await apiRequest("/api/admin/users");
    setAdmins(result.data);
  }

  useEffect(() => {
    loadAdmins().catch((error) => setMessage(error.message));
  }, []);

  async function inviteAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await apiRequest(
        "/api/admin/users/invite",
        "POST",
        { email, displayName, role }
      );

      setMessage(result.message || "Invitation request successful.");
      setEmail("");
      setDisplayName("");
      await loadAdmins();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invitation failed.");
    } finally {
      setLoading(false);
    }
  }


async function runWorkshopTest(
  path: string,
  method = "GET",
  body?: object
) {
  setWorkshopLoading(true);
  setWorkshopResult("");

  try {
    const result = await apiRequest(path, method, body);
    setWorkshopResult(JSON.stringify(result, null, 2));
  } catch (error) {
    setWorkshopResult(
      error instanceof Error ? error.message : "Request failed."
    );
  } finally {
    setWorkshopLoading(false);
  }
}

async function testWorkshops() {
  await runWorkshopTest("/api/admin/workshops");
}

async function createTestWorkshop() {
  await runWorkshopTest("/api/admin/workshops", "POST", {
    name: "Web Development Workshop",
    slug: "web-development-workshop",
    description: "Test workshop for TNX 2026.",
    feeAmountPaise: 100000,
    isPublished: false,
    registrationOpen: false,
    registrationOpensAt: null,
    registrationClosesAt: null,
  });
}

async function testUpdateWorkshop() {
  await runWorkshopTest(
    `/api/admin/workshops/${WORKSHOP_ID}`,
    "PUT",
    {
      name: "Advanced Web Development",
      slug: "advanced-web-development",
      description: "Updated workshop description.",
      feeAmountPaise: 150000,
    }
  );
}

async function testPublishWorkshop() {
  await runWorkshopTest(
    `/api/admin/workshops/${WORKSHOP_ID}/controls`,
    "PATCH",
    { isPublished: true }
  );
}

async function testOpenRegistration() {
  await runWorkshopTest(
    `/api/admin/workshops/${WORKSHOP_ID}/controls`,
    "PATCH",
    { registrationOpen: true }
  );
}
async function testAssignAdmin(adminId: string) {
  await runWorkshopTest(
    `/api/admin/workshops/${WORKSHOP_ID}/assignments`,
    "POST",
    { adminId }
  );
}

async function testGetAssignments() {
  await runWorkshopTest(
    `/api/admin/workshops/${WORKSHOP_ID}/assignments`
  );
}

async function testRemoveAssignment(adminId: string) {
  await runWorkshopTest(
    `/api/admin/workshops/${WORKSHOP_ID}/assignments/${adminId}`,
    "DELETE"
  );
}


  return (
    <main className="min-h-screen space-y-10 bg-black p-8 text-white">
      <h1 className="text-2xl font-bold">Admin API Test</h1>

      <form
        onSubmit={inviteAdmin}
        className="max-w-lg space-y-4 rounded-xl border border-neutral-800 p-6"
      >
        <h2 className="text-lg font-semibold">Invite Admin</h2>

        <input
          required
          type="text"
          placeholder="Full name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3"
        />

        <input
          required
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3"
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "coordinator" | "event_head")
          }
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3"
        >
          <option value="coordinator">Coordinator</option>
          <option value="event_head">Event Head</option>
        </select>

        <button
          disabled={loading}
          className="rounded-lg bg-white px-5 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>

        {message && <p className="text-sm text-neutral-300">{message}</p>}
      </form>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Registered Admins</h2>

        <div className="space-y-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="rounded-lg border border-neutral-800 p-4"
            >
              <p className="font-medium">{admin.displayName}</p>
              <p className="text-sm text-neutral-400">
                {admin.role} · {admin.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl space-y-4 rounded-xl border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold">Workshop API Test</h2>

        <p className="text-sm text-neutral-400">
          Tests GET /api/admin/workshops using your current Supabase session.
        </p>

       <div className="flex flex-wrap gap-3">
  <button
    type="button"
    onClick={testWorkshops}
    disabled={workshopLoading}
    className="rounded-lg bg-amber-400 px-5 py-3 font-semibold text-black disabled:opacity-50"
  >
    GET Workshops
  </button>

  <button
    type="button"
    onClick={createTestWorkshop}
    disabled={workshopLoading}
    className="rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-black disabled:opacity-50"
  >
    Create Workshop
  </button>

  <button
    type="button"
    onClick={testUpdateWorkshop}
    disabled={workshopLoading}
    className="rounded-lg bg-blue-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
  >
    Update Workshop
  </button>

  <button
    type="button"
    onClick={testPublishWorkshop}
    disabled={workshopLoading}
    className="rounded-lg bg-purple-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
  >
    Publish Workshop
  </button>

  <button
    type="button"
    onClick={testOpenRegistration}
    disabled={workshopLoading}
    className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
  >
    Open Registration
  </button>
  <button
  type="button"
  onClick={() => {
    const adminId = prompt("Enter Coordinator/Event Head UUID");
    if (adminId) testAssignAdmin(adminId);
  }}
  disabled={workshopLoading}
>
  Assign Admin
</button>

<button
  type="button"
  onClick={testGetAssignments}
  disabled={workshopLoading}
>
  Get Assignments
</button>

<button
  type="button"
  onClick={() => {
    const adminId = prompt("Enter Admin UUID to remove");
    if (adminId) testRemoveAssignment(adminId);
  }}
  disabled={workshopLoading}
>
  Remove Assignment
</button>
</div>

        {workshopResult && (
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-900 p-4 text-sm">
            {workshopResult}
          </pre>
        )}
      </section>
    </main>
  );
}

