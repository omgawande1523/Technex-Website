"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/supabase/auth";
import { supabase } from "@/lib/supabase/client";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyAdminAccess = async (accessToken: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "You are not authorized to access the admin panel.",
      );
    }

    return result.admin;
  };

  const handleEmailLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await signInWithEmail(email, password);

      if (error) throw error;
      if (!data.session) throw new Error("Unable to create a login session.");

      await verifyAdminAccess(data.session.access_token);

      router.replace("/admin/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed.";

      setError(message);
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

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
        <header className={styles.header}>
          <p className={styles.brand}>TECHNEX 2026</p>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>
            Sign in to access the administration panel
          </p>
        </header>

        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Continue with Google
        </button>

        <div className={styles.divider}>OR CONTINUE WITH EMAIL</div>

        <form className={styles.form} onSubmit={handleEmailLogin}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email address
            </label>

            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>

            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />

              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <footer className={styles.footer}>
          Authorized personnel only
        </footer>
      </section>
    </main>
  );
}