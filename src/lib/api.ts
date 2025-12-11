import type { ApiError } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Set Content-Type only if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Special handling for 403 Forbidden errors
      if (response.status === 403) {
        const error: ApiError = await response.json().catch(() => ({
          statusCode: 403,
          message: 'No tienes permisos para realizar esta acción',
          error: 'Forbidden'
        }));

        // Create a custom error with 403 flag for identification
        const forbiddenError = new Error(
          Array.isArray(error.message) ? error.message.join(', ') : error.message
        ) as Error & { statusCode?: number };
        forbiddenError.statusCode = 403;
        throw forbiddenError;
      }

      try {
        const error: ApiError = await response.json();
        throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message);
      } catch (err) {
        // If already thrown (403 case), re-throw
        if (err instanceof Error && (err as Error & { statusCode?: number }).statusCode === 403) {
          throw err;
        }
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    }

    // Handle no content response
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_URL);