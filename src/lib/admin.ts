import { api } from "@/lib/api";
import type {
  AdminApplication,
  AdminStats,
  AdminUser,
  ApiSuccess,
  ApplicationStatus,
  Job,
  JobType,
  Pagination,
  Role,
} from "@/types";

export interface AdminJobInput {
  title?: string;
  company?: string;
  description?: string;
  location?: string;
  jobType?: JobType;
  experienceLevel?: string;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  status?: "OPEN" | "CLOSED";
}

interface PaginatedUsers {
  users: AdminUser[];
  pagination: Pagination;
}

interface PaginatedApplications {
  applications: AdminApplication[];
  pagination: Pagination;
}

export async function getDashboardStats(): Promise<AdminStats> {
  const response = await api.get<ApiSuccess<AdminStats>>("/admin/dashboard/stats");
  return response.data.data;
}

export async function listUsers(params: {
  page?: number;
  limit?: number;
  role?: Role;
  search?: string;
} = {}): Promise<PaginatedUsers> {
  const response = await api.get<ApiSuccess<PaginatedUsers>>("/admin/users", { params });
  return response.data.data;
}

export async function updateUserRole(id: string, role: Role): Promise<AdminUser> {
  const response = await api.patch<ApiSuccess<AdminUser>>(`/admin/users/${id}/role`, { role });
  return response.data.data;
}

export async function createJob(input: AdminJobInput): Promise<Job> {
  const response = await api.post<ApiSuccess<Job>>("/admin/jobs", input);
  return response.data.data;
}

export async function updateJob(id: string, input: AdminJobInput): Promise<Job> {
  const response = await api.patch<ApiSuccess<Job>>(`/admin/jobs/${id}`, input);
  return response.data.data;
}

export async function deleteJob(id: string): Promise<void> {
  await api.delete(`/admin/jobs/${id}`);
}

export async function listApplicationsAdmin(params: {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  jobId?: string;
} = {}): Promise<PaginatedApplications> {
  const response = await api.get<ApiSuccess<PaginatedApplications>>("/admin/applications", { params });
  return response.data.data;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<AdminApplication> {
  const response = await api.patch<ApiSuccess<AdminApplication>>(
    `/admin/applications/${id}`,
    { status }
  );
  return response.data.data;
}