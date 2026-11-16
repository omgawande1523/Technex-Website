"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * QR entry pass for a registration code. Dark modules on bone paper (not gold
 * on black) so ordinary phone scanners read it reliably.
 */
export default function QrPass({ code, label }: { code: string; label: string }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toString(code, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0b0906", light: "#f4ead6" },
    })
      .then((s) => active && setSvg(s))
      .catch(() => active && setSvg(null));
    return () => {
      active = false;
    };
  }, [code]);

  return (
    <figure style={{ margin: 0, display: "grid", gap: 8, justifyItems: "center" }}>
      <div
        role="img"
        aria-label={`Entry pass QR code for ${label}, registration ${code}`}
        style={{ width: 168, height: 168, background: "#f4ead6", padding: 6, borderRadius: 6 }}
        // The SVG is generated locally by the qrcode library from the registration code.
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      <figcaption style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(244,234,214,0.7)" }}>{code}</figcaption>
    </figure>
  );
}
