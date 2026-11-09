
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AcceptInvitePage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error(
          "Your invitation session is missing or expired. Please open the invitation email again.",
        );
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/me`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Your admin account could not be verified.",
        );
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete account setup.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-8">
        <p className="mb-3 text-sm font-semibold tracking-widest text-neutral-400">
          TECHNEX 2026
        </p>

        <h1 className="mb-2 text-2xl font-bold">
          Set Up Your Account
        </h1>

        <p className="mb-8 text-sm text-neutral-400">
          Create a password to complete your administrator account setup.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm">
              Create password
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3 outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Confirm password
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Re-enter your password"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3 outline-none focus:border-white"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white p-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Setting up account..." : "Complete Account Setup"}
          </button>
        </form>
      </section>
    </main>
  );
}
