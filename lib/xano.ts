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
  is_remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_period?: string;
  cpc?: number;
  cpa?: number;
  description?: string;
  ai_description?: string;
  ai_title?: string;
  ai_skills?: string[];
  ai_job_tasks?: string[];
  ai_search_terms?: string[];
  ai_top_tags?: string[];
  ai_confidence_score?: number;
  application_url?: string;
  posted_at?: number;
  created_at?: number;
  sector?: string;
  industry?: string;
  industry_group?: string;
  post_type?: string;
  _geo?: {
    lat: number;
    lng: number;
  };
  searchable_text?: string;
  execution_id?: number;
  partner_id?: number;
  feed_id?: number;
  source?: string;
  custom_company_name?: string;
  custom_location?: string | Array<{
    city?: string;
    state?: string;
    country?: string;
  }> | {
    city?: string;
    state?: string;
    country?: string;
  };
  custom_employment_type?: string;
  custom_is_remote?: string;
  notes?: string;
  is_priority?: boolean;
  priority_reason?: string;
  communities?: string[];
  is_morningbrew?: boolean;
  single_partner?: {
    partner_name?: string;
    payment_type?: string;
  };
  morningbrew?: {
    id?: number;
    community_ids: Array<{
      id: number;
      community_name: string;
    }>;
    is_priority?: boolean;
    status?: string;
    click_count?: number;
    published_at?: number;
    approved_at?: number;
    archived_at?: number;
    cached_job_title?: string;
    cached_company?: string;
    cached_location?: string;
    cached_application_url?: string;
    is_source_deleted?: boolean;
    formatted_title?: string;
    custom_company_name?: string;
    custom_location?: string | Array<{
      city?: string;
      state?: string;
      country?: string;
    }> | {
      city?: string;
      state?: string;
      country?: string;
    };
    custom_employment_type?: string;
    custom_is_remote?: string;
    cached_employment_type?: string;
    cached_is_remote?: boolean;
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
  custom_location?: Array<{
    city?: string;
    state?: string;
    country?: string;
  }>;
  custom_employment_type?: string;
  custom_is_remote?: string;
  formatted_title?: string;
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

  async listJobs(page: number = 1, per_page: number = 50, search?: string, filters?: Record<string, unknown>) {
    const payload = {
      page: page,
      per_page: per_page,
      search: search || '',
      filters: filters || {}
    };
    console.log('XanoService.listJobs - Sending payload:', payload);
    const response = await this.axiosInstance.post('/api:microapp/ashley/list-jobs', payload);
    console.log('XanoService.listJobs - Response received, items:', response.data.items?.length || response.data.length);
    return response.data;
  }

  async searchAllJobs(page: number = 1, per_page: number = 50, search?: string, filters?: Record<string, unknown>) {
    const payload = {
      page: page || '',
      per_page: per_page || '',
      search: search || '',
      feed_source: filters?.feed_source || ''
    };
    console.log('XanoService.searchAllJobs - Sending payload:', payload);
    const response = await this.axiosInstance.post('/api:microapp/ashley/search-all-jobs', payload);
    console.log('XanoService.searchAllJobs - Response received, items:', response.data.items?.length || response.data.length);
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
    console.log('XanoService.updateJob - Sending payload:', payload);
    const response = await this.axiosInstance.post('/api:microapp/ashley/update-job', payload);
    console.log('XanoService.updateJob - Received response:', response.data);
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

  async formatJobTitle(jobPostingId: number) {
    const response = await this.axiosInstance.post('/api:microapp/morningbrew/format-title', {
      job_posting_id: jobPostingId,
    });
    return response.data;
  }

  async listMorningBrewJobs(page: number = 1, status: string = '', per_page: number = 100) {
    const response = await this.axiosInstance.post('/api:microapp/morningbrew/list-all-brands', {
      page: page,
      status: status,
      per_page: per_page
    });
    return response.data;
  }

  // Authentication methods
  async loginAdmin(email: string, password: string) {
    const response = await this.axiosInstance.post('/api:microapp/admin/auth/login', {
      email,
      password
    });
    if (response.data.authToken) {
      // Store token in interceptor
      this.axiosInstance.defaults.headers.Authorization = `Bearer ${response.data.authToken}`;
    }
    return response.data;
  }

  async validateAuth() {
    const response = await this.axiosInstance.get('/api:microapp/admin/auth/me');
    return response.data;
  }

  // Shared tracking link method
  async generateTrackingLink(jobId: number, communityId: number) {
    const response = await this.axiosInstance.post('/api:microapp/shared/generate-tracking-link', {
      job_posting_id: jobId,
      community_id: communityId
    });
    return response.data;
  }

  // Brew-specific methods
  async updateJobField(jobId: number, field: string, value: string | boolean | number) {
    const response = await this.axiosInstance.post('/api:microapp/brew/update-details', {
      job_id: jobId,
      [field]: value
    });
    return response.data;
  }

  async removeJobFromCommunity(jobPostingId: number, communityId: number) {
    console.log('XanoService: removeJobFromCommunity called with', { jobPostingId, communityId });
    try {
      const response = await this.axiosInstance.post('/api:microapp/ashley/remove-job-from-community', {
        job_posting_id: jobPostingId,
        community_id: communityId
      });
      console.log('XanoService: API response', response.data);
      return response.data;
    } catch (error) {
      console.error('XanoService: API error', error);
      throw error;
    }
  }
}

export const xanoService = new XanoService();