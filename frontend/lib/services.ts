import api from "./api";
import {
  User,
  Customer,
  Job,
  Approval,
  Publication,
  PaginatedResponse,
  Candidate,
  InterviewLog,
  Resume,
  CandidateATS,
  CandidateApplication,
  ApplicationStage,
  JobTemplate,
  JobComment,
  JobAssignment,
  WebhookEndpoint,
  WebhookDelivery,
  ScoreCard,
  InterviewScore,
  SubscriptionPlan,
  TenantSubscription,
} from "@/types";

// 顧客管理
export const customerService = {
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<Customer>> {
    const response = await api.get<PaginatedResponse<Customer>>(
      "/api/customers",
      {
        params: { page, limit },
      },
    );
    return response.data;
  },

  async getOne(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`/api/customers/${id}`);
    return response.data;
  },

  async create(data: {
    name: string;
    description?: string;
  }): Promise<Customer> {
    const response = await api.post<Customer>("/api/customers", data);
    return response.data;
  },

  async update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<Customer> {
    const response = await api.patch<Customer>(`/api/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/customers/${id}`);
  },
};

// 求人管理
export const jobService = {
  async getAll(filters?: {
    status?: string;
    customerId?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Job>> {
    const response = await api.get<PaginatedResponse<Job>>("/api/jobs", {
      params: filters,
    });
    return response.data;
  },

  async getOne(id: string): Promise<Job> {
    const response = await api.get<Job>(`/api/jobs/${id}`);
    return response.data;
  },

  async create(data: {
    title: string;
    customerId: string;
    description?: string;
    location?: string;
    salary?: string;
    employmentType?: string;
    requirements?: string;
  }): Promise<Job> {
    const response = await api.post<Job>("/api/jobs", data);
    return response.data;
  },

  async update(id: string, data: Partial<Job>): Promise<Job> {
    const response = await api.patch<Job>(`/api/jobs/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/jobs/${id}`);
  },

  async submitForApproval(id: string): Promise<Approval> {
    const response = await api.post<Approval>(
      `/api/jobs/${id}/submit-for-approval`,
    );
    return response.data;
  },

  async getTextVersions(id: string) {
    const response = await api.get(`/api/jobs/${id}/text-versions`);
    return response.data;
  },

  async getImageVersions(id: string) {
    const response = await api.get(`/api/jobs/${id}/image-versions`);
    return response.data;
  },
};

// テキスト・画像生成
export const generationService = {
  async generateText(jobId: string, prompt?: string) {
    const response = await api.post("/api/generation/text", { jobId, prompt });
    return response.data;
  },

  async generateImage(jobId: string, prompt?: string) {
    const response = await api.post("/api/generation/image", { jobId, prompt });
    return response.data;
  },
};

// 承認フロー
export const approvalService = {
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<Approval>> {
    const response = await api.get<PaginatedResponse<Approval>>(
      "/api/approvals",
      {
        params: { page, limit },
      },
    );
    return response.data;
  },

  async getOne(id: string): Promise<Approval> {
    const response = await api.get<Approval>(`/api/approvals/${id}`);
    return response.data;
  },

  async approve(id: string, comment?: string): Promise<void> {
    await api.post(`/api/approvals/${id}/approve`, { comment });
  },

  async reject(id: string, comment: string): Promise<void> {
    await api.post(`/api/approvals/${id}/reject`, { comment });
  },
};

// コネクタ管理
export const connectorService = {
  async getAll() {
    const response = await api.get("/api/connectors");
    return response.data;
  },

  async getOne(id: string) {
    const response = await api.get(`/api/connectors/${id}`);
    return response.data;
  },

  async create(data: {
    name: string;
    type: string;
    config: Record<string, any>;
  }) {
    const response = await api.post("/api/connectors", data);
    return response.data;
  },

  async update(
    id: string,
    data: {
      name?: string;
      config?: Record<string, any>;
      isActive?: boolean;
    },
  ) {
    const response = await api.patch(`/api/connectors/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/connectors/${id}`);
  },

  async testConnection(id: string) {
    const response = await api.post(`/api/connectors/${id}/test`);
    return response.data;
  },
};

// 掲載管理
export const publicationService = {
  async getConnectors() {
    const response = await api.get("/api/connectors");
    return response.data;
  },

  async createPublication(
    jobId: string,
    connectorId: string,
  ): Promise<Publication> {
    const response = await api.post<Publication>("/api/publications", {
      jobId,
      connectorId,
    });
    return response.data;
  },

  async stopPublication(id: string): Promise<void> {
    await api.post(`/api/publications/${id}/stop`);
  },
};

// 問い合わせ管理
export const inquiryService = {
  async getAll(params?: { source?: string; status?: string }): Promise<any[]> {
    const response = await api.get("/api/inquiries", { params });
    return response.data;
  },

  async create(data: any) {
    const response = await api.post("/api/inquiries", data);
    return response.data;
  },

  async generateResponse(id: string) {
    const response = await api.post(`/api/inquiries/${id}/generate-response`);
    return response.data;
  },

  async send(id: string, responseId: string) {
    const response = await api.post(`/api/inquiries/${id}/send`, {
      responseId,
    });
    return response.data;
  },

  async assignCandidate(id: string, candidateId: string): Promise<void> {
    await api.patch(`/api/inquiries/${id}/assign-candidate`, { candidateId });
  },
};

// 日程調整
export const scheduleService = {
  async getAll() {
    const response = await api.get("/api/schedules");
    return response.data;
  },

  async create(data: {
    candidateName: string;
    candidateEmail: string;
    inquiryId?: string;
  }) {
    const response = await api.post("/api/schedules", data);
    return response.data;
  },

  async confirm(id: string, slotId: string) {
    const response = await api.post(`/api/schedules/${id}/confirm`, { slotId });
    return response.data;
  },
};

// 候補者管理
export const candidateService = {
  async getAll(): Promise<Candidate[]> {
    const res = await api.get<Candidate[]>("/api/candidates");
    return res.data;
  },

  async getOne(id: string): Promise<Candidate> {
    const res = await api.get<Candidate>(`/api/candidates/${id}`);
    return res.data;
  },

  async create(data: {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
  }): Promise<Candidate> {
    const res = await api.post<Candidate>("/api/candidates", data);
    return res.data;
  },

  async update(id: string, data: Partial<Candidate>): Promise<Candidate> {
    const res = await api.patch<Candidate>(`/api/candidates/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/candidates/${id}`);
  },
};

// 面談ログ
export const interviewService = {
  async getAll(candidateId?: string): Promise<InterviewLog[]> {
    const res = await api.get<InterviewLog[]>("/api/interviews", {
      params: candidateId ? { candidateId } : {},
    });
    return res.data;
  },

  async create(data: {
    candidateId: string;
    jobId?: string;
    scheduledAt: string;
    type: string;
    result?: string;
    notes?: string;
    interviewerId?: string;
  }): Promise<InterviewLog> {
    const res = await api.post<InterviewLog>("/api/interviews", data);
    return res.data;
  },

  async update(
    id: string,
    data: { result?: string; notes?: string },
  ): Promise<InterviewLog> {
    const res = await api.patch<InterviewLog>(`/api/interviews/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/interviews/${id}`);
  },
};

// 職務経歴書
export const resumeService = {
  async getAll(candidateId: string): Promise<Resume[]> {
    const res = await api.get<Resume[]>("/api/resumes", {
      params: { candidateId },
    });
    return res.data;
  },

  async generate(candidateId: string): Promise<Resume> {
    const res = await api.post<Resume>("/api/resumes/generate", {
      candidateId,
    });
    return res.data;
  },

  async update(id: string, content: string): Promise<Resume> {
    const res = await api.patch<Resume>(`/api/resumes/${id}`, { content });
    return res.data;
  },
};

// 候補者管理（ATS）
export const candidateATSService = {
  async getAll(filters?: {
    q?: string;
    stage?: string;
    tag?: string;
    jobId?: string;
    page?: number;
  }): Promise<PaginatedResponse<CandidateATS>> {
    const response = await api.get("/api/candidates", { params: filters });
    return response.data;
  },
  async getOne(id: string): Promise<CandidateATS> {
    const response = await api.get(`/api/candidates/${id}`);
    return response.data;
  },
  async create(data: {
    name: string;
    email: string;
    phone?: string;
    skills?: string[];
    tags?: string[];
    notes?: string;
  }): Promise<CandidateATS> {
    const response = await api.post("/api/candidates", data);
    return response.data;
  },
  async update(id: string, data: Partial<CandidateATS>): Promise<CandidateATS> {
    const response = await api.patch(`/api/candidates/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/api/candidates/${id}`);
  },
  async getApplications(id: string): Promise<CandidateApplication[]> {
    const response = await api.get(`/api/candidates/${id}/applications`);
    return response.data;
  },
  async linkToJob(id: string, jobId: string): Promise<CandidateApplication> {
    const response = await api.post(`/api/candidates/${id}/link-job`, {
      jobId,
    });
    return response.data;
  },
  async updateStage(
    applicationId: string,
    stage: ApplicationStage,
  ): Promise<CandidateApplication> {
    const response = await api.patch(
      `/api/candidates/applications/${applicationId}/stage`,
      { stage },
    );
    return response.data;
  },
};

// テンプレート管理
export const templateService = {
  async getAll(filters?: { category?: string }): Promise<JobTemplate[]> {
    const response = await api.get("/api/templates", { params: filters });
    return response.data;
  },
  async getOne(id: string): Promise<JobTemplate> {
    const response = await api.get(`/api/templates/${id}`);
    return response.data;
  },
  async create(data: Partial<JobTemplate>): Promise<JobTemplate> {
    const response = await api.post("/api/templates", data);
    return response.data;
  },
  async update(id: string, data: Partial<JobTemplate>): Promise<JobTemplate> {
    const response = await api.patch(`/api/templates/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/api/templates/${id}`);
  },
  async apply(id: string, jobId: string): Promise<void> {
    await api.post(`/api/templates/${id}/apply`, { jobId });
  },
};

// コメント・アサイン
export const commentService = {
  async getComments(jobId: string): Promise<JobComment[]> {
    const response = await api.get(`/api/jobs/${jobId}/comments`);
    return response.data;
  },
  async addComment(jobId: string, content: string): Promise<JobComment> {
    const response = await api.post(`/api/jobs/${jobId}/comments`, { content });
    return response.data;
  },
  async deleteComment(jobId: string, commentId: string): Promise<void> {
    await api.delete(`/api/jobs/${jobId}/comments/${commentId}`);
  },
  async getAssignments(jobId: string): Promise<JobAssignment[]> {
    const response = await api.get(`/api/jobs/${jobId}/assignments`);
    return response.data;
  },
  async addAssignment(jobId: string, userId: string): Promise<JobAssignment> {
    const response = await api.post(`/api/jobs/${jobId}/assignments`, {
      userId,
    });
    return response.data;
  },
  async removeAssignment(jobId: string, userId: string): Promise<void> {
    await api.delete(`/api/jobs/${jobId}/assignments/${userId}`);
  },
};

// Webhook管理
export const webhookService = {
  async getAll(): Promise<WebhookEndpoint[]> {
    const response = await api.get("/api/webhooks");
    return response.data;
  },
  async create(data: {
    url: string;
    events: string[];
  }): Promise<WebhookEndpoint> {
    const response = await api.post("/api/webhooks", data);
    return response.data;
  },
  async update(
    id: string,
    data: { url?: string; events?: string[]; isActive?: boolean },
  ): Promise<WebhookEndpoint> {
    const response = await api.patch(`/api/webhooks/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/api/webhooks/${id}`);
  },
  async getDeliveries(id: string): Promise<WebhookDelivery[]> {
    const response = await api.get(`/api/webhooks/${id}/deliveries`);
    return response.data;
  },
};

// スコアカード
export const scorecardService = {
  async getAll(): Promise<ScoreCard[]> {
    const response = await api.get("/api/scorecards");
    return response.data;
  },
  async getOne(id: string): Promise<ScoreCard> {
    const response = await api.get(`/api/scorecards/${id}`);
    return response.data;
  },
  async create(data: {
    name: string;
    jobId?: string;
    criteria: {
      name: string;
      weight: number;
      maxScore: number;
      order: number;
    }[];
  }): Promise<ScoreCard> {
    const response = await api.post("/api/scorecards", data);
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/api/scorecards/${id}`);
  },
  async addScore(
    scorecardId: string,
    data: {
      criteriaId: string;
      candidateId: string;
      score: number;
      comment?: string;
    },
  ): Promise<InterviewScore> {
    const response = await api.post(
      `/api/scorecards/${scorecardId}/score`,
      data,
    );
    return response.data;
  },
  async getCandidateScores(candidateId: string): Promise<any> {
    const response = await api.get(`/api/candidates/${candidateId}/scores`);
    return response.data;
  },
};

// サブスクリプション
export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get("/api/subscription/plans");
    return response.data;
  },
  async getCurrent(): Promise<TenantSubscription | null> {
    try {
      const response = await api.get("/api/subscription/current");
      return response.data;
    } catch {
      return null;
    }
  },
  async createCheckout(
    planId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    const response = await api.post("/api/subscription/checkout", {
      planId,
      successUrl,
      cancelUrl,
    });
    return response.data;
  },
  async getPortalUrl(returnUrl: string): Promise<{ url: string }> {
    const response = await api.post("/api/subscription/portal", { returnUrl });
    return response.data;
  },
};

// マッチング
export const matchingService = {
  async matchCandidates(
    jobId: string,
  ): Promise<
    Array<{ candidate: CandidateATS; matchScore: number; reasons: string[] }>
  > {
    const response = await api.post(`/api/jobs/${jobId}/match`);
    return response.data;
  },
};

// レポート
export const reportService = {
  async downloadJobReport(jobId: string): Promise<Blob> {
    const response = await api.get(`/api/reports/jobs/${jobId}`, {
      responseType: "blob",
    });
    return response.data;
  },
  async downloadMonthlyReport(month: string): Promise<Blob> {
    const response = await api.get("/api/reports/monthly", {
      params: { month },
      responseType: "blob",
    });
    return response.data;
  },
};

// ユーザー管理（MANAGER+）
export const userManagementService = {
  async getAll(): Promise<User[]> {
    const response = await api.get("/api/users");
    return response.data;
  },
  async invite(data: {
    email: string;
    name: string;
    password: string;
    role: "MANAGER" | "MEMBER";
  }): Promise<User> {
    const response = await api.post("/api/users/invite", data);
    return response.data;
  },
  async updateRole(id: string, role: "MANAGER" | "MEMBER"): Promise<User> {
    const response = await api.patch(`/api/users/${id}/role`, { role });
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },
};

// 管理者専用（ADMIN）
export const adminService = {
  async getAllTenants(): Promise<any[]> {
    const response = await api.get("/api/tenants");
    return response.data?.data || response.data;
  },
  async createTenant(data: { name: string; slug: string }): Promise<any> {
    const response = await api.post("/api/tenants", data);
    return response.data;
  },
};

// 分析
export const analyticsService = {
  async getDailyMetrics(filters?: {
    startDate?: string;
    endDate?: string;
    jobId?: string;
    connectorId?: string;
  }) {
    const response = await api.get("/api/analytics/daily", { params: filters });
    return response.data;
  },

  async getSummary() {
    const response = await api.get("/api/analytics/summary");
    return response.data;
  },
};

// ポータル（顧客向け）
export const portalService = {
  async getMe() {
    const response = await api.get("/api/portal/me");
    return response.data;
  },

  async getJobs(params?: { status?: string }) {
    const response = await api.get("/api/portal/jobs", { params });
    return response.data;
  },

  async getJob(id: string) {
    const response = await api.get(`/api/portal/jobs/${id}`);
    return response.data;
  },

  async getApprovals() {
    const response = await api.get("/api/portal/approvals");
    return response.data;
  },

  async approve(id: string) {
    const response = await api.post(`/api/portal/approvals/${id}/approve`);
    return response.data;
  },

  async reject(id: string, comment?: string) {
    const response = await api.post(`/api/portal/approvals/${id}/reject`, {
      comment,
    });
    return response.data;
  },

  async getAnalytics() {
    const response = await api.get("/api/portal/analytics");
    return response.data;
  },
};
