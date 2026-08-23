import {
  CurrentUser,
  TokenResponse,
  Organisation,
  Job,
  JobSummary,
  Resume,
  BatchJob,
  MatchResult,
  ShortlistResponse,
  AuditEvent,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("merix_token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("merix_token", token);
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("merix_token");
    localStorage.removeItem("merix_user");
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_BASE_URL}${endpoint}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error";
    throw new ApiError(
      `Unable to reach Merix backend at ${API_BASE_URL}. Ensure the server is running. (${errorMsg})`,
      0
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    if (typeof data === "object" && data !== null) {
      const d = data as Record<string, unknown>;
      if (typeof d.detail === "string") {
        message = d.detail;
      } else if (Array.isArray(d.detail)) {
        message = d.detail.map((e: { msg?: string; loc?: string[] }) => `${e.loc?.join(".")}: ${e.msg}`).join(", ");
      } else if (d.error && typeof d.error === "object" && "message" in d.error) {
        message = String((d.error as { message: unknown }).message);
      }
    }
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth
  async signup(orgName: string, email: string, password: string): Promise<TokenResponse> {
    const res = await request<TokenResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ org_name: orgName, email, password }),
    });
    setToken(res.access_token);
    return res;
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(res.access_token);
    return res;
  },

  async getMe(): Promise<CurrentUser> {
    return request<CurrentUser>("/auth/me");
  },

  // Jobs
  async listJobs(): Promise<JobSummary[]> {
    return request<JobSummary[]>("/jobs");
  },

  async createJob(title: string, rawText: string): Promise<Job> {
    return request<Job>("/jobs", {
      method: "POST",
      body: JSON.stringify({ title, raw_text: rawText }),
    });
  },

  async getJob(jobId: string): Promise<Job> {
    return request<Job>(`/jobs/${jobId}`);
  },

  async listJobResumes(jobId: string): Promise<Resume[]> {
    return request<Resume[]>(`/jobs/${jobId}/resumes`);
  },

  async uploadResume(
    jobId: string,
    file: File,
    candidateName: string | undefined,
    consentGiven: boolean
  ): Promise<Resume> {
    const formData = new FormData();
    formData.append("file", file);
    if (candidateName) {
      formData.append("candidate_name", candidateName);
    }
    formData.append("consent_given", consentGiven ? "true" : "false");

    return request<Resume>(`/jobs/${jobId}/resumes`, {
      method: "POST",
      body: formData,
    });
  },

  // Matching & Batch Jobs
  async startBatchMatch(jobId: string, idempotencyKey?: string): Promise<BatchJob> {
    return request<BatchJob>(`/jobs/${jobId}/match`, {
      method: "POST",
      body: JSON.stringify({ idempotency_key: idempotencyKey || null }),
    });
  },

  async getBatchJobStatus(batchJobId: string): Promise<BatchJob> {
    return request<BatchJob>(`/batch-jobs/${batchJobId}`);
  },

  // Results
  async listMatches(jobId: string, minScore?: number): Promise<ShortlistResponse> {
    const query = minScore !== undefined ? `?min_score=${minScore}` : "";
    return request<ShortlistResponse>(`/jobs/${jobId}/matches${query}`);
  },

  async getMatch(matchId: string): Promise<MatchResult> {
    return request<MatchResult>(`/matches/${matchId}`);
  },

  getExportUrl(jobId: string, minScore?: number): string {
    const query = minScore !== undefined ? `?min_score=${minScore}` : "";
    return `${API_BASE_URL}/jobs/${jobId}/matches/export${query}`;
  },

  // DPDP Erasure
  async deleteCandidate(resumeId: string): Promise<void> {
    await request<void>(`/candidates/${resumeId}`, {
      method: "DELETE",
    });
  },

  // Organisation & Compliance
  async getMyOrg(): Promise<Organisation> {
    return request<Organisation>("/orgs/me");
  },

  async updateMyOrg(retentionDays: number): Promise<Organisation> {
    return request<Organisation>("/orgs/me", {
      method: "PATCH",
      body: JSON.stringify({ retention_days: retentionDays }),
    });
  },

  async listAuditLogs(limit: number = 100): Promise<AuditEvent[]> {
    return request<AuditEvent[]>(`/orgs/audit-logs?limit=${limit}`);
  },

  // Health
  async checkHealth(): Promise<{ status: string; database?: string }> {
    return request<{ status: string; database?: string }>("/health");
  },
};
