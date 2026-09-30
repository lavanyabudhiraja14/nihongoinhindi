/**
 * Authentication and API Error Handler
 *
 * Provides specific, user-friendly Hindi error messages based on HTTP status
 * and error type:
 *  - Network errors / unreachable server / 502 / 503 / 504
 *  - Internal server errors (500)
 *  - Wrong credentials (401)
 *  - Validation errors (400, 422 - uses server's message)
 *  - Rate limiting (429)
 *
 * Real error details are logged to the browser console in development mode only.
 */

export interface ErrorWithStatus {
  status?: number;
  message?: string;
  detail?: string | Array<{ msg?: string }>;
  name?: string;
  stack?: string;
}

/**
 * Log error details to console in development environment only (using console.debug to avoid Next.js error overlay).
 */
export function logErrorInDev(context: string, error: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(`[${context}] Error details:`, error);
  }
}

/**
 * Maps any error object or exception to a clear, context-specific Hindi message.
 */
export function getAuthErrorMessage(error: unknown, context: string = 'Auth'): string {
  logErrorInDev(context, error);

  if (!error) {
    return 'अनपेक्षित त्रुटि हुई। कृपया पुनः प्रयास करें।';
  }

  // If passed as a plain string
  if (typeof error === 'string') {
    if (error.includes('Failed to fetch') || error.includes('NetworkError')) {
      return 'सर्वर से संपर्क नहीं हो पा रहा है। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।';
    }
    return error;
  }

  const err = error as ErrorWithStatus;
  const status = err.status;
  const rawMsg = err.message || '';

  // 1. Network / Server Unreachable (502, 503, 504, 0, or TypeError: Failed to fetch)
  if (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status === 0 ||
    err.name === 'TypeError' ||
    rawMsg.toLowerCase().includes('failed to fetch') ||
    rawMsg.toLowerCase().includes('network') ||
    rawMsg.toLowerCase().includes('connection') ||
    rawMsg.toLowerCase().includes('load failed') ||
    rawMsg.toLowerCase().includes('abort')
  ) {
    return 'सर्वर से संपर्क नहीं हो पा रहा है। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।';
  }

  // 2. Internal Server Error (500)
  if (status === 500) {
    return 'सर्वर में समस्या आई है। कृपया कुछ समय बाद पुनः प्रयास करें।';
  }

  // 3. Wrong Credentials / Unauthorized (401)
  if (status === 401) {
    return 'अमान्य ईमेल या पासवर्ड। कृपया पुनः जांचें।';
  }

  // 4. Rate Limiting (429)
  if (status === 429) {
    if (rawMsg && !rawMsg.includes('अनपेक्षित त्रुटि')) {
      return rawMsg;
    }
    return 'बहुत अधिक प्रयास। कृपया कुछ समय बाद पुनः प्रयास करें।';
  }

  // 5. Validation / Client Errors (400, 422) -> Use server's specific message
  if (status === 400 || status === 422) {
    // Check if error detail contains structured validation message
    if (err.detail) {
      if (typeof err.detail === 'string') {
        return err.detail;
      }
      if (Array.isArray(err.detail) && err.detail[0]?.msg) {
        return err.detail[0].msg;
      }
    }
    if (rawMsg && !rawMsg.includes('अनपेक्षित त्रुटि')) {
      return rawMsg;
    }
    return 'अमान्य इनपुट। कृपया अपने विवरण की जाँच करें।';
  }

  // 6. Any other status with a specific message from server
  if (rawMsg && !rawMsg.includes('अनपेक्षित त्रुटि')) {
    return rawMsg;
  }

  return 'अनपेक्षित त्रुटि हुई। कृपया पुनः प्रयास करें।';
}
