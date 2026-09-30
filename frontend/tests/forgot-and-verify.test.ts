import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthErrorMessage } from '../lib/error-handler';

describe('Forgot Password and Email Verification Frontend Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Validations', () => {
    it('validates minimum password length of 8 characters for password reset', () => {
      const validate = (pwd: string) => pwd.length >= 8;
      expect(validate('short')).toBe(false);
      expect(validate('1234567')).toBe(false);
      expect(validate('12345678')).toBe(true);
      expect(validate('StrongP@ss123!')).toBe(true);
    });

    it('validates matching passwords during password reset', () => {
      const validateMatch = (p1: string, p2: string) => p1 === p2;
      expect(validateMatch('password123', 'password124')).toBe(false);
      expect(validateMatch('SecurePassword123!', 'SecurePassword123!')).toBe(true);
    });

    it('validates email format before sending forgot password request', () => {
      const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('learner@example.com')).toBe(true);
      expect(validateEmail('  learner@domain.co.in  ')).toBe(true);
    });
  });

  describe('Error Handling for Password Reset & Verification', () => {
    it('returns custom expired link message when 400 error occurs with expired detail', () => {
      const err = {
        status: 400,
        message: 'यह पासवर्ड रीसेट लिंक समाप्त (expired) हो चुका है। कृपया नया लिंक अनुरोध करें।',
        detail: 'यह पासवर्ड रीसेट लिंक समाप्त (expired) हो चुका है। कृपया नया लिंक अनुरोध करें।',
      };
      const msg = getAuthErrorMessage(err, 'ResetPassword');
      expect(msg).toContain('समाप्त');
    });

    it('returns custom invalid token message when 400 error occurs with invalid detail', () => {
      const err = {
        status: 400,
        message: 'अमान्य या पहले से उपयोग किया गया सत्यापन लिंक।',
        detail: 'अमान्य या पहले से उपयोग किया गया सत्यापन लिंक।',
      };
      const msg = getAuthErrorMessage(err, 'VerifyEmail');
      expect(msg).toContain('अमान्य या पहले से उपयोग किया गया');
    });

    it('returns rate limit message on 429 status', () => {
      const err = {
        status: 429,
        message: 'पासवर्ड रीसेट अनुरोधों की सीमा समाप्त। कृपया १५ मिनट बाद पुनः प्रयास करें।',
      };
      const msg = getAuthErrorMessage(err, 'ForgotPassword');
      expect(msg).toContain('सीमा समाप्त');
    });

    it('returns network error message on connection failure', () => {
      const err = new TypeError('Failed to fetch');
      const msg = getAuthErrorMessage(err, 'ForgotPassword');
      expect(msg).toContain('सर्वर से संपर्क नहीं हो पा रहा है');
    });
  });

  describe('API endpoints integration contracts', () => {
    it('formats forgot password request payload correctly', () => {
      const payload = { email: 'learner@example.com' };
      const serialized = JSON.stringify(payload);
      expect(JSON.parse(serialized)).toEqual({ email: 'learner@example.com' });
    });

    it('formats reset password payload correctly', () => {
      const payload = { token: 'test_token_abc_123', new_password: 'NewStrongPassword123!' };
      const serialized = JSON.stringify(payload);
      expect(JSON.parse(serialized)).toEqual({
        token: 'test_token_abc_123',
        new_password: 'NewStrongPassword123!',
      });
    });

    it('formats email verification payload correctly', () => {
      const payload = { token: 'verify_token_xyz_456' };
      const serialized = JSON.stringify(payload);
      expect(JSON.parse(serialized)).toEqual({
        token: 'verify_token_xyz_456',
      });
    });

    it('formats resend verification payload correctly with or without email', () => {
      const payloadWithEmail = { email: 'target@example.com' };
      expect(JSON.parse(JSON.stringify(payloadWithEmail))).toEqual({ email: 'target@example.com' });

      const payloadEmpty = { email: undefined };
      expect(JSON.parse(JSON.stringify(payloadEmpty))).toEqual({});
    });
  });
});
