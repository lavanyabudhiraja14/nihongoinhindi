import { describe, it, expect } from 'vitest';

describe('Auth Form Validation Rules', () => {
  const validateEmail = (email: string): boolean => {
    const trimmed = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const validatePassword = (pwd: string): { valid: boolean; error?: string } => {
    if (!pwd || pwd.length < 8) {
      return { valid: false, error: 'पासवर्ड कम से कम ८ अक्षरों का होना चाहिए।' };
    }
    if (pwd.length > 128) {
      return { valid: false, error: 'पासवर्ड १२८ अक्षरों से अधिक नहीं हो सकता।' };
    }
    return { valid: true };
  };

  const validateDisplayName = (name: string): { valid: boolean; error?: string } => {
    const trimmed = name.trim();
    if (trimmed.length > 40) {
      return { valid: false, error: 'नाम ४० अक्षरों से अधिक नहीं हो सकता।' };
    }
    return { valid: true };
  };

  const validateAvatarFile = (file: { size: number; type: string }): { valid: boolean; error?: string } => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'केवल PNG, JPG, या WebP चित्र की अनुमति है।' };
    }
    if (file.size > 2 * 1024 * 1024) {
      return { valid: false, error: 'चित्र का आकार २ MB से कम होना चाहिए।' };
    }
    return { valid: true };
  };

  it('validates email addresses properly', () => {
    expect(validateEmail('student@example.com')).toBe(true);
    expect(validateEmail('  USER@DOM.IN  ')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
  });

  it('enforces password minimum length of 8 chars', () => {
    expect(validatePassword('short').valid).toBe(false);
    expect(validatePassword('1234567').valid).toBe(false);
    expect(validatePassword('12345678').valid).toBe(true);
    expect(validatePassword('StrongPassword123!').valid).toBe(true);
  });

  it('limits display name to 40 characters', () => {
    expect(validateDisplayName('राहुल').valid).toBe(true);
    expect(validateDisplayName('A'.repeat(40)).valid).toBe(true);
    expect(validateDisplayName('A'.repeat(41)).valid).toBe(false);
  });

  it('validates avatar file types and 2MB limit', () => {
    expect(validateAvatarFile({ type: 'image/png', size: 1024 * 500 }).valid).toBe(true);
    expect(validateAvatarFile({ type: 'image/webp', size: 1024 * 1024 }).valid).toBe(true);
    expect(validateAvatarFile({ type: 'application/pdf', size: 1024 }).valid).toBe(false);
    expect(validateAvatarFile({ type: 'image/png', size: 3 * 1024 * 1024 }).valid).toBe(false);
  });
});
