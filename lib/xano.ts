import axios from 'axios';

const XANO_BASE_URL = 'https://api.collabwork.com';

export interface JobPosting {
  id: number;
  company: string;
  title: string;
  location: Array<{
    city?: string;
    state?: string;
    country?: string;
  }>;
  employment_type?: string;
  salary_min?: number;
  salary_max?: number;
  salary_period?: string;
  description?: string;
  application_url?: string;
  posted_at?: number;
  custom_company_name?: string;
  custom_location?: string;
  notes?: string;
  is_priority?: boolean;
  priority_reason?: string;
  communities?: string[];
  is_morningbrew?: boolean;
  morningbrew?: {
    community_ids: Array<{
      id: number;
      community_name: string;
    }>;
    is_priority?: boolean;
  };
}

export interface Community {
  id: number;
  community_name: string;
}

export interface AddJobPayload {
  job_posting_id: string;
  community_ids: number[];
}

export interface UpdateJobPayload {
  job_posting_id: string;
  custom_company_name?: string;
  custom_location?: string;
  notes?: string;
}

export interface AddJobPriorityPayload {
  job_posting_id: string;
  community_ids: number[];
  notes?: string;
  is_priority?: boolean;
  priority_reason?: string;
}

class XanoService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: XANO_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async listJobs(page: number = 0) {
    const response = await this.axiosInstance.post('/api:microapp/ashley/list-jobs', {
      page: page,
    });
    return response.data;
  }

  async addJob(payload: AddJobPayload) {
    const response = await this.axiosInstance.post('/api:microapp/ashley/add-job', payload);
    return response.data;
  }

  async removeJob(jobPostingId: string) {
    const response = await this.axiosInstance.post('/api:microapp/ashley/remove-job', {
      job_posting_id: parseInt(jobPostingId, 10),
    });
    return response.data;
  }

  async updateJob(payload: UpdateJobPayload) {
    const response = await this.axiosInstance.post('/api:microapp/ashley/update-job', payload);
    return response.data;
  }

  async addJobPriority(payload: AddJobPriorityPayload) {
    const response = await this.axiosInstance.post('/api:microapp/ashley/add-job-priority', payload);
    return response.data;
  }

  async getCommunities() {
    const response = await this.axiosInstance.get('/api:microapp/communities');
    return response.data;
  }
}

export const xanoService = new XanoService();