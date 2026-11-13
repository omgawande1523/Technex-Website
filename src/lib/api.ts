import { getCurrentSession } from "@/lib/supabase/auth";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PublicEventSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  eventType: "individual" | "team";
  feeType: "free" | "per_participant" | "per_team";
  feeAmountPaise: number;
  minParticipants: number;
  maxParticipants: number;
  registrationOpen: boolean;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
};

export type EventFormField = {
  id: string;
  fieldKey: string;
  label: string;
  fieldType:
    | "short_text"
    | "long_text"
    | "email"
    | "url"
    | "number"
    | "dropdown"
    | "radio"
    | "checkbox"
    | "multi_select";
  scope: "registration" | "participant";
  isRequired: boolean;
  options: string[];
  validation: Record<string, unknown>;
  displayOrder: number;
};

export type PublicEventForm = {
  event: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    eventType: "individual" | "team";
    feeType: "free" | "per_participant" | "per_team";
    feeAmountPaise: number;
    minParticipants: number;
    maxParticipants: number;
    registrationOpen: boolean;
    canRegister: boolean;
  };
  formFields: EventFormField[];
};

export type PublicWorkshopForm = {
  workshop: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    feeAmountPaise: number;
    registrationOpen: boolean;
    registrationOpensAt: string | null;
    registrationClosesAt: string | null;
    canRegister: boolean;
  };
  formFields: EventFormField[];
};

export type WorkshopFeeQuote = {
  workshopSlug: string;
  feeType: "per_participant";
  feeAmountPaise: number;
  participantCount: 1;
  totalAmountPaise: number;
  currency: "INR";
};

export type FeeQuote = {
  eventSlug: string;
  feeType: "free" | "per_participant" | "per_team";
  feeAmountPaise: number;
  participantCount: number;
  totalAmountPaise: number;
  currency: "INR";
};

export type ParticipantInput = {
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: "" | "male" | "female" | "other";
  state: string;
  city: string;
  collegeName: string;
  department: string;
  degree: string;
};

export type RegistrationAnswerInput = {
  fieldId: string;
  answer: unknown;
  participantIndex?: number;
};

export type IndividualRegistrationInput = {
  participant: ParticipantInput;
  answers: RegistrationAnswerInput[];
};

export type TeamRegistrationInput = {
  teamName: string;
  leader: ParticipantInput;
  members: ParticipantInput[];
  answers: RegistrationAnswerInput[];
};

export type RegistrationInput =
  | IndividualRegistrationInput
  | TeamRegistrationInput;

export type RegistrationResult = {
  registrationCode: string;
  status: "pending_payment" | "confirmed";
  totalAmountPaise: number;
  currency: "INR";
  teamSize?: number;
  alreadySubmitted: boolean;
};

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Something went wrong.",
    );
  }

  return result as ApiResponse<T>;
}

export async function getPublishedEvents(): Promise<PublicEventSummary[]> {
  const result = await apiRequest<PublicEventSummary[]>(
    "/api/public/events",
    { method: "GET" },
  );

  return result.data;
}

// Fetch event configuration and dynamic form fields.
export async function getEventRegistrationForm(
  slug: string,
): Promise<PublicEventForm> {
  const result = await apiRequest<PublicEventForm>(
    `/api/public/events/${encodeURIComponent(slug)}/form`,
    { method: "GET" },
  );

  return result.data;
}

// Request an authoritative fee quote from the backend.
export async function getFeeQuote(
  slug: string,
  participantCount: number,
): Promise<FeeQuote> {
  const result = await apiRequest<FeeQuote>(
    `/api/public/events/${encodeURIComponent(slug)}/quote`,
    {
      method: "POST",
      body: JSON.stringify({ participantCount }),
    },
  );

  return result.data;
}

// Submit individual or team registration.
export async function submitRegistration(
  slug: string,
  input: RegistrationInput,
  idempotencyKey: string,
): Promise<RegistrationResult> {
  const result = await apiRequest<RegistrationResult>(
    `/api/public/events/${encodeURIComponent(slug)}/register`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(input),
    },
  );

  return result.data;
}
// Fetch public workshop configuration and dynamic form fields.
export async function getWorkshopRegistrationForm(
  slug: string,
): Promise<PublicWorkshopForm> {
  const result = await apiRequest<PublicWorkshopForm>(
    `/api/public/workshops/${encodeURIComponent(slug)}/form`,
    { method: "GET" },
  );

  return result.data;
}

// Fetch authoritative workshop fee.
export async function getWorkshopFeeQuote(
  slug: string,
): Promise<WorkshopFeeQuote> {
  const result = await apiRequest<WorkshopFeeQuote>(
    `/api/public/workshops/${encodeURIComponent(slug)}/quote`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return result.data;
}

// Submit individual workshop registration.
export async function submitWorkshopRegistration(
  slug: string,
  input: IndividualRegistrationInput,
  idempotencyKey: string,
): Promise<RegistrationResult> {
  const result = await apiRequest<RegistrationResult>(
    `/api/public/workshops/${encodeURIComponent(slug)}/register`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(input),
    },
  );

  return result.data;
}

export type PaymentOrder = {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
  alreadyExists: boolean;
};

export type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export async function createPaymentOrder(
  registrationCode: string,
): Promise<PaymentOrder> {
  const result = await apiRequest<PaymentOrder>(
    `/api/public/registrations/${encodeURIComponent(registrationCode)}/payment/order`,
    { method: "POST" },
  );

  return result.data;
}


export type PaymentVerificationResult = {
  registrationCode: string;
  registrationStatus: "confirmed";
  paymentStatus: "captured";
  alreadyVerified: boolean;
};

export async function verifyPayment(
  registrationCode: string,
  payment: RazorpayPaymentResponse,
): Promise<PaymentVerificationResult> {
  const result = await apiRequest<PaymentVerificationResult>(
    `/api/public/registrations/${encodeURIComponent(registrationCode)}/payment/verify`,
    {
      method: "POST",
      body: JSON.stringify(payment),
    },
  );

  return result.data;
}

// --------------------------------------------------
// Admin Analytics API
// --------------------------------------------------

export type AnalyticsDateRange = {
  fromDate: string;
  toDate: string;
};

export type AnalyticsOverview = {
  registrations: number;
  confirmedRegistrations: number;
  pendingRegistrations: number;
  cancelledRegistrations: number;
  expiredRegistrations: number;
  participants: number;
  teams: number;
  capturedRevenuePaise: number;
  confirmedRevenuePaise: number;
  requiresReviewRevenuePaise: number;
  capturedPaymentRecords: number;
  requiresReviewRecords: number;
};

export type AnalyticsPaymentStatus = {
  status: string;
  total: number;
};

export type AnalyticsTrend = {
  date: string;
  registrations?: number;
  confirmed?: number;
  revenuePaise?: number;
};

export type AnalyticsItem = {
  id: string;
  name: string;
  category: string;
  registrations: number;
  confirmed: number;
  teams: number;
  participants: number;
  revenuePaise: number;
};

export type AdminAnalytics = {
  type: "event" | "workshop";
  dateRange: {
    from: string;
    to: string;
  };
  overview: AnalyticsOverview;
  paymentRecordsByStatus: AnalyticsPaymentStatus[];
  registrationTrend: AnalyticsTrend[];
  revenueTrend: AnalyticsTrend[];
  itemBreakdown: AnalyticsItem[];
};

async function adminAnalyticsRequest(
  path: string,
): Promise<AdminAnalytics> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const {
    data: { session },
    error,
  } = await getCurrentSession();

  if (error || !session?.access_token) {
    throw new Error("Your admin session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to fetch analytics.");
  }

  return result.data as AdminAnalytics;
}

export async function getEventsAnalytics(
  range: AnalyticsDateRange,
): Promise<AdminAnalytics> {
  const params = new URLSearchParams({
    fromDate: range.fromDate,
    toDate: range.toDate,
  });

  return adminAnalyticsRequest(
    `/api/admin/analytics/events?${params.toString()}`,
  );
}

export async function getWorkshopsAnalytics(
  range: AnalyticsDateRange,
): Promise<AdminAnalytics> {
  const params = new URLSearchParams({
    fromDate: range.fromDate,
    toDate: range.toDate,
  });

  return adminAnalyticsRequest(
    `/api/admin/analytics/workshops?${params.toString()}`,
  );
}