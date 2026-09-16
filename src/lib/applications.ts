import { api } from "@/lib/api";
import type { ApiSuccess, Application } from "@/types";

export async function applyToJob(input: { jobId: string; resumeId: string }): Promise<Application> {
  const response = await api.post<ApiSuccess<Application>>("/applications", input);
  return response.data.data;
}

export async function listMyApplications(): Promise<Application[]> {
  const response = await api.get<ApiSuccess<Application[]>>("/applications");
  return response.data.data;
}