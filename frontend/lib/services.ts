import api from './api';
import { Customer, Job, Approval, Publication, PaginatedResponse } from '@/types';

// 顧客管理
export const customerService = {
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<Customer>> {
    const response = await api.get<PaginatedResponse<Customer>>('/api/customers', {
      params: { page, limit },
    });
    return response.data;
  },

  async getOne(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`/api/customers/${id}`);
    return response.data;
  },

  async create(data: { name: string; description?: string }): Promise<Customer> {
    const response = await api.post<Customer>('/api/customers', data);
    return response.data;
  },

  async update(id: string, data: { name?: string; description?: string }): Promise<Customer> {
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
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Job>> {
    const response = await api.get<PaginatedResponse<Job>>('/api/jobs', {
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
    const response = await api.post<Job>('/api/jobs', data);
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
    const response = await api.post<Approval>(`/api/jobs/${id}/submit-for-approval`);
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
    const response = await api.post('/api/generation/text', { jobId, prompt });
    return response.data;
  },

  async generateImage(jobId: string, prompt?: string) {
    const response = await api.post('/api/generation/image', { jobId, prompt });
    return response.data;
  },
};

// 承認フロー
export const approvalService = {
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<Approval>> {
    const response = await api.get<PaginatedResponse<Approval>>('/api/approvals', {
      params: { page, limit },
    });
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

// 掲載管理
export const publicationService = {
  async getConnectors() {
    const response = await api.get('/api/connectors');
    return response.data;
  },

  async createPublication(jobId: string, connectorId: string): Promise<Publication> {
    const response = await api.post<Publication>('/api/publications', {
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
  async getAll() {
    const response = await api.get('/api/inquiries');
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/api/inquiries', data);
    return response.data;
  },

  async generateResponse(id: string) {
    const response = await api.post(`/api/inquiries/${id}/generate-response`);
    return response.data;
  },

  async send(id: string, responseId: string) {
    const response = await api.post(`/api/inquiries/${id}/send`, { responseId });
    return response.data;
  },
};

// 日程調整
export const scheduleService = {
  async getAll() {
    const response = await api.get('/api/schedules');
    return response.data;
  },

  async create(data: { candidateName: string; candidateEmail: string; inquiryId?: string }) {
    const response = await api.post('/api/schedules', data);
    return response.data;
  },

  async confirm(id: string, slotId: string) {
    const response = await api.post(`/api/schedules/${id}/confirm`, { slotId });
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
    const response = await api.get('/api/analytics/daily', { params: filters });
    return response.data;
  },

  async getSummary() {
    const response = await api.get('/api/analytics/summary');
    return response.data;
  },
};
