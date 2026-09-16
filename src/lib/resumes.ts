import { api } from "@/lib/api";
import type { AIAnalysis, ApiSuccess, Resume } from "@/types";

export async function uploadResume(file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await api.post<ApiSuccess<Resume>>("/resumes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
}

export async function listResumes(): Promise<Resume[]> {
  const response = await api.get<
    ApiSuccess<Array<Resume & { aianalysis?: AIAnalysis | null }>>
  >("/resumes");

  return response.data.data.map(({ aianalysis, ...resume }) => ({
    ...resume,
    aiAnalysis: aianalysis ?? null,
  }));
}

export async function deleteResume(id: string): Promise<void> {
  await api.delete<ApiSuccess<{ id: string }>>(`/resumes/${id}`);
}

export async function analyzeResume(id: string): Promise<AIAnalysis> {
  const response = await api.post<ApiSuccess<AIAnalysis>>(
    `/resumes/${id}/analyze`
  );
  return response.data.data;
}
