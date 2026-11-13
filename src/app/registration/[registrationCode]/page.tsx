
"use client";

import { use, useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
} from "lucide-react";

import styles from "./confirmation.module.css";
import { getEventTheme } from "@/lib/event-themes";

interface Participant {
  name: string;
  role: string;
}

interface Payment {
  amountPaise: number;
  currency: string;
  status: string;
  method?: string | null;
}

interface EventDetails {
  name?: string;
  slug?: string;
  eventType?: string;
  event_type?: string;
}

interface WorkshopDetails {
  name?: string;
  slug?: string;
}

interface Registration {
  registrationCode: string;
item?: {
    id?: string;
    name?: string;
    slug?: string;
    itemType?: "event" | "workshop";
    feeType?: string;
    feeAmountPaise?: number;
  } | null;

  event?: EventDetails | null;
  eventName?: string;
  event_name?: string;
  eventType?: string;
  event_type?: string;

  workshop?: WorkshopDetails | null;
  workshopName?: string;
  workshop_name?: string;

  registrationType?: string;
  registration_type?: string;

  status: string;
  totalAmountPaise: number;

  participants?: Participant[];
  payments?: Payment[];
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function RegistrationConfirmation({
  params,
}: {
  params: Promise<{ registrationCode: string }>;
}) {
  const { registrationCode } = use(params);

  const [registration, setRegistration] =
    useState<Registration | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // FETCH REGISTRATION DETAILS
  useEffect(() => {
    let active = true;

    async function fetchRegistration() {
      try {
        const response = await fetch(
          `${API_URL}/api/public/registrations/${encodeURIComponent(
            registrationCode
          )}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to retrieve registration details."
          );
        }

        const result = await response.json();

        if (result.success === false) {
          throw new Error(
            result.message || "Unable to retrieve registration details."
          );
        }

        const payload = result.data ?? result;
        const registrationData =
          payload.registration ?? payload;

        if (active) {
          setRegistration(registrationData);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchRegistration();

    return () => {
      active = false;
    };
  }, [registrationCode]);

  // COPY REGISTRATION CODE
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(registrationCode);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  // DOWNLOAD / SAVE RECEIPT AS PDF
  function downloadReceipt() {
    window.print();
  }

  // LOADING STATE
  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          Loading confirmation...
        </div>
      </main>
    );
  }

  // ERROR STATE
  if (error || !registration) {
    return (
      <main className={styles.page}>
        <div className={styles.error}>
          {error || "Registration not found."}
        </div>
      </main>
    );
  }

  // PAYMENT DETAILS
  const payment = registration.payments?.[0];

  const isPaymentSuccessful =
    payment?.status?.toLowerCase() === "captured" ||
    registration.status?.toLowerCase() === "confirmed";

  const paymentStatus = isPaymentSuccessful
    ? "Successful"
    : "Pending";

  // Use captured payment amount only after successful payment.
  const amount =
    (isPaymentSuccessful && payment?.amountPaise != null
      ? payment.amountPaise
      : registration.totalAmountPaise ?? 0) / 100;

  // DETECT REGISTRATION TYPE
  const isWorkshop =
    registration.item?.itemType === "workshop";

  const registeredItemName =
    registration.item?.name ?? "Registered Item";

  const theme = getEventTheme(
    registration.item?.slug ??
      registration.event?.slug ??
      registration.workshop?.slug ??
      "",
  );
  const themeStyle = {
    "--event-accent": theme.accent,
    "--event-accent-secondary": theme.accentSecondary,
    "--event-accent-tertiary": theme.accentTertiary,
    "--event-accent-soft": theme.accentSoft,
    "--event-accent-border": theme.accentBorder,
    "--event-accent-text": theme.accentText,
  } as CSSProperties;

  // EVENT TYPE
  const eventType = (
    registration.event?.eventType ??
    registration.event?.event_type ??
    registration.eventType ??
    registration.event_type ??
    "individual"
  ).toLowerCase();

  // PAYMENT METHOD
  const paymentMethod = payment?.method
    ? payment.method.charAt(0).toUpperCase() +
      payment.method.slice(1)
    : "—";

  return (
    <main className={styles.page} style={themeStyle}>
      <div className={styles.overlay} />

      <div className={styles.container}>
        {/* TECHNEX LOGO */}
        <header className={styles.header}>
          <Image
            src="/assets/technex-logo.png"
            alt="TECHNEX 2026"
            width={190}
            height={65}
            priority
            className={styles.logo}
          />

          <span className={styles.tagline}>
            INNOVATION · TECHNOLOGY · CREATIVITY
          </span>
        </header>

        {/* THANK YOU SECTION */}
        <section className={styles.hero}>
          <div className={styles.successIcon}>
            <CheckCircle2
              size={29}
              strokeWidth={1.8}
            />
          </div>

          <span className={styles.eyebrow}>
            REGISTRATION CONFIRMED
          </span>

          <h1>
            THANK YOU FOR
            <br />
            REGISTERING AT
            <br />
            <span>TECHNEX 2026</span>
          </h1>

          <p>
            Your journey into innovation starts here.
            We look forward to welcoming you to TECHNEX 2026.
          </p>
        </section>

        <div className={styles.receiptCanvas}>
          <Image
            src="/assets/bg/receipt-background.png"
            alt=""
            fill
            priority
            sizes="(max-width: 650px) 100vw, 790px"
            className={styles.receiptBackground}
          />

          <h2 className={styles.receiptPrintHeading}>
            TECHNEX 2026 <span>REGISTRATION RECEIPT</span>
          </h2>

          {/* REGISTRATION CODE */}
          <section className={styles.codeCard}>
            <div>
              <span className={styles.cardLabel}>
                YOUR REGISTRATION CODE
              </span>

              <h2>{registration.registrationCode}</h2>

              <p>Keep this code for future reference.</p>
            </div>

            <button
              className={styles.copyButton}
              onClick={copyCode}
              type="button"
            >
              {copied ? (
                <Check size={17} />
              ) : (
                <Copy size={17} />
              )}

              {copied ? "Copied" : "Copy"}
            </button>
          </section>

          {/* EVENT / WORKSHOP + PAYMENT DETAILS */}
          <section className={styles.detailsCard}>
            <div className={styles.eventSection}>
              <span className={styles.cardLabel}>
                {isWorkshop
                  ? "YOUR REGISTERED WORKSHOP"
                  : "YOUR REGISTERED EVENT"}
              </span>

              <h2>{registeredItemName}</h2>

              <span className={styles.eventType}>
                {isWorkshop
                  ? "INDIVIDUAL WORKSHOP"
                  : eventType === "team"
                    ? "TEAM EVENT"
                    : "INDIVIDUAL EVENT"}
              </span>
            </div>

            <div className={styles.divider} />

            <div className={styles.paymentSection}>
              <div className={styles.paymentHeading}>
                <span className={styles.cardLabel}>
                  PAYMENT DETAILS
                </span>

                <span
                  className={
                    paymentStatus === "Successful"
                      ? styles.successStatus
                      : styles.pendingStatus
                  }
                >
                  {paymentStatus}
                </span>
              </div>

              <div className={styles.paymentAmount}>
                <span>
                  {paymentStatus === "Successful"
                    ? "TOTAL AMOUNT PAID"
                    : "TOTAL REGISTRATION AMOUNT"}
                </span>

                <strong>
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: payment?.currency || "INR",
                    minimumFractionDigits: 2,
                  }).format(amount)}
                </strong>
              </div>

              <div className={styles.paymentRow}>
                <span>Payment Method</span>

                <strong>{paymentMethod}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* DOWNLOAD RECEIPT */}
        <button
          type="button"
          onClick={downloadReceipt}
          className={styles.receiptButton}
          disabled={paymentStatus !== "Successful"}
        >
          <Download size={17} />
          DOWNLOAD RECEIPT
        </button>

        {/* FOOTER */}
        <footer className={styles.footer}>
          THANK YOU FOR BEING A PART OF TECHNEX 2026
        </footer>
      </div>
    </main>
  );
}
