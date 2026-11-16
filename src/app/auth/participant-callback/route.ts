import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Only same-site relative paths are allowed as the post-login destination. */
function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/profile";
  if (value.startsWith("/admin") || value.startsWith("/auth")) return "/profile";
  return value;
}

/**
 * OAuth callback for participants (Google via Supabase). Exchanges the code
 * for a session cookie and returns to `next`. Unlike /auth/callback it does
 * not register the user as an admin on the backend.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/profile?error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/profile?error=oauth_callback_failed`);
    }
  } catch {
    return NextResponse.redirect(`${origin}/profile?error=auth_not_configured`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
