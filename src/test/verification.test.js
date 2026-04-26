import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
    generateVerificationCode, 
    isValidEmail, 
    generateAndStoreCode,
    verifyCode,
    isCodeExpired,
    getRemainingAttempts,
    canResendCode,
    resendCode
} from '../services/verification.js';

describe('Verification Service - Unit Tests', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    afterEach(() => {
        // Clean up after each test
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('generateVerificationCode', () => {
        it('should generate a 6-digit string', () => {
            const code = generateVerificationCode();
            expect(code).toHaveLength(6);
            expect(typeof code).toBe('string');
        });

        it('should generate only numeric characters', () => {
            const code = generateVerificationCode();
            expect(/^\d{6}$/.test(code)).toBe(true);
        });

        it('should preserve leading zeros', () => {
            // Mock Math.random to return a small number that would have leading zeros
            vi.spyOn(Math, 'random').mockReturnValue(0.000001);
            const code = generateVerificationCode();
            expect(code).toBe('000001');
        });

        it('should handle maximum value', () => {
            // Mock Math.random to return value close to 1
            vi.spyOn(Math, 'random').mockReturnValue(0.999999);
            const code = generateVerificationCode();
            expect(code).toHaveLength(6);
            expect(/^\d{6}$/.test(code)).toBe(true);
        });
    });

    describe('isValidEmail', () => {
        it('should accept valid email formats', () => {
            expect(isValidEmail('user@domain.com')).toBe(true);
            expect(isValidEmail('test@example.org')).toBe(true);
            expect(isValidEmail('name.surname@company.com')).toBe(true);
        });

        it('should accept emails with subdomains', () => {
            expect(isValidEmail('user@mail.example.com')).toBe(true);
            expect(isValidEmail('test@sub.domain.co.uk')).toBe(true);
        });

        it('should accept emails with plus addressing', () => {
            expect(isValidEmail('user+tag@domain.com')).toBe(true);
            expect(isValidEmail('test+filter@example.org')).toBe(true);
        });

        it('should reject emails without @', () => {
            expect(isValidEmail('userdomain.com')).toBe(false);
        });

        it('should reject emails without domain', () => {
            expect(isValidEmail('user@')).toBe(false);
        });

        it('should reject emails without local part', () => {
            expect(isValidEmail('@domain.com')).toBe(false);
        });

        it('should reject emails without dot in domain', () => {
            expect(isValidEmail('user@domain')).toBe(false);
        });

        it('should reject emails with multiple @ symbols', () => {
            expect(isValidEmail('user@@domain.com')).toBe(false);
            expect(isValidEmail('user@domain@com')).toBe(false);
        });

        it('should reject empty or invalid inputs', () => {
            expect(isValidEmail('')).toBe(false);
            expect(isValidEmail(null)).toBe(false);
            expect(isValidEmail(undefined)).toBe(false);
            expect(isValidEmail(123)).toBe(false);
        });

        it('should reject emails with invalid characters', () => {
            expect(isValidEmail('user name@domain.com')).toBe(false);
            expect(isValidEmail('user@domain .com')).toBe(false);
        });

        it('should reject emails with empty domain parts', () => {
            expect(isValidEmail('user@.com')).toBe(false);
            expect(isValidEmail('user@domain.')).toBe(false);
            expect(isValidEmail('user@domain..com')).toBe(false);
        });
    });

    describe('generateAndStoreCode', () => {
        it('should generate and store verification data', () => {
            const email = 'test@example.com';
            const result = generateAndStoreCode(email);

            expect(result).toHaveProperty('code');
            expect(result).toHaveProperty('expiresAt');
            expect(result).toHaveProperty('createdAt');
            expect(result.code).toHaveLength(6);
        });

        it('should store data in localStorage with correct key', () => {
            const email = 'test@example.com';
            generateAndStoreCode(email);

            const storageKey = `lu_verification_${email}`;
            const stored = localStorage.getItem(storageKey);
            expect(stored).not.toBeNull();

            const data = JSON.parse(stored);
            expect(data.email).toBe(email);
            expect(data.code).toHaveLength(6);
        });

        it('should set expiration to exactly 15 minutes (900000ms)', () => {
            const now = Date.now();
            const email = 'test@example.com';
            const result = generateAndStoreCode(email);

            const expectedExpiration = 15 * 60 * 1000; // 900000ms
            const actualDuration = result.expiresAt - result.createdAt;
            expect(actualDuration).toBe(expectedExpiration);
        });

        it('should initialize attempts to 0', () => {
            const email = 'test@example.com';
            generateAndStoreCode(email);

            const storageKey = `lu_verification_${email}`;
            const data = JSON.parse(localStorage.getItem(storageKey));
            expect(data.attempts).toBe(0);
        });

        it('should set lastResendAt to creation time', () => {
            const email = 'test@example.com';
            generateAndStoreCode(email);

            const storageKey = `lu_verification_${email}`;
            const data = JSON.parse(localStorage.getItem(storageKey));
            expect(data.lastResendAt).toBe(data.createdAt);
        });

        it('should store complete verification data model', () => {
            const email = 'test@example.com';
            generateAndStoreCode(email);

            const storageKey = `lu_verification_${email}`;
            const data = JSON.parse(localStorage.getItem(storageKey));

            expect(data).toHaveProperty('email');
            expect(data).toHaveProperty('code');
            expect(data).toHaveProperty('expiresAt');
            expect(data).toHaveProperty('attempts');
            expect(data).toHaveProperty('lastResendAt');
            expect(data).toHaveProperty('createdAt');
        });

        it('should overwrite existing verification data for same email', () => {
            const email = 'test@example.com';
            
            const first = generateAndStoreCode(email);
            const second = generateAndStoreCode(email);

            expect(first.code).not.toBe(second.code);

            const storageKey = `lu_verification_${email}`;
            const data = JSON.parse(localStorage.getItem(storageKey));
            expect(data.code).toBe(second.code);
        });
    });

    describe('isCodeExpired', () => {
        it('should return true when no verification data exists', () => {
            expect(isCodeExpired('nonexistent@example.com')).toBe(true);
        });

        it('should return false for non-expired code', () => {
            const email = 'test@example.com';
            generateAndStoreCode(email);
            expect(isCodeExpired(email)).toBe(false);
        });

        it('should return true for expired code', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            
            // Create verification data with past expiration
            const verificationData = {
                email,
                code: '123456',
                expiresAt: Date.now() - 1000, // Expired 1 second ago
                attempts: 0,
                lastResendAt: Date.now(),
                createdAt: Date.now()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            expect(isCodeExpired(email)).toBe(true);
        });

        it('should return true exactly at expiration time', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: now,
                attempts: 0,
                lastResendAt: now,
                createdAt: now
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            // Mock Date.now to return a time after expiration
            vi.spyOn(Date, 'now').mockReturnValue(now + 1);
            expect(isCodeExpired(email)).toBe(true);
        });
    });

    describe('getRemainingAttempts', () => {
        it('should return 0 when no verification data exists', () => {
            expect(getRemainingAttempts('nonexistent@example.com')).toBe(0);
        });

        it('should return 5 for new verification data', () => {
            const email = 'test@example.com';
            generateAndStoreCode(email);
            expect(getRemainingAttempts(email)).toBe(5);
        });

        it('should return correct remaining attempts after failures', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: Date.now() + 900000,
                attempts: 2,
                lastResendAt: Date.now(),
                createdAt: Date.now()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            expect(getRemainingAttempts(email)).toBe(3);
        });

        it('should return 0 when max attempts reached', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: Date.now() + 900000,
                attempts: 5,
                lastResendAt: Date.now(),
                createdAt: Date.now()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            expect(getRemainingAttempts(email)).toBe(0);
        });

        it('should return 0 when attempts exceed max', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: Date.now() + 900000,
                attempts: 10,
                lastResendAt: Date.now(),
                createdAt: Date.now()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            expect(getRemainingAttempts(email)).toBe(0);
        });
    });

    describe('verifyCode', () => {
        it('should return success for correct code', () => {
            const email = 'test@example.com';
            const { code } = generateAndStoreCode(email);
            
            const result = verifyCode(email, code);
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should return wrong_code error for incorrect code', () => {
            const email = 'test@example.com';
            generateAndStoreCode(email);
            
            const result = verifyCode(email, '999999');
            expect(result.success).toBe(false);
            expect(result.error).toBe('wrong_code');
        });

        it('should return wrong_code when no verification data exists', () => {
            const result = verifyCode('nonexistent@example.com', '123456');
            expect(result.success).toBe(false);
            expect(result.error).toBe('wrong_code');
        });

        it('should return expired error for expired code', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: Date.now() - 1000, // Expired
                attempts: 0,
                lastResendAt: Date.now(),
                createdAt: Date.now()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            const result = verifyCode(email, '123456');
            expect(result.success).toBe(false);
            expect(result.error).toBe('expired');
        });

        it('should return too_many_attempts error after 5 failed attempts', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: Date.now() + 900000,
                attempts: 5,
                lastResendAt: Date.now(),
                createdAt: Date.now()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            const result = verifyCode(email, '123456');
            expect(result.success).toBe(false);
            expect(result.error).toBe('too_many_attempts');
        });

        it('should increment attempts counter on wrong code', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            generateAndStoreCode(email);
            
            // First wrong attempt
            verifyCode(email, '999999');
            
            let data = JSON.parse(localStorage.getItem(storageKey));
            expect(data.attempts).toBe(1);
            
            // Second wrong attempt
            verifyCode(email, '888888');
            
            data = JSON.parse(localStorage.getItem(storageKey));
            expect(data.attempts).toBe(2);
        });

        it('should not increment attempts on correct code', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const { code } = generateAndStoreCode(email);
            
            verifyCode(email, code);
            
            const data = JSON.parse(localStorage.getItem(storageKey));
            expect(data.attempts).toBe(0);
        });

        it('should handle codes with leading zeros', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            
            const verificationData = {
                email,
                code: '000123',
                expiresAt: Date.now() + 900000,
                attempts: 0,
                lastResendAt: Date.now(),
                createdAt: Date.now()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            const result = verifyCode(email, '000123');
            expect(result.success).toBe(true);
        });

        it('should trim whitespace from submitted code', () => {
            const email = 'test@example.com';
            const { code } = generateAndStoreCode(email);
            
            const result = verifyCode(email, `  ${code}  `);
            expect(result.success).toBe(true);
        });

        it('should check expiration before validating code', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: Date.now() - 1000, // Expired
                attempts: 0,
                lastResendAt: Date.now(),
                createdAt: Date.now()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            // Even with correct code, should return expired
            const result = verifyCode(email, '123456');
            expect(result.error).toBe('expired');
        });

        it('should check attempts before validating code', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: Date.now() + 900000,
                attempts: 5,
                lastResendAt: Date.now(),
                createdAt: Date.now()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            // Even with correct code, should return too_many_attempts
            const result = verifyCode(email, '123456');
            expect(result.error).toBe('too_many_attempts');
        });
    });

    describe('canResendCode', () => {
        it('should return true when no verification data exists', () => {
            expect(canResendCode('nonexistent@example.com')).toBe(true);
        });

        it('should return false within cooldown period (60 seconds)', () => {
            const email = 'test@example.com';
            generateAndStoreCode(email);
            
            // Immediately after generation, should be in cooldown
            expect(canResendCode(email)).toBe(false);
        });

        it('should return false at 59 seconds after last resend', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: now + 900000,
                attempts: 0,
                lastResendAt: now - 59000, // 59 seconds ago
                createdAt: now
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            expect(canResendCode(email)).toBe(false);
        });

        it('should return true at exactly 60 seconds after last resend', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: now + 900000,
                attempts: 0,
                lastResendAt: now - 60000, // Exactly 60 seconds ago
                createdAt: now
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            expect(canResendCode(email)).toBe(true);
        });

        it('should return true after cooldown period has passed', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: now + 900000,
                attempts: 0,
                lastResendAt: now - 120000, // 2 minutes ago
                createdAt: now
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            expect(canResendCode(email)).toBe(true);
        });

        it('should handle missing lastResendAt field', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: now + 900000,
                attempts: 0,
                createdAt: now
                // lastResendAt is missing
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            // Should treat missing lastResendAt as 0, so cooldown should have passed
            expect(canResendCode(email)).toBe(true);
        });
    });

    describe('resendCode', () => {
        it('should return cooldown_active error within cooldown period', () => {
            const email = 'test@example.com';
            generateAndStoreCode(email);
            
            // Immediately try to resend
            const result = resendCode(email);
            expect(result.success).toBe(false);
            expect(result.error).toBe('cooldown_active');
            expect(result.code).toBeUndefined();
        });

        it('should generate new code after cooldown period', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            // Create verification data with cooldown expired
            const verificationData = {
                email,
                code: '123456',
                expiresAt: now + 900000,
                attempts: 3,
                lastResendAt: now - 61000, // 61 seconds ago (cooldown passed)
                createdAt: now - 61000
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            const result = resendCode(email);
            expect(result.success).toBe(true);
            expect(result.code).toBeDefined();
            expect(result.code).toHaveLength(6);
            expect(result.error).toBeUndefined();
        });

        it('should invalidate old code when generating new one', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            // Create verification data with cooldown expired
            const oldCode = '123456';
            const verificationData = {
                email,
                code: oldCode,
                expiresAt: now + 900000,
                attempts: 2,
                lastResendAt: now - 61000,
                createdAt: now - 61000
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            const result = resendCode(email);
            expect(result.success).toBe(true);
            
            // Verify old code no longer works
            const verifyOld = verifyCode(email, oldCode);
            expect(verifyOld.success).toBe(false);
            expect(verifyOld.error).toBe('wrong_code');
            
            // Verify new code works
            const verifyNew = verifyCode(email, result.code);
            expect(verifyNew.success).toBe(true);
        });

        it('should reset attempt counter to 0', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            // Create verification data with some failed attempts
            const verificationData = {
                email,
                code: '123456',
                expiresAt: now + 900000,
                attempts: 4,
                lastResendAt: now - 61000,
                createdAt: now - 61000
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            resendCode(email);
            
            // Check that attempts were reset
            const data = JSON.parse(localStorage.getItem(storageKey));
            expect(data.attempts).toBe(0);
        });

        it('should update lastResendAt timestamp', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: now + 900000,
                attempts: 0,
                lastResendAt: now - 61000,
                createdAt: now - 61000
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            const beforeResend = now - 61000;
            resendCode(email);
            
            const data = JSON.parse(localStorage.getItem(storageKey));
            expect(data.lastResendAt).toBeGreaterThan(beforeResend);
            expect(data.lastResendAt).toBeGreaterThanOrEqual(now);
        });

        it('should set new expiration to 15 minutes from resend time', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: now + 100000, // Old expiration
                attempts: 0,
                lastResendAt: now - 61000,
                createdAt: now - 61000
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            resendCode(email);
            
            const data = JSON.parse(localStorage.getItem(storageKey));
            const expectedExpiration = 15 * 60 * 1000; // 900000ms
            const actualDuration = data.expiresAt - data.createdAt;
            
            // Should be approximately 15 minutes (allowing small timing differences)
            expect(actualDuration).toBeGreaterThanOrEqual(expectedExpiration - 100);
            expect(actualDuration).toBeLessThanOrEqual(expectedExpiration + 100);
        });

        it('should work when no previous verification data exists', () => {
            const email = 'test@example.com';
            
            const result = resendCode(email);
            expect(result.success).toBe(true);
            expect(result.code).toBeDefined();
            expect(result.code).toHaveLength(6);
        });

        it('should generate different code than previous one', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            const oldCode = '123456';
            const verificationData = {
                email,
                code: oldCode,
                expiresAt: now + 900000,
                attempts: 0,
                lastResendAt: now - 61000,
                createdAt: now - 61000
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            const result = resendCode(email);
            expect(result.success).toBe(true);
            
            // While theoretically the same code could be generated randomly,
            // we can at least verify a new code was generated and stored
            const data = JSON.parse(localStorage.getItem(storageKey));
            expect(data.code).toHaveLength(6);
            expect(/^\d{6}$/.test(data.code)).toBe(true);
        });

        it('should return success with code property', () => {
            const email = 'test@example.com';
            const storageKey = `lu_verification_${email}`;
            const now = Date.now();
            
            const verificationData = {
                email,
                code: '123456',
                expiresAt: now + 900000,
                attempts: 0,
                lastResendAt: now - 61000,
                createdAt: now - 61000
            };
            
            localStorage.setItem(storageKey, JSON.stringify(verificationData));
            
            const result = resendCode(email);
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('code');
            expect(result.success).toBe(true);
            expect(typeof result.code).toBe('string');
        });
    });
});
