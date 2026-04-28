import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendVerificationEmail } from '../services/emailService.js';

describe('Email Service - Unit Tests', () => {
    let consoleLogSpy;
    
    beforeEach(() => {
        // Spy on console.log to verify email logging
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore console.log
        consoleLogSpy.mockRestore();
    });

    describe('sendVerificationEmail', () => {
        it('should return success for valid email and code', async () => {
            const result = await sendVerificationEmail('test@example.com', '123456');
            
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should log email content to console', async () => {
            await sendVerificationEmail('test@example.com', '123456');
            
            // Verify console.log was called
            expect(consoleLogSpy).toHaveBeenCalled();
            
            // Verify email content includes key elements
            const loggedContent = consoleLogSpy.mock.calls.flat().join('\n');
            expect(loggedContent).toContain('test@example.com');
            expect(loggedContent).toContain('123456');
            expect(loggedContent).toContain('LinkUp');
        });

        it('should include verification code in email template', async () => {
            const code = '987654';
            await sendVerificationEmail('user@test.com', code);
            
            const loggedContent = consoleLogSpy.mock.calls.flat().join('\n');
            expect(loggedContent).toContain(code);
        });

        it('should include platform branding (LinkUp)', async () => {
            await sendVerificationEmail('test@example.com', '123456');
            
            const loggedContent = consoleLogSpy.mock.calls.flat().join('\n');
            expect(loggedContent).toContain('LinkUp');
        });

        it('should include instructions in email', async () => {
            await sendVerificationEmail('test@example.com', '123456');
            
            const loggedContent = consoleLogSpy.mock.calls.flat().join('\n');
            expect(loggedContent).toContain('Instructions');
            expect(loggedContent).toContain('15 minutes');
        });

        it('should return error for invalid email', async () => {
            const result = await sendVerificationEmail('', '123456');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('invalid_email');
        });

        it('should return error for null email', async () => {
            const result = await sendVerificationEmail(null, '123456');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('invalid_email');
        });

        it('should return error for undefined email', async () => {
            const result = await sendVerificationEmail(undefined, '123456');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('invalid_email');
        });

        it('should return error for non-string email', async () => {
            const result = await sendVerificationEmail(12345, '123456');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('invalid_email');
        });

        it('should return error for invalid code (empty)', async () => {
            const result = await sendVerificationEmail('test@example.com', '');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('invalid_code');
        });

        it('should return error for invalid code (null)', async () => {
            const result = await sendVerificationEmail('test@example.com', null);
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('invalid_code');
        });

        it('should return error for invalid code (wrong length)', async () => {
            const result = await sendVerificationEmail('test@example.com', '12345');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('invalid_code');
        });

        it('should return error for code longer than 6 digits', async () => {
            const result = await sendVerificationEmail('test@example.com', '1234567');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('invalid_code');
        });

        it('should accept code with leading zeros', async () => {
            const result = await sendVerificationEmail('test@example.com', '000123');
            
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should handle multiple email sends', async () => {
            const result1 = await sendVerificationEmail('user1@test.com', '111111');
            const result2 = await sendVerificationEmail('user2@test.com', '222222');
            
            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
        });

        it('should return a Promise', () => {
            const result = sendVerificationEmail('test@example.com', '123456');
            expect(result).toBeInstanceOf(Promise);
        });

        it('should simulate async behavior', async () => {
            const startTime = Date.now();
            await sendVerificationEmail('test@example.com', '123456');
            const endTime = Date.now();
            
            // Should take at least 100ms due to simulated delay
            expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow small margin
        });

        it('should include recipient email in template', async () => {
            const email = 'specific@example.com';
            await sendVerificationEmail(email, '123456');
            
            const loggedContent = consoleLogSpy.mock.calls.flat().join('\n');
            expect(loggedContent).toContain(email);
        });

        it('should include expiration time in template', async () => {
            await sendVerificationEmail('test@example.com', '123456');
            
            const loggedContent = consoleLogSpy.mock.calls.flat().join('\n');
            expect(loggedContent).toContain('15 minutes');
        });

        it('should include resend instructions in template', async () => {
            await sendVerificationEmail('test@example.com', '123456');
            
            const loggedContent = consoleLogSpy.mock.calls.flat().join('\n');
            expect(loggedContent).toContain('Resend Code');
        });
    });
});
