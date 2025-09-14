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
  custom_location?: string;
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
}

export const xanoService = new XanoService();