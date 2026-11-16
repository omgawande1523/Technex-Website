"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { signInParticipantWithGoogle, signOut } from "@/lib/supabase/auth";
import { getRegistration, type PublicRegistration } from "@/lib/api";
import QrPass from "./QrPass";
import styles from "./routes.module.css";

const API_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_API_URL);
const AUTH_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const CODE_RE = /^[A-Za-z0-9_-]{4,64}$/;

const storageKey = (user: User | null) => `tnx-registrations:${user?.id ?? "guest"}`;

function readCodes(user: User | null): string[] {
  try {
    const raw = localStorage.getItem(storageKey(user));
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((c): c is string => typeof c === "string") : [];
  } catch {
    return [];
  }
}

function writeCodes(user: User | null, codes: string[]) {
  try {
    localStorage.setItem(storageKey(user), JSON.stringify(codes));
  } catch {
    /* storage blocked: list lives for this visit only */
  }
}

const AUTH_ERRORS: Record<string, string> = {
  missing_code: "Sign-in was cancelled.",
  oauth_callback_failed: "Google sign-in could not be completed. Please try again.",
  auth_not_configured: "Sign-in is not configured on this deployment yet.",
};

type Entry = { code: string; state: "loading" | "ok" | "error"; data?: PublicRegistration; message?: string };

export default function ProfileClient() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!AUTH_CONFIGURED);
  const [authError, setAuthError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Session + auth errors from the callback redirect.
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the callback query string
    if (err) setAuthError(AUTH_ERRORS[err] ?? "Sign-in failed.");
    if (!AUTH_CONFIGURED) return;
    let active = true;
    supabase.auth
      .getUser()
      .then(({ data }: { data: { user: User | null } }) => {
        if (!active) return;
        setUser(data.user ?? null);
        setAuthReady(true);
      })
      .catch(() => active && setAuthReady(true));
    const { data: sub } = supabase.auth.onAuthStateChange((_e: AuthChangeEvent, session: Session | null) => setUser(session?.user ?? null));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const load = useCallback((code: string) => {
    if (!API_CONFIGURED) {
      setEntries((list) =>
        list.map((e) => (e.code === code ? { ...e, state: "error", message: "Registration service is not configured on this deployment." } : e)),
      );
      return;
    }
    getRegistration(code)
      .then((data) => setEntries((list) => list.map((e) => (e.code === code ? { code, state: "ok", data } : e))))
      .catch((err: unknown) =>
        setEntries((list) =>
          list.map((e) =>
            e.code === code
              ? { code, state: "error", message: err instanceof Error ? err.message : "Could not load this registration." }
              : e,
          ),
        ),
      );
  }, []);

  // Saved codes for this user (or this browser when signed out).
  useEffect(() => {
    if (!authReady) return;
    const codes = readCodes(user);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate the list from localStorage once auth is known
    setEntries(codes.map((code) => ({ code, state: "loading" })));
    codes.forEach(load);
  }, [authReady, user, load]);

  const addCode = (e: FormEvent) => {
    e.preventDefault();
    const code = draft.trim();
    if (!CODE_RE.test(code)) {
      setFormError("Enter the registration code from your confirmation page or email.");
      return;
    }
    setFormError(null);
    setDraft("");
    if (entries.some((x) => x.code === code)) return;
    const codes = [code, ...entries.map((x) => x.code)];
    writeCodes(user, codes);
    setEntries((list) => [{ code, state: "loading" }, ...list]);
    load(code);
  };

  const remove = (code: string) => {
    const next = entries.filter((x) => x.code !== code);
    writeCodes(user, next.map((x) => x.code));
    setEntries(next);
  };

  return (
    <>
      <section className={styles.section} aria-labelledby="account">
        <h2 id="account" className={styles.sectionTitle}>
          Account
        </h2>
        {authError && <p className={`${styles.notice} ${styles.error}`}>{authError}</p>}
        {!AUTH_CONFIGURED ? (
          <p className={styles.notice}>
            Sign-in is not configured on this deployment (Supabase keys missing). You can still track registrations by
            code below; they are saved in this browser.
          </p>
        ) : !authReady ? (
          <p className={styles.meta}>Checking your session…</p>
        ) : user ? (
          <div className={styles.card} style={{ maxWidth: 560 }}>
            <p className={styles.cardTitle}>{user.user_metadata?.full_name ?? user.email}</p>
            <p className={styles.meta}>{user.email}</p>
            <div className={styles.cardActions}>
              <button type="button" className={styles.ghost} onClick={() => void signOut()}>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.card} style={{ maxWidth: 560 }}>
            <p className={styles.meta}>Sign in to keep your registrations and entry passes together on any device you sign in from.</p>
            <div className={styles.cardActions}>
              <button type="button" className={styles.button} onClick={() => void signInParticipantWithGoogle("/profile")}>
                Sign in with Google
              </button>
            </div>
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="regs">
        <h2 id="regs" className={styles.sectionTitle}>
          My registrations
        </h2>
        <p className={styles.notice}>
          Registrations are looked up by their code (shown on your confirmation page). Automatic listing by account needs
          a backend endpoint that does not exist yet.
          {/* TODO: backend /me registrations endpoint — then list registrations for the signed-in email automatically. */}
        </p>
        <form className={styles.form} onSubmit={addCode} style={{ marginTop: 18 }}>
          <label className={styles.label}>
            Registration code
            <input
              className={`${styles.input} ${styles.mono}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!formError}
              aria-describedby={formError ? "code-error" : undefined}
            />
          </label>
          {formError && (
            <p id="code-error" className={`${styles.notice} ${styles.error}`}>
              {formError}
            </p>
          )}
          <div>
            <button type="submit" className={styles.button}>
              Add registration
            </button>
          </div>
        </form>

        <div className={styles.grid} style={{ marginTop: 24 }}>
          {entries.map((entry) => (
            <RegistrationCard key={entry.code} entry={entry} onRemove={() => remove(entry.code)} />
          ))}
        </div>
        {entries.length === 0 && (
          <p className={styles.meta} style={{ marginTop: 16 }}>
            Nothing saved yet. <Link href="/passes">Find an event or workshop</Link> to register.
          </p>
        )}
      </section>
    </>
  );
}

function RegistrationCard({ entry, onRemove }: { entry: Entry; onRemove: () => void }) {
  const r = entry.data;
  const name =
    r?.item?.name ?? r?.event?.name ?? r?.eventName ?? r?.workshop?.name ?? r?.workshopName ?? "Registration";
  const payment = r?.payments?.[0];
  const confirmed = r?.status?.toLowerCase() === "confirmed" || payment?.status?.toLowerCase() === "captured";

  return (
    <article className={styles.card}>
      <span className={`${styles.tag} ${styles.mono}`}>{entry.code}</span>
      {entry.state === "loading" && <p className={styles.meta}>Loading…</p>}
      {entry.state === "error" && <p className={`${styles.notice} ${styles.error}`}>{entry.message}</p>}
      {r && (
        <>
          <h3 className={styles.cardTitle}>{name}</h3>
          <p className={styles.meta}>
            Status: <strong>{r.status.replace(/_/g, " ")}</strong>
            {payment ? ` · Payment: ${payment.status}` : r.totalAmountPaise === 0 ? " · Free" : " · Payment: not started"}
          </p>
          {r.participants && r.participants.length > 0 && (
            <div>
              <p className={styles.meta}>{r.teamName ? `Team ${r.teamName}` : "Participants"}</p>
              <ul className={styles.meta} style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {r.participants.map((p) => (
                  <li key={`${p.name}-${p.role}`}>
                    {p.name} <span style={{ opacity: 0.6 }}>· {p.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {confirmed ? (
            <QrPass code={entry.code} label={name} />
          ) : (
            <p className={styles.notice}>Your entry pass appears here once the registration is confirmed.</p>
          )}
        </>
      )}
      <div className={styles.cardActions}>
        <Link href={`/registration/${encodeURIComponent(entry.code)}`} className={styles.ghost}>
          {r && !confirmed ? "Complete payment" : "Open confirmation"}
        </Link>
        <button type="button" className={styles.ghost} onClick={onRemove}>
          Remove
        </button>
      </div>
    </article>
  );
}
