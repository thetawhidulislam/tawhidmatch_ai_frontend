import { api } from "@/lib/api";
import type {
  ApiSuccess,
  Job,
  JobMatch,
  JobType,
  Pagination,
} from "@/types";

export interface ListJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  jobType?: JobType;
  sortBy?: "newest" | "salary_high" | "salary_low";
}

interface JobsResponse {
  jobs: Job[];
  pagination: Pagination;
}

export async function listJobs(
  params: ListJobsParams = {}
): Promise<JobsResponse> {
  const queryParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
  const response = await api.get<ApiSuccess<JobsResponse>>("/jobs", {
    params: queryParams,
  });
  return response.data.data;
}

export async function getJobById(id: string): Promise<Job> {
  const response = await api.get<ApiSuccess<Job>>(`/jobs/${id}`);
  return response.data.data;
}

export async function getJobMatch(id: string): Promise<JobMatch> {
  const response = await api.get<ApiSuccess<JobMatch>>(`/jobs/${id}/match`);
  return response.data.data;
}
