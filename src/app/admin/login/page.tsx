"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/lib/supabase/auth";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.cardAccent} aria-hidden="true" />
        <header className={styles.header}>
          <div className={styles.brandMark} aria-hidden="true">
            TNX
          </div>
          <p className={styles.brand}>TECHNEX 2026</p>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>
            Secure access for authorized administrators
          </p>
        </header>

        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg
            className={styles.googleIcon}
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
            />
            <path
              fill="#34A853"
              d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
            />
            <path
              fill="#FBBC05"
              d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
            />
            <path
              fill="#EA4335"
              d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
            />
          </svg>
          {loading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.accessNote}>
          <span className={styles.accessIcon} aria-hidden="true">
            ✓
          </span>
          <span>Use the Google account authorized for your admin role.</span>
        </div>

        <footer className={styles.footer}>
          <span className={styles.footerDot} aria-hidden="true" />
          Authorized personnel only
        </footer>
      </section>
    </main>
  );
}
