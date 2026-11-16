import { NextResponse, type NextRequest } from "next/server";

export type CertificateRecord = {
  id: string;
  participantName: string;
  itemName: string;
  kind: "participation" | "winner" | "workshop" | string;
  downloadUrl: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RE = /^[A-Za-z0-9_-]{4,64}$/;

/**
 * Certificate lookup by registered email or registration ID.
 *
 * TODO: connect certificate backend. No certificate service exists in the repo
 * or the public API yet. Set CERTIFICATES_API_URL to a service that answers
 * GET <url>?q=<email-or-id> with { success, data: CertificateRecord[] } and
 * this handler proxies to it; until then it answers 501 so the UI can say so.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!EMAIL_RE.test(q) && !CODE_RE.test(q)) {
    return NextResponse.json(
      { success: false, code: "invalid_query", message: "Enter the email you registered with or your registration ID." },
      { status: 400 },
    );
  }

  const backend = process.env.CERTIFICATES_API_URL;
  if (!backend) {
    return NextResponse.json(
      {
        success: false,
        code: "not_implemented",
        message: "Certificates are not available online yet.",
        todo: "TODO: connect certificate backend (set CERTIFICATES_API_URL)",
      },
      { status: 501 },
    );
  }

  try {
    const res = await fetch(`${backend}?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    const body = (await res.json()) as { success?: boolean; data?: CertificateRecord[]; message?: string };
    if (!res.ok || body.success === false) {
      return NextResponse.json(
        { success: false, code: "lookup_failed", message: body.message ?? "Lookup failed." },
        { status: res.status === 404 ? 404 : 502 },
      );
    }
    return NextResponse.json({ success: true, data: body.data ?? [] });
  } catch {
    return NextResponse.json({ success: false, code: "unreachable", message: "Certificate service unreachable." }, { status: 502 });
  }
}
