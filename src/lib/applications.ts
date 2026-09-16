import { api } from "@/lib/api";
import type { ApiSuccess } from "@/types";

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  resumeId: string;
  status: "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "REJECTED" | "HIRED";
  appliedAt: string;
  updatedAt: string;
}

export async function applyToJob(input: { jobId: string; resumeId: string }): Promise<Application> {
  const response = await api.post<ApiSuccess<Application>>("/applications", input);
  return response.data.data;
}