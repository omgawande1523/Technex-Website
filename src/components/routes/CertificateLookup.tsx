"use client";

import { useState, type FormEvent } from "react";
import type { CertificateRecord } from "@/app/api/certificates/route";
import styles from "./routes.module.css";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "results"; items: CertificateRecord[] }
  | { kind: "unavailable" }
  | { kind: "error"; message: string };

export default function CertificateLookup({ contactEmail }: { contactEmail: string }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/certificates?q=${encodeURIComponent(q.trim())}`, { cache: "no-store" });
      const body = (await res.json()) as { success: boolean; data?: CertificateRecord[]; message?: string };
      if (res.status === 501) return setState({ kind: "unavailable" });
      if (!res.ok || !body.success) return setState({ kind: "error", message: body.message ?? "Lookup failed." });
      setState({ kind: "results", items: body.data ?? [] });
    } catch {
      setState({ kind: "error", message: "Could not reach the server. Check your connection and try again." });
    }
  };

  return (
    <>
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.label}>
          Registered email or registration ID
          <input
            className={styles.input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            required
            autoComplete="email"
            spellCheck={false}
          />
        </label>
        <div>
          <button type="submit" className={styles.button} disabled={state.kind === "loading" || !q.trim()}>
            {state.kind === "loading" ? "Searching…" : "Find certificates"}
          </button>
        </div>
      </form>

      <div aria-live="polite" style={{ marginTop: 24 }}>
        {state.kind === "unavailable" && (
          <p className={styles.notice}>
            Online certificates are not available yet. They will appear here once the certificate service is connected.
            For anything urgent, write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
        )}
        {state.kind === "error" && <p className={`${styles.notice} ${styles.error}`}>{state.message}</p>}
        {state.kind === "results" &&
          (state.items.length === 0 ? (
            <p className={styles.notice}>No certificates found for that email or ID.</p>
          ) : (
            <div className={styles.grid}>
              {state.items.map((c) => (
                <article key={c.id} className={styles.card}>
                  <span className={styles.tag}>{c.kind}</span>
                  <h3 className={styles.cardTitle}>{c.itemName}</h3>
                  <p className={styles.meta}>{c.participantName}</p>
                  <div className={styles.cardActions}>
                    <a href={c.downloadUrl} className={styles.button} download data-no-ink>
                      Download
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ))}
      </div>
    </>
  );
}
