/**
 * Read the client-accessible CSRF cookie (nihongo_csrf).
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/(?:^|;\s*)nihongo_csrf=([^;]*)/);

  return match ? decodeURIComponent(match[1]) : null;
}

export interface ApiError {
  message: string;
  status: number;
}

// Render backend URL
const API_BASE_URL = 'https://nihongoinhindi.onrender.com';

/**
 * Standard fetch wrapper with automatic CSRF token
 * header attachment and credentials inclusion.
 */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  // For state-mutating requests, attach X-CSRF-Token if available
  const method = (options.method || 'GET').toUpperCase();

  if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) {
    const csrf = getCsrfToken();

    if (csrf && !headers.has('X-CSRF-Token')) {
      headers.set('X-CSRF-Token', csrf);
    }
  }

  // Set JSON content-type if body is a JSON string
  if (
    options.body &&
    typeof options.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  // Construct the complete backend URL
  const requestUrl = /^https?:\/\//i.test(url)
    ? url
    : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;

  const res = await fetch(requestUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errorDetail = '';
    let rawDetail: any = null;

    try {
      const data = await res.json();

      if (data && data.detail) {
        rawDetail = data.detail;

        if (typeof data.detail === 'string') {
          errorDetail = data.detail;
        } else if (
          Array.isArray(data.detail) &&
          data.detail[0]?.msg
        ) {
          errorDetail = data.detail[0].msg;
        }
      }
    } catch {
      // Non-JSON response
    }

    if (!errorDetail) {
      if ([502, 503, 504].includes(res.status)) {
        errorDetail =
          'सर्वर से संपर्क नहीं हो पा रहा है। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।';
      } else if (res.status === 500) {
        errorDetail =
          'सर्वर में समस्या आई है। कृपया कुछ समय बाद पुनः प्रयास करें।';
      } else if (res.status === 401) {
        errorDetail =
          'अमान्य ईमेल या पासवर्ड। कृपया पुनः जांचें।';
      } else {
        errorDetail =
          'अनपेक्षित त्रुटि हुई। कृपया पुनः प्रयास करें।';
      }
    }

    const err = new Error(errorDetail) as Error &
      ApiError & { detail?: any };

    err.status = res.status;
    err.message = errorDetail;
    err.detail = rawDetail;

    throw err;
  }

  // If response is empty (e.g. 204 or void)
  const contentType = res.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  return {} as T;
}