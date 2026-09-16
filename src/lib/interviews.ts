import { api } from "@/lib/api";
import type {
  ApiSuccess,
  Interview,
  InterviewListItem,
} from "@/types";

export async function startInterview(jobId: string): Promise<Interview> {
  const response = await api.post<ApiSuccess<Interview>>("/interviews", { jobId });
  return response.data.data;
}

export async function getInterviewById(id: string): Promise<Interview> {
  const response = await api.get<ApiSuccess<Interview>>(`/interviews/${id}`);
  return response.data.data;
}

export async function submitAnswer(
  interviewId: string,
  input: { questionId: string; answerText: string }
): Promise<{ completed: boolean; message?: string; evaluation?: Interview }> {
  const response = await api.post<
    ApiSuccess<{ completed: boolean; message?: string; evaluation?: Interview }>
  >(`/interviews/${interviewId}/answer`, input);
  return response.data.data;
}

export async function getInterviewResult(interviewId: string): Promise<Interview> {
  const response = await api.get<ApiSuccess<Interview>>(
    `/interviews/${interviewId}/result`
  );
  return response.data.data;
}

export async function listMyInterviews(): Promise<InterviewListItem[]> {
  const response = await api.get<ApiSuccess<InterviewListItem[]>>("/interviews");
  return response.data.data;
}