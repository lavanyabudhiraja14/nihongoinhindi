import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthErrorMessage, logErrorInDev } from '../lib/error-handler';

describe('Auth Error Handler', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  describe('1. Cannot reach the server (Network errors, 502, 503, 504, 0)', () => {
    const expectedNetworkMessage = 'सर्वर से संपर्क नहीं हो पा रहा है। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।';

    it('handles TypeError: Failed to fetch', () => {
      const error = new TypeError('Failed to fetch');
      expect(getAuthErrorMessage(error)).toBe(expectedNetworkMessage);
    });

    it('handles NetworkError message', () => {
      const error = new Error('NetworkError when attempting to fetch resource.');
      expect(getAuthErrorMessage(error)).toBe(expectedNetworkMessage);
    });

    it('handles 502 Bad Gateway', () => {
      const error = { status: 502, message: 'Bad Gateway' };
      expect(getAuthErrorMessage(error)).toBe(expectedNetworkMessage);
    });

    it('handles 503 Service Unavailable', () => {
      const error = { status: 503, message: 'Service Unavailable' };
      expect(getAuthErrorMessage(error)).toBe(expectedNetworkMessage);
    });

    it('handles 504 Gateway Timeout', () => {
      const error = { status: 504, message: 'Gateway Timeout' };
      expect(getAuthErrorMessage(error)).toBe(expectedNetworkMessage);
    });

    it('handles status 0 / connection reset or abort', () => {
      const error = { status: 0, message: 'The user aborted a request' };
      expect(getAuthErrorMessage(error)).toBe(expectedNetworkMessage);
    });
  });

  describe('2. Server error (500)', () => {
    const expectedServerErrorMessage = 'सर्वर में समस्या आई है। कृपया कुछ समय बाद पुनः प्रयास करें।';

    it('handles 500 Internal Server Error', () => {
      const error = { status: 500, message: 'Internal Server Error' };
      expect(getAuthErrorMessage(error)).toBe(expectedServerErrorMessage);
    });

    it('handles Error instance with status 500', () => {
      const error = Object.assign(new Error('Internal Server Error'), { status: 500 });
      expect(getAuthErrorMessage(error)).toBe(expectedServerErrorMessage);
    });
  });

  describe('3. Wrong credentials (401)', () => {
    const expectedAuthMessage = 'अमान्य ईमेल या पासवर्ड। कृपया पुनः जांचें।';

    it('handles 401 Unauthorized status', () => {
      const error = { status: 401, message: 'Invalid email or password' };
      expect(getAuthErrorMessage(error)).toBe(expectedAuthMessage);
    });

    it('handles Error instance with 401 status', () => {
      const error = Object.assign(new Error('Unauthorized'), { status: 401 });
      expect(getAuthErrorMessage(error)).toBe(expectedAuthMessage);
    });
  });

  describe('4. Validation errors (400, 422 using server message)', () => {
    it('uses server message when string detail is provided', () => {
      const error = {
        status: 400,
        message: 'ईमेल पहले से पंजीकृत है।',
        detail: 'ईमेल पहले से पंजीकृत है।',
      };
      expect(getAuthErrorMessage(error)).toBe('ईमेल पहले से पंजीकृत है।');
    });

    it('extracts detail msg from FastAPI validation array', () => {
      const error = {
        status: 422,
        message: 'Value error, Password must contain at least 8 characters',
        detail: [{ msg: 'Value error, Password must contain at least 8 characters' }],
      };
      expect(getAuthErrorMessage(error)).toBe('Value error, Password must contain at least 8 characters');
    });

    it('falls back to generic validation message if message is missing', () => {
      const error = { status: 422, message: '' };
      expect(getAuthErrorMessage(error)).toBe('अमान्य इनपुट। कृपया अपने विवरण की जाँच करें।');
    });
  });

  describe('5. Rate limiting (429)', () => {
    it('handles 429 Too Many Requests with custom server detail', () => {
      const error = {
        status: 429,
        message: 'इस आईपी से बहुत अधिक प्रयास। कृपया १५ मिनट बाद पुनः प्रयास करें।',
      };
      expect(getAuthErrorMessage(error)).toBe('इस आईपी से बहुत अधिक प्रयास। कृपया १५ मिनट बाद पुनः प्रयास करें।');
    });

    it('handles 429 with default rate limit message', () => {
      const error = { status: 429, message: '' };
      expect(getAuthErrorMessage(error)).toBe('बहुत अधिक प्रयास। कृपया कुछ समय बाद पुनः प्रयास करें।');
    });
  });

  describe('6. Browser console logging in development only (console.debug)', () => {
    it('logs error details with console.debug when NODE_ENV is development or test (non-production)', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      (process.env as any).NODE_ENV = 'development';

      const error = new Error('Test error');
      logErrorInDev('TestContext', error);

      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] Error details:', error);
    });

    it('does NOT log error details when NODE_ENV is production', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      (process.env as any).NODE_ENV = 'production';

      const error = new Error('Test error');
      logErrorInDev('TestContext', error);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('7. Form error handling integration', () => {
    it('processes 500 server error response cleanly without throwing uncaught exceptions', async () => {
      // Mock an async signup action that receives a 500 ApiError
      const mockSignupAction = vi.fn().mockRejectedValue({
        status: 500,
        message: 'Internal Server Error',
      });

      let displayedError = '';
      try {
        await mockSignupAction();
      } catch (err: unknown) {
        displayedError = getAuthErrorMessage(err, 'SignupPage');
      }

      expect(displayedError).toBe('सर्वर में समस्या आई है। कृपया कुछ समय बाद पुनः प्रयास करें।');
    });

    it('processes network disconnect cleanly without throwing uncaught exceptions', async () => {
      const mockLoginAction = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      let displayedError = '';
      try {
        await mockLoginAction();
      } catch (err: unknown) {
        displayedError = getAuthErrorMessage(err, 'LoginPage');
      }

      expect(displayedError).toBe('सर्वर से संपर्क नहीं हो पा रहा है। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।');
    });
  });
});
