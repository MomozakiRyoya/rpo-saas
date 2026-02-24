export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "MEMBER" | "CUSTOMER";
  tenantId: string;
  tenantName: string;
  customerId?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Customer {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    jobs: number;
  };
}

export interface Job {
  id: string;
  title: string;
  status: JobStatus;
  customerId: string;
  customer?: {
    id: string;
    name: string;
  };
  description?: string;
  location?: string;
  salary?: string;
  employmentType?: string;
  requirements?: string;
  publications?: Publication[];
  createdAt: string;
  updatedAt: string;
}

export type JobStatus =
  | "DRAFT"
  | "GENERATED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "PUBLISH_FAILED"
  | "STOPPED";

export interface JobTextVersion {
  id: string;
  jobId: string;
  version: number;
  content: string;
  generatedBy: string;
  createdAt: string;
}

export interface JobImageVersion {
  id: string;
  jobId: string;
  version: number;
  imageUrl: string;
  prompt?: string;
  generatedBy: string;
  createdAt: string;
}

export interface Approval {
  id: string;
  jobId: string;
  job?: Job;
  status: "PENDING" | "APPROVED" | "REJECTED";
  textVersion?: number;
  imageVersion?: number;
  requestedAt: string;
  completedAt?: string;
  reviews?: ApprovalReview[];
}

export interface ApprovalReview {
  id: string;
  approvalId: string;
  reviewerId: string;
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  comment?: string;
  createdAt: string;
}

export interface Connector {
  id: string;
  name: string;
  type: string;
  config?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Publication {
  id: string;
  jobId: string;
  connectorId: string;
  connector?: Connector;
  status: "PENDING" | "PUBLISHING" | "PUBLISHED" | "FAILED" | "STOPPED";
  externalId?: string;
  publishedAt?: string;
  stoppedAt?: string;
}

export interface Inquiry {
  id: string;
  content: string;
  applicantName?: string;
  applicantEmail?: string;
  category?: string;
  status: string;
  source?: string;
  externalId?: string;
  candidateId?: string;
  candidate?: Pick<Candidate, "id" | "name" | "email">;
  publication?: {
    id: string;
    connector: { id: string; name: string; type: string };
  };
  createdAt: string;
  job?: {
    id: string;
    title: string;
  };
  responses?: Array<{
    id: string;
    content: string;
    isSent?: boolean;
    sentAt?: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Candidate {
  id: string;
  tenantId: string;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  inquiries?: Inquiry[];
  interviews?: InterviewLog[];
  resumes?: Resume[];
  _count?: { inquiries: number; interviews: number; resumes: number };
}

export interface InterviewLog {
  id: string;
  candidateId: string;
  candidate?: Pick<Candidate, "id" | "name" | "email">;
  jobId?: string;
  job?: { id: string; title: string };
  scheduledAt: string;
  type: "phone" | "video" | "onsite";
  result: "pass" | "fail" | "pending";
  notes?: string;
  interviewerId?: string;
  interviewer?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  candidateId: string;
  content: string;
  version: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== New Types ====================

export interface CandidateATS {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  tags: string[];
  score?: number;
  resumeUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  applications?: CandidateApplication[];
}

export type ApplicationStage =
  | "SCREENING"
  | "FIRST_INTERVIEW"
  | "SECOND_INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

export interface CandidateApplication {
  id: string;
  candidateId: string;
  candidate?: CandidateATS;
  jobId: string;
  job?: { id: string; title: string };
  stage: ApplicationStage;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobTemplate {
  id: string;
  tenantId: string;
  name: string;
  category?: string;
  title?: string;
  jobDescription?: string;
  promptTemplate?: string;
  location?: string;
  salary?: string;
  employmentType?: string;
  requirements?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobComment {
  id: string;
  jobId: string;
  userId: string;
  user?: { id: string; name: string; email: string };
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobAssignment {
  id: string;
  jobId: string;
  userId: string;
  user?: { id: string; name: string; email: string };
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: string;
  payload: Record<string, any>;
  responseStatus?: number;
  responseBody?: string;
  success: boolean;
  createdAt: string;
}

export interface ScoreCard {
  id: string;
  name: string;
  jobId?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  criteria?: ScoreCardCriteria[];
  job?: { id: string; title: string };
}

export interface ScoreCardCriteria {
  id: string;
  scoreCardId: string;
  name: string;
  weight: number;
  maxScore: number;
  order: number;
}

export interface InterviewScore {
  id: string;
  criteriaId: string;
  candidateId: string;
  evaluatorId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  stripePriceId?: string;
  price: number;
  features: Record<string, any>;
  isActive: boolean;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  planId: string;
  plan?: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

// ==================== Portal Types ====================

export interface PortalJob {
  id: string;
  title: string;
  status: string;
  description?: string;
  location?: string;
  salary?: string;
  employmentType?: string;
  requirements?: string;
  createdAt: string;
  updatedAt?: string;
  customer?: { id: string; name: string };
  approvals?: Array<{ id: string; status: string; requestedAt: string }>;
  publications?: Array<{ id: string; status: string; connector?: { name: string } }>;
  textVersions?: Array<{ id: string; version: number; content: string; generatedBy?: string }>;
  imageVersions?: Array<{ id: string; version: number; imageUrl: string; generatedBy?: string }>;
}

export interface PortalApproval {
  id: string;
  status: string;
  requestedAt: string;
  job?: PortalJob;
}

export interface PortalAnalytics {
  totalImpressions: number;
  totalClicks: number;
  totalApplications: number;
  avgClickRate: number;
  jobMetrics: Array<{
    jobId: string;
    title: string;
    impressions: number;
    clicks: number;
    applications: number;
  }>;
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  customerName: string | null;
  customerId: string | null;
}
