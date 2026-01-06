/**
 * API Client - Centralized API communication layer for Admin Panel
 * Handles all HTTP requests to the backend API with proper error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Get authentication token from cookies (server-side compatible)
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));

    if (!tokenCookie) {
        return null;
    }

    return tokenCookie.split('=')[1]?.trim() || null;
}

/**
 * Set authentication token in cookies
 */
export function setAuthToken(token: string | undefined): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (token) {
        // Store token in cookie with 7 day expiration
        const expires = new Date();
        expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
        document.cookie = `admin_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    } else {
        document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            const error: ApiError = {
                message: data.message || data.error || 'An error occurred',
                statusCode: response.status,
                errors: data.errors,
            };

            // Handle authentication errors
            if (response.status === 401) {
                setAuthToken(undefined);
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            throw error;
        }

        return data;
    } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw {
                message: 'Network error. Please check if the API server is running.',
                statusCode: 0,
            } as ApiError;
        }

        throw error as ApiError;
    }
}

/**
 * GET request
 */
export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return fetchAPI<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function post<T>(
    endpoint: string,
    body?: unknown
): Promise<ApiResponse<T>> {
    return fetchAPI<T>(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * PUT request
 */
export async function put<T>(
    endpoint: string,
    body?: unknown
): Promise<ApiResponse<T>> {
    return fetchAPI<T>(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * DELETE request
 */
export async function del<T>(
    endpoint: string
): Promise<ApiResponse<T>> {
    return fetchAPI<T>(endpoint, { method: 'DELETE' });
}

/**
 * PATCH request
 */
export async function patch<T>(
    endpoint: string,
    body?: unknown
): Promise<ApiResponse<T>> {
    return fetchAPI<T>(endpoint, {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
    });
}

