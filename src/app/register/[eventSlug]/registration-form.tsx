
"use client";

import {
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
  getEventRegistrationForm,
  getFeeQuote,
  submitRegistration,
  verifyPayment,
  type PublicEventForm,
  type ParticipantInput,
  type RegistrationAnswerInput,
  type FeeQuote,
  type RegistrationResult,
  type RazorpayPaymentResponse,
} from "@/lib/api";

import { getEventTheme } from "@/lib/event-themes";

import ParticipantFields from "@/components/registration/ParticipantFields";
import CustomFields from "@/components/registration/CustomFields";
import TeamManager from "@/components/registration/TeamManager";
import PaymentCheckout from "@/components/registration/PaymentCheckout";

type Props = {
  eventSlug: string;
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

export default function RegistrationForm({ eventSlug }: Props) {
  const router = useRouter();
  const theme = getEventTheme(eventSlug);

  const errorRef = useRef<HTMLDivElement>(null);

  const themeStyle = {
    "--event-accent": theme.accent,
    "--event-accent-soft": theme.accentSoft,
    "--event-accent-border": theme.accentBorder,
  } as CSSProperties;

  const [form, setForm] = useState<PublicEventForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [participant, setParticipant] =
    useState<ParticipantInput>(emptyParticipant());

  const [teamName, setTeamName] = useState("");

  const [leader, setLeader] =
    useState<ParticipantInput>(emptyParticipant());

  const [members, setMembers] = useState<ParticipantInput[]>([]);
  const [answers, setAnswers] = useState<RegistrationAnswerInput[]>([]);

  const [quote, setQuote] = useState<FeeQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [registration, setRegistration] =
    useState<RegistrationResult | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const idempotencyAttempt = useRef<{
    payload: string;
    key: string;
  } | null>(null);

  const isTeam = form?.event.eventType === "team";

  const participantCount = isTeam ? members.length + 1 : 1;

  const participants = isTeam
    ? [
        {
          label: "Team Leader",
          name: leader.fullName,
        },
        ...members.map((member, index) => ({
          label: `Member ${String(index + 1).padStart(2, "0")}`,
          name: member.fullName,
        })),
      ]
    : [
        {
          label: "Participant",
          name: participant.fullName,
        },
      ];

  // Load event configuration.
  useEffect(() => {
    let active = true;
    setForm(null);
    setQuote(null);
    setRegistration(null);
    setParticipant(emptyParticipant());
    setTeamName("");
    setLeader(emptyParticipant());
    setMembers([]);
    setAnswers([]);
    setError("");
    idempotencyAttempt.current = null;
    async function loadForm() {
      try {
        setLoading(true);
        setError("");

        const result = await getEventRegistrationForm(eventSlug);

        if (!active) return;

        setSubmitAttempted(false);
        setForm(result);

        if (result.event.eventType === "team") {
          const initialMemberCount = Math.max(
            0,
            result.event.minParticipants - 1,
          );

          setMembers(
            Array.from(
              { length: initialMemberCount },
              () => emptyParticipant(),
            ),
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load registration form.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadForm();

    return () => {
      active = false;
    };
  }, [eventSlug]);

  // Fetch fee quote whenever participant count changes.
  useEffect(() => {
    if (!form) return;

    let active = true;

    async function loadQuote() {
      try {
        setQuoteLoading(true);
        setQuote(null);

        const result = await getFeeQuote(
          eventSlug,
          participantCount,
        );

        if (active) {
          setQuote(result);
          
        }
      } catch (err) {
        if (active) {
          setQuote(null);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to calculate registration fee.",
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
  }, [form, eventSlug, participantCount]);

  // Automatically bring validation errors into view.
  useEffect(() => {
    if (!error) return;

    errorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [error]);

  // Submit registration.
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form || submitting || registration) return;

    try {
      setSubmitting(true);
      setError("");
      setSubmitAttempted(true);

      const payload =
        form.event.eventType === "team"
          ? {
              teamName,
              leader,
              members,
              answers,
            }
          : {
              participant,
              answers,
            };

      const requiredMultiSelectFields = form.formFields.filter(
        (field) =>
          field.isRequired && field.fieldType === "multi_select",
      );
      const participantIndexes = Array.from(
        {
          length:
            form.event.eventType === "team"
              ? members.length + 1
              : 1,
        },
        (_, index) => index,
      );
      const hasMissingRequiredMultiSelect =
        requiredMultiSelectFields.some((field) => {
          if (field.scope === "registration") {
            const answer = answers.find(
              (item) =>
                item.fieldId === field.id &&
                item.participantIndex === undefined,
            )?.answer;
            return !Array.isArray(answer) || answer.length === 0;
          }

          return participantIndexes.some((participantIndex) => {
            const answer = answers.find(
              (item) =>
                item.fieldId === field.id &&
                item.participantIndex === participantIndex,
            )?.answer;
            return !Array.isArray(answer) || answer.length === 0;
          });
        });

      if (hasMissingRequiredMultiSelect) return;

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

      const result = await submitRegistration(
        eventSlug,
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
          : "Unable to submit registration.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Verify Razorpay payment on the backend.
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

  // Loading state.
  if (loading) {
    return (
      <div className="registration-loading">
        <div className="registration-spinner" />
        <p>Loading event registration...</p>
      </div>
    );
  }

  // Event loading failure.
  if (!form) {
    return (
      <div className="registration-error">
        <h2>Unable to load event</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Registration unavailable.
  if (
    !form.event.registrationOpen ||
    !form.event.canRegister
  ) {
    return (
      <div className="registration-error">
        <h2>Registrations unavailable</h2>
        <p>
          Registration for {form.event.name} is currently closed.
        </p>
      </div>
    );
  }

  return (
    <div
      className="registration-layout"
      style={themeStyle}
    >
      {/* LEFT: Registration form */}
      <form
        id="event-registration-form"
        onSubmit={handleSubmit}
        className="registration-fields-column"
      >
        {/* Validation error notification */}
        {error && (
          <div
            ref={errorRef}
            className="registration-error-message"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle
              size={19}
              strokeWidth={2}
              aria-hidden="true"
            />

            <div className="registration-error-content">
              <strong>Registration validation failed</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Event information */}
        <section className="registration-panel event-information-panel">
          <div className="event-information-top">
            <span className="registration-kicker">
              EVENT REGISTRATION
            </span>

            <span className="registration-event-badge">
              {form.event.eventType === "team"
                ? "TEAM EVENT"
                : "INDIVIDUAL EVENT"}
            </span>
          </div>

          <h2>{form.event.name}</h2>

          {form.event.description && (
            <p>{form.event.description}</p>
          )}

          <div className="event-information-meta">
            <span>{form.event.eventType}</span>

            <span>
              {form.event.feeType.replaceAll("_", " ")}
            </span>
          </div>
        </section>

        {/* Participant details */}
        <section className="registration-panel">
          {isTeam ? (
            <TeamManager
              teamName={teamName}
              onTeamNameChange={setTeamName}
              leader={leader}
              onLeaderChange={setLeader}
              members={members}
              onMembersChange={setMembers}
              fields={form.formFields}
              answers={answers}
              onAnswersChange={setAnswers}
              minParticipants={form.event.minParticipants}
              maxParticipants={form.event.maxParticipants}
              showValidationErrors={submitAttempted}
            />
          ) : (
            <div className="space-y-8">
              <div className="registration-section-heading">
                <span className="registration-section-number">
                  01
                </span>

                <div>
                  <h2>Participant Details</h2>
                  <p>
                    Enter your personal and academic information.
                  </p>
                </div>
              </div>

              <ParticipantFields
                participant={participant}
                onChange={setParticipant}
                title="Personal Information"
                idPrefix="individual"
              />

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
          )}

          {/* Additional registration-level fields */}
          <div className="registration-custom-fields">
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

      {/* RIGHT: Registration summary */}
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

          {/* Event name */}
          <div className="summary-event-name">
            {form.event.name}
          </div>

          {/* Team information */}
          {isTeam && (
            <div className="summary-team-name">
              <span>TEAM NAME</span>

              <strong>
                {teamName.trim() || "Not entered yet"}
              </strong>
            </div>
          )}

          {/* Participant list */}
          <div className="summary-participants">
            <div className="summary-section-title">
              PARTICIPANTS
              <span>{participantCount}</span>
            </div>

            {participants.map((person, index) => (
              <div
                className="summary-person"
                key={index}
              >
                <span className="summary-person-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <strong>
                    {person.name.trim() || "Name pending"}
                  </strong>

                  <span>{person.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Fee breakdown */}
          <div className="summary-fees">
            <div className="summary-section-title">
              FEE BREAKDOWN
            </div>

            {quoteLoading ? (
              <p className="summary-calculating">
                Updating registration fee...
              </p>
            ) : quote ? (
              <>
                <div className="summary-fee-row">
                  <span>
                    {quote.feeType === "per_participant"
                      ? `Fee per participant × ${participantCount}`
                      : quote.feeType === "per_team"
                        ? "Team registration fee"
                        : "Registration fee"}
                  </span>

                  <strong>
                    {quote.feeType === "per_participant"
                      ? formatPrice(quote.feeAmountPaise)
                      : formatPrice(quote.totalAmountPaise)}
                  </strong>
                </div>

                {quote.feeType === "per_participant" && (
                  <div className="summary-fee-row">
                    <span>Participants</span>
                    <strong>{participantCount}</strong>
                  </div>
                )}

                <div className="summary-total">
                  <span>TOTAL TO PAY</span>

                  <strong>
                    {formatPrice(quote.totalAmountPaise)}
                  </strong>
                </div>
              </>
            ) : (
              <p className="summary-calculating">
                Fee quote unavailable.
              </p>
            )}
          </div>

          {/* Payment / registration action */}
          <div className="summary-action">
            {registration ? (
              <>
                <div className="summary-registration-code">
                  <span>REGISTRATION CODE</span>

                  <strong>
                    {registration.registrationCode}
                  </strong>
                </div>

                {registration.status === "pending_payment" && (
                  <>
                    {verifying ? (
                      <p className="summary-calculating">
                        Verifying payment...
                      </p>
                    ) : (
                      <PaymentCheckout
                        registrationCode={registration.registrationCode}
                        onPaymentResponse={handlePaymentResponse}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <button
                type="submit"
                form="event-registration-form"
                disabled={
                  submitting ||
                  quoteLoading ||
                  !quote ||
                  (isTeam &&
                    participantCount < form.event.minParticipants)
                }
                className="registration-submit-button"
              >
                {submitting
                  ? "SUBMITTING..."
                  : quote?.totalAmountPaise === 0
                    ? "COMPLETE REGISTRATION"
                    : "CONTINUE TO PAYMENT"}

                <ArrowRight
                  size={18}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
              </button>
            )}

            <p className="summary-secure-note">
              Your registration details are securely processed.
            </p>
          </div>

        </div>
      </aside>
    </div>
  );
}
