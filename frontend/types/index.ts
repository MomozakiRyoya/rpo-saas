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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
