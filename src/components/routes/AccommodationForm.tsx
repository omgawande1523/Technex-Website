"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "./routes.module.css";

/*
 * Inserts into the Supabase table `accommodation_requests`. Expected schema:
 *
 *   create table public.accommodation_requests (
 *     id            uuid primary key default gen_random_uuid(),
 *     created_at    timestamptz not null default now(),
 *     full_name     text not null,
 *     email         text not null,
 *     phone         text not null,
 *     college       text not null,
 *     check_in      date not null,
 *     check_out     date not null,
 *     guests        smallint not null check (guests between 1 and 10),
 *     notes         text,
 *     status        text not null default 'pending'
 *   );
 *   alter table public.accommodation_requests enable row level security;
 *   create policy "anyone can request" on public.accommodation_requests
 *     for insert to anon, authenticated with check (status = 'pending');
 *   -- no select/update/delete policies: only the service role / admins read it.
 */
const TABLE = "accommodation_requests";
const AUTH_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

export default function AccommodationForm({ checkIn, checkOut }: { checkIn: string; checkOut: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const row = {
      full_name: get("full_name"),
      email: get("email"),
      phone: get("phone"),
      college: get("college"),
      check_in: get("check_in"),
      check_out: get("check_out"),
      guests: Number(get("guests") || 1),
      notes: get("notes") || null,
    };
    if (row.check_out < row.check_in) {
      setStatus({ kind: "error", message: "Check-out must be on or after check-in." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const { error } = await supabase.from(TABLE).insert(row);
      if (error) throw error;
      setStatus({ kind: "sent" });
      form.reset();
    } catch {
      setStatus({ kind: "error", message: "Your request could not be sent. Please try again in a moment." });
    }
  };

  if (!AUTH_CONFIGURED) {
    return <p className={styles.notice}>Requests are not being accepted online on this deployment yet.</p>;
  }
  if (status.kind === "sent") {
    return (
      <p className={styles.notice} role="status">
        Request received. The team will contact you by email.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formRow}>
        <label className={styles.label}>
          Full name
          <input className={styles.input} name="full_name" required autoComplete="name" />
        </label>
        <label className={styles.label}>
          College
          <input className={styles.input} name="college" required autoComplete="organization" />
        </label>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>
          Email
          <input className={styles.input} name="email" type="email" required autoComplete="email" />
        </label>
        <label className={styles.label}>
          Phone
          <input className={styles.input} name="phone" type="tel" required autoComplete="tel" pattern="[0-9+\- ]{8,16}" />
        </label>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>
          Check-in
          <input className={styles.input} name="check_in" type="date" required defaultValue={checkIn} />
        </label>
        <label className={styles.label}>
          Check-out
          <input className={styles.input} name="check_out" type="date" required defaultValue={checkOut} />
        </label>
        <label className={styles.label}>
          People
          <input className={styles.input} name="guests" type="number" min={1} max={10} defaultValue={1} required />
        </label>
      </div>
      <label className={styles.label}>
        Notes (optional)
        <textarea className={styles.input} name="notes" rows={3} maxLength={500} />
      </label>
      {status.kind === "error" && (
        <p className={`${styles.notice} ${styles.error}`} role="alert">
          {status.message}
        </p>
      )}
      <div>
        <button type="submit" className={styles.button} disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending…" : "Request accommodation"}
        </button>
      </div>
    </form>
  );
}
