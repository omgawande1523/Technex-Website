"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
} from "lucide-react";
import {
  getWorkshopRegistrationForm,
  getWorkshopFeeQuote,
  submitWorkshopRegistration,
  verifyPayment,
  type PublicWorkshopForm,
  type WorkshopFeeQuote,
  type ParticipantInput,
  type RegistrationAnswerInput,
  type RegistrationResult,
  type RazorpayPaymentResponse,
} from "@/lib/api";

import ParticipantFields from "@/components/registration/ParticipantFields";
import CustomFields from "@/components/registration/CustomFields";
import PaymentCheckout from "@/components/registration/PaymentCheckout";

type Props = {
  workshopSlug: string;
};

const emptyParticipant: ParticipantInput = {
  fullName: "",
  email: "",
  mobileNumber: "",
  gender: "other",
  state: "",
  city: "",
  collegeName: "",
  department: "",
  degree: "",
};

export default function WorkshopRegistrationForm({
  workshopSlug,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState<PublicWorkshopForm | null>(null);
  const [quote, setQuote] = useState<WorkshopFeeQuote | null>(null);

  const [participant, setParticipant] =
    useState<ParticipantInput>(emptyParticipant);

  const [answers, setAnswers] = useState<RegistrationAnswerInput[]>([]);

  const [registration, setRegistration] =
    useState<RegistrationResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [idempotency, setIdempotency] = useState<{
    fingerprint: string;
    key: string;
  } | null>(null);

  const participantCount = 1;

  const fingerprint = useMemo(
    () => JSON.stringify({ participant, answers }),
    [participant, answers]
  );

  useEffect(() => {
    let active = true;

    async function loadRegistrationData() {
      try {
        setLoading(true);
        setError("");

        const [formResult, quoteResult] = await Promise.all([
          getWorkshopRegistrationForm(workshopSlug),
          getWorkshopFeeQuote(workshopSlug),
        ]);

        if (!active) return;

        setForm(formResult);
        setQuote(quoteResult);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load workshop registration."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRegistrationData();

    return () => {
      active = false;
    };
  }, [workshopSlug]);

  const requiredMultiSelectFields = useMemo(
    () =>
      (form?.formFields ?? []).filter(
       (field) => field.isRequired && field.fieldType === "multi_select"
      ),
    [form]
  );

  const hasMissingRequiredFields = requiredMultiSelectFields.some((field) => {
    const answer = answers.find(
      (item) =>
        item.fieldId === field.id &&
        (field.scope === "registration"
          ? item.participantIndex === undefined
          : item.participantIndex === 0)
    )?.answer;

    return !Array.isArray(answer) || answer.length === 0;
  });

  const updateAnswers = useCallback(
    (nextAnswers: RegistrationAnswerInput[]) => {
      setAnswers(nextAnswers);
    },
    []
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitAttempted(true);
    setError("");

    if (!form || !quote) return;

    if (!form.workshop.canRegister) {
      setError("Registration is currently unavailable for this workshop.");
      return;
    }

    if (hasMissingRequiredFields) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      let key = idempotency?.key;

      if (!idempotency || idempotency.fingerprint !== fingerprint) {
        key = window.crypto.randomUUID();

        setIdempotency({
          fingerprint,
          key,
        });
      }

      const result = await submitWorkshopRegistration(
        workshopSlug,
        {
          participant,
          answers,
        },
        key!
      );

      setRegistration(result);

      if (result.status === "confirmed") {
        router.push(
          `/registration/${encodeURIComponent(result.registrationCode)}`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your registration."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePaymentResponse(
    response: RazorpayPaymentResponse
  ) {
    if (!registration) return;

    try {
      setVerifying(true);
      setError("");

      await verifyPayment(registration.registrationCode, response);

      router.push(
        `/registration/${encodeURIComponent(registration.registrationCode)}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment verification failed. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="registration-panel p-10 text-center">
        <p>Preparing your registration form...</p>
      </div>
    );
  }

  if (!form || !quote) {
    return (
      <div className="registration-error-message">
        {error || "Workshop registration could not be loaded."}
      </div>
    );
  }

  const workshop = form.workshop;
  const canRegister = workshop.canRegister && workshop.registrationOpen;

  return (
    <div className="registration-layout">
      {/* LEFT: REGISTRATION FIELDS */}
      <div className="registration-fields-column">
        <form
          id="workshop-registration-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <section className="registration-panel event-information-panel">
            <div className="event-information-top">
              <div>
                <div className="registration-kicker">
                  TECHNEX 2026 · WORKSHOPS
                </div>

                <h2 className="registration-event-name">
                  {workshop.name}
                </h2>
              </div>

              <span className="registration-event-badge">
                WORKSHOP
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed opacity-75">
              {workshop.description}
            </p>

            <div className="event-information-meta">
              <span>Individual Registration</span>
            
            </div>
          </section>

          <section className="registration-panel">
           

            <ParticipantFields
              participant={participant}
              onChange={setParticipant}
              title="Participant Details"
              idPrefix="workshop-participant"
            />

            {form.formFields.length > 0 && (
              <div className="mt-8">
                <CustomFields
                  fields={form.formFields}
                  answers={answers}
                  onChange={updateAnswers}
                  scope="participant"
                  participantIndex={0}
                  title="Additional Participant Information"
                  showValidationErrors={submitAttempted}
                />

                <CustomFields
                  fields={form.formFields}
                  answers={answers}
                  onChange={updateAnswers}
                  scope="registration"
                  title="Additional Registration Information"
                  showValidationErrors={submitAttempted}
                />
              </div>
            )}
          </section>

          {error && (
            <div className="registration-error-message">
              {error}
            </div>
          )}

          {!canRegister && (
            <div className="registration-error-message">
              Registration is currently closed for this workshop.
            </div>
          )}
        </form>
      </div>

      {/* RIGHT: REGISTRATION SUMMARY */}
      <aside className="registration-summary-column">
        <div className="registration-summary-panel">
      {/* Summary header */}
          <div className="summary-header">
            <div>
              <span className="registration-kicker">
                YOUR REGISTRATION
              </span>

              <h2>Summary</h2>
            </div>

            <span className="summary-live-indicator">
              <Activity
                className="live-activity-icon"
                size={15}
                aria-hidden="true"
              />
              LIVE
            </span>
          </div>


          <div className="summary-event-name">
            {workshop.name}
          </div>

          <div className="summary-participants">
            <div className="flex justify-between">
              <span>Participants</span>
              <span>1</span>
            </div>
          </div>

          <div className="summary-fees">
            <div className="flex justify-between">
              <span>Workshop Fee</span>
              <span>
                ₹{(quote.feeAmountPaise / 100).toLocaleString("en-IN")}
              </span>
            </div>

        
          </div>

          <div className="summary-total">
            <span>Total Amount</span>
            <strong>
              ₹{(quote.totalAmountPaise / 100).toLocaleString("en-IN")}
            </strong>
          </div>

          {!registration ? (
            <div className="summary-action">
              <button
                type="submit"
                form="workshop-registration-form"
                disabled={!canRegister || submitting}
                className="registration-submit-button"
              >
                {submitting ? "Submitting..." : "Continue to Payment"}
              </button>

              <p className="mt-3 text-center text-xs opacity-60">
                Review your details before continuing.
              </p>
            </div>
          ) : registration.status === "pending_payment" ? (
            <div className="summary-action">
              <div className="mb-4">
                <p className="text-xs opacity-60">
                  REGISTRATION CODE
                </p>
                <p className="font-semibold">
                  {registration.registrationCode}
                </p>
              </div>

              <PaymentCheckout
                registrationCode={registration.registrationCode}
                onPaymentResponse={handlePaymentResponse}
              />

              {verifying && (
                <p className="mt-3 text-center text-sm">
                  Verifying payment...
                </p>
              )}
            </div>
          ) : (
            <div className="summary-action">
              <p>Registration confirmed.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}