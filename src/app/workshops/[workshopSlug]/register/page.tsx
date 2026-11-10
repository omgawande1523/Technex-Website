
"use client";

import {
  use,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import {
  getWorkshopRegistrationForm,
  getWorkshopFeeQuote,
  submitWorkshopRegistration,
  verifyPayment,
  type ParticipantInput,
  type RegistrationAnswerInput,
  type RegistrationResult,
  type PublicWorkshopForm,
  type WorkshopFeeQuote,
  type RazorpayPaymentResponse,
} from "@/lib/api";

import ParticipantFields from "@/components/registration/ParticipantFields";
import CustomFields from "@/components/registration/CustomFields";
import PaymentCheckout from "@/components/registration/PaymentCheckout";

type Props = {
  params: Promise<{
    workshopSlug: string;
  }>;
};

const emptyParticipant = (): ParticipantInput => ({
  fullName: "",
  email: "",
  mobileNumber: "",
  gender: "",
  state: "",
  city: "",
  collegeName: "",
  department: "",
  degree: "",
});

const formatPrice = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);

export default function WorkshopRegistrationPage({
  params,
}: Props) {
  const { workshopSlug } = use(params);
  const router = useRouter();

  const errorRef = useRef<HTMLDivElement>(null);

  const [form, setForm] =
    useState<PublicWorkshopForm | null>(null);

  const [quote, setQuote] =
    useState<WorkshopFeeQuote | null>(null);

  const [participant, setParticipant] =
    useState<ParticipantInput>(emptyParticipant());

  const [answers, setAnswers] =
    useState<RegistrationAnswerInput[]>([]);

  const [registration, setRegistration] =
    useState<RegistrationResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");

  const idempotencyAttempt = useRef<{
    payload: string;
    key: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWorkshop() {
      try {
        setLoading(true);
        setError("");

        const result =
          await getWorkshopRegistrationForm(workshopSlug);

        if (!active) return;

        setForm(result);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load workshop.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadWorkshop();

    return () => {
      active = false;
    };
  }, [workshopSlug]);

  useEffect(() => {
    if (!form) return;

    let active = true;

    async function loadQuote() {
      try {
        setQuoteLoading(true);

        const result =
          await getWorkshopFeeQuote(workshopSlug);

        if (active) setQuote(result);
      } catch (err) {
        if (active) {
          setQuote(null);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to calculate workshop fee.",
          );
        }
      } finally {
        if (active) setQuoteLoading(false);
      }
    }

    loadQuote();

    return () => {
      active = false;
    };
  }, [form, workshopSlug]);

  useEffect(() => {
    if (!error) return;

    errorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [error]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form || !quote || submitting || registration) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSubmitAttempted(true);

      const requiredMultiSelectFields =
        form.formFields.filter(
          (field) =>
            field.isRequired &&
            field.fieldType === "multi_select",
        );

      const hasMissingRequiredMultiSelect =
        requiredMultiSelectFields.some((field) => {
          const answer = answers.find(
            (item) =>
              item.fieldId === field.id &&
              item.participantIndex === 0,
          )?.answer;

          if (field.scope === "registration") {
            const registrationAnswer = answers.find(
              (item) =>
                item.fieldId === field.id &&
                item.participantIndex === undefined,
            )?.answer;

            return (
              !Array.isArray(registrationAnswer) ||
              registrationAnswer.length === 0
            );
          }

          return (
            !Array.isArray(answer) || answer.length === 0
          );
        });

      if (hasMissingRequiredMultiSelect) {
        setError("Please complete all required fields.");
        return;
      }

      const payload = {
        participant,
        answers,
      };

      const payloadFingerprint = JSON.stringify(payload);
      const currentAttempt = idempotencyAttempt.current;

      const idempotencyKey =
        currentAttempt?.payload === payloadFingerprint
          ? currentAttempt.key
          : window.crypto.randomUUID();

      if (currentAttempt?.payload !== payloadFingerprint) {
        idempotencyAttempt.current = {
          payload: payloadFingerprint,
          key: idempotencyKey,
        };
      }

      const result = await submitWorkshopRegistration(
        workshopSlug,
        payload,
        idempotencyKey,
      );

      setRegistration(result);

      if (result.status === "confirmed") {
        router.push(
          `/registration/${encodeURIComponent(
            result.registrationCode,
          )}`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit workshop registration.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentResponse = async (
    response: RazorpayPaymentResponse,
  ) => {
    if (!registration) return;

    try {
      setVerifying(true);
      setError("");

      await verifyPayment(
        registration.registrationCode,
        response,
      );

      router.push(
        `/registration/${encodeURIComponent(
          registration.registrationCode,
        )}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment verification failed. If money was deducted, contact the organisers.",
      );
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading workshop registration...</p>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold">
            Unable to load workshop
          </h1>
          <p className="mt-3 text-sm text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  const workshop = form.workshop;

  if (!workshop.registrationOpen || !workshop.canRegister) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Registrations unavailable
          </h1>
          <p className="mt-3">
            Registration for {workshop.name} is currently closed.
          </p>
        </div>
      </main>
    );
  }

  const themeStyle = {
    "--workshop-accent": "#D4AF37",
  } as CSSProperties;

  return (
    <main
      className="min-h-screen bg-[#f5f3ed] px-4 py-12 sm:px-8"
      style={themeStyle}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px]">

        {/* Registration form */}
        <form
          id="workshop-registration-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {error && (
            <div
              ref={errorRef}
              className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <section className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
            <span className="text-xs font-bold tracking-[0.2em] text-[#9b7923]">
              TECHNEX 2026 / WORKSHOP REGISTRATION
            </span>

            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              {workshop.name}
            </h1>

            {workshop.description && (
              <p className="mt-3 text-sm leading-7 text-gray-600">
                {workshop.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider">
              <span className="rounded-full bg-gray-100 px-4 py-2">
                Individual Registration
              </span>
              <span className="rounded-full bg-gray-100 px-4 py-2">
                One Participant
              </span>
            </div>
          </section>

          <section className="space-y-8 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#9b7923]">
                01 / PARTICIPANT
              </span>

              <h2 className="mt-2 text-2xl font-semibold">
                Participant Details
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter your personal and academic information.
              </p>
            </div>

            <ParticipantFields
              participant={participant}
              onChange={setParticipant}
              title="Personal Information"
              idPrefix="workshop-participant"
            />

            <div className="border-t border-black/10 pt-7">
              <CustomFields
                fields={form.formFields}
                answers={answers}
                onChange={setAnswers}
                scope="participant"
                participantIndex={0}
                title="Additional Participant Details"
                showValidationErrors={submitAttempted}
              />
            </div>

            <div className="border-t border-black/10 pt-7">
              <CustomFields
                fields={form.formFields}
                answers={answers}
                onChange={setAnswers}
                scope="registration"
                title="Additional Registration Details"
                showValidationErrors={submitAttempted}
              />
            </div>
          </section>
        </form>

        {/* Registration summary */}
        <aside className="lg:sticky lg:top-8">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <div className="bg-[#171717] p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-[0.2em] text-white/60">
                  YOUR REGISTRATION
                </span>

                <Activity size={17} className="text-[#D4AF37]" />
              </div>

              <h2 className="mt-4 text-2xl font-semibold">
                Summary
              </h2>

              <p className="mt-2 text-sm text-white/60">
                {workshop.name}
              </p>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-gray-400">
                  PARTICIPANT
                </span>

                <p className="mt-2 font-semibold">
                  {participant.fullName.trim() || "Name pending"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Individual registration
                </p>
              </div>

              <div className="border-t border-black/10 pt-5">
                <span className="text-xs font-bold tracking-widest text-gray-400">
                  FEE BREAKDOWN
                </span>

                {quoteLoading ? (
                  <p className="mt-3 text-sm text-gray-500">
                    Calculating fee...
                  </p>
                ) : quote ? (
                  <>
                    <div className="mt-4 flex justify-between gap-4 text-sm">
                      <span className="text-gray-500">
                        Workshop fee × 1
                      </span>
                      <strong>
                        {formatPrice(quote.feeAmountPaise)}
                      </strong>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-5">
                      <span className="text-sm font-bold">
                        TOTAL TO PAY
                      </span>
                      <strong className="text-2xl">
                        {formatPrice(quote.totalAmountPaise)}
                      </strong>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-red-600">
                    Fee quote unavailable.
                  </p>
                )}
              </div>

              <div className="border-t border-black/10 pt-5">
                {registration ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-gray-400">
                        REGISTRATION CODE
                      </span>
                      <p className="mt-2 break-all font-bold">
                        {registration.registrationCode}
                      </p>
                    </div>

                    {registration.status === "pending_payment" && (
                      verifying ? (
                        <p className="text-center text-sm text-gray-500">
                          Verifying payment...
                        </p>
                      ) : (
                        <PaymentCheckout
                          registrationCode={registration.registrationCode}
                          description={`Workshop: ${workshop.name}`}
                          onPaymentResponse={handlePaymentResponse}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <button
                    type="submit"
                    form="workshop-registration-form"
                    disabled={
                      submitting ||
                      quoteLoading ||
                      !quote
                    }
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-6 py-4 text-sm font-bold tracking-wider text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "SUBMITTING..."
                      : quote?.totalAmountPaise === 0
                        ? "COMPLETE REGISTRATION"
                        : "CONTINUE TO PAYMENT"}

                    <ArrowRight size={18} />
                  </button>
                )}
              </div>

              <p className="text-center text-xs leading-5 text-gray-400">
                Your registration details are securely processed.
                Payments are handled through Razorpay.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
