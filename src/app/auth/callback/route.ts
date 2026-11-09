import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=oauth_callback_failed`,
    );
  }

  const supabase = await createSupabaseServerClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=oauth_callback_failed`,
    );
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    await supabase.auth.signOut();

    return NextResponse.redirect(
      `${origin}/admin/login?error=oauth_callback_failed`,
    );
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("Backend API URL is not configured.");
    }

    const response = await fetch(`${apiUrl}/api/admin/auth/google`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      await supabase.auth.signOut();

      return NextResponse.redirect(
        `${origin}/admin/login?error=unauthorized`,
      );
    }

    return NextResponse.redirect(`${origin}/admin/dashboard`);
  } catch {
    await supabase.auth.signOut();

    return NextResponse.redirect(
      `${origin}/admin/login?error=authentication_failed`,
    );
  }
}