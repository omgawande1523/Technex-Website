import { supabase } from "./client";

export const signInWithGoogle = async () => {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

/**
 * Participant sign-in. Uses its own callback so participants never hit the
 * admin-only /auth/callback (which checks admin rights on the backend).
 */
export const signInParticipantWithGoogle = async (next = "/profile") => {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/participant-callback?next=${encodeURIComponent(next)}`,
    },
  });
};

export const signInWithEmail = async (
  email: string,
  password: string,
) => {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentSession = async () => {
  return supabase.auth.getSession();
};