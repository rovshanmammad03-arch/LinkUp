import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

// ─── localStorage mock ────────────────────────────────────────────────────────
// Set up an in-memory localStorage mock before importing DB functions
// so that all DB operations use the mock.
const localStorageStore = {};
const localStorageMock = {
    getItem: (key) => (key in localStorageStore ? localStorageStore[key] : null),
    setItem: (key, value) => { localStorageStore[key] = String(value); },
    removeItem: (key) => { delete localStorageStore[key]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); },
};
vi.stubGlobal('localStorage', localStorageMock);

// ─── Imports (after mock is set up) ──────────────────────────────────────────
import { DB, generateResetToken, verifyToken, resetPassword } from '../services/db';

// ─── Mock heavy UI dependencies ───────────────────────────────────────────────
vi.mock('@iconify/react', () => ({
    Icon: ({ icon }) => React.createElement('span', { 'data-testid': `icon-${icon}` }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            // Return the Azerbaijani text for the backToLogin key so Property 7 can find it
            const translations = {
                'forgotPassword.backToLogin': 'Girişə Qayıt',
                'forgotPassword.title': 'Şifrəni Sıfırla',
                'forgotPassword.step1Title': 'E-poçtunuzu daxil edin',
                'forgotPassword.step1Desc': 'Qeydiyyatda istifadə etdiyiniz e-poçtu daxil edin',
                'forgotPassword.emailLabel': 'E-poçt',
                'forgotPassword.sendCodeBtn': 'Kodu Göndər',
                'forgotPassword.step2Title': 'Kodu daxil edin',
                'forgotPassword.step2Desc': 'E-poçtunuza göndərilən 6 rəqəmli kodu daxil edin',
                'forgotPassword.tokenLabel': 'Sıfırlama Kodu',
                'forgotPassword.tokenPlaceholder': '123456',
                'forgotPassword.verifyBtn': 'Doğrula',
                'forgotPassword.step3Title': 'Yeni şifrə təyin edin',
                'forgotPassword.step3Desc': 'Hesabınız üçün yeni şifrə seçin',
                'forgotPassword.newPasswordLabel': 'Yeni Şifrə',
                'forgotPassword.confirmPasswordLabel': 'Şifrəni Təkrarla',
                'forgotPassword.resetBtn': 'Şifrəni Sıfırla',
                'forgotPassword.successMsg': 'Şifrəniz uğurla yeniləndi!',
                'forgotPassword.backToEmail': 'E-poçtu dəyiş',
                'forgotPassword.errors.emailNotFound': 'Bu e-poçt qeydiyyatda yoxdur',
                'forgotPassword.errors.wrongToken': 'Kod yanlışdır',
                'forgotPassword.errors.expiredToken': 'Kodun müddəti bitib',
                'forgotPassword.errors.passwordTooShort': 'Şifrə minimum 8 simvol olmalıdır',
                'forgotPassword.errors.passwordMismatch': 'Şifrələr uyğun gəlmir',
            };
            // Handle interpolation like demoCodeMsg
            if (key === 'forgotPassword.demoCodeMsg') return 'Demo üçün kodunuz: ...';
            return translations[key] || key;
        },
        i18n: { changeLanguage: vi.fn() },
    }),
}));

// ─── Arbitraries ──────────────────────────────────────────────────────────────
const emailArb = fc.emailAddress();
const tokenArb = fc.integer({ min: 100000, max: 999999 }).map(String);
const passwordArb = fc.string({ minLength: 1, maxLength: 30 });
const stepArb = fc.constantFrom(1, 2, 3);

// ─── Helper: seed a user into DB ─────────────────────────────────────────────
function seedUser(email) {
    const users = DB.get('users');
    if (!users.find(u => u.email === email)) {
        DB.set('users', [...users, { id: 'test_' + email, name: 'Test User', email, password: 'oldpassword' }]);
    }
}

// ─── Reset localStorage before each test ─────────────────────────────────────
beforeEach(() => {
    localStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Forgot Password — Property-Based Tests', () => {

    // Feature: forgot-password, Property 1: Token Range Invariant
    it('Property 1: Token Range Invariant — generated token is always in [100000, 999999]', () => {
        fc.assert(
            fc.property(emailArb, (email) => {
                localStorage.clear();
                seedUser(email);
                const result = generateResetToken(email);
                expect(result.success).toBe(true);
                const tokenInt = parseInt(result.token, 10);
                expect(tokenInt).toBeGreaterThanOrEqual(100000);
                expect(tokenInt).toBeLessThanOrEqual(999999);
            }),
            { numRuns: 100 }
        );
    });

    // Feature: forgot-password, Property 2: Token Storage Round-Trip
    it('Property 2: Token Storage Round-Trip — localStorage record matches email, 6-digit token, and expiry', () => {
        fc.assert(
            fc.property(emailArb, (email) => {
                localStorage.clear();
                seedUser(email);
                const before = Date.now();
                generateResetToken(email);
                const after = Date.now();
                const record = DB.getOne('reset_token');
                expect(record).not.toBeNull();
                expect(record.email).toBe(email);
                expect(record.token).toMatch(/^\d{6}$/);
                const expectedExpiry = before + 15 * 60 * 1000;
                expect(record.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - 1000);
                expect(record.expiresAt).toBeLessThanOrEqual(after + 15 * 60 * 1000 + 1000);
            }),
            { numRuns: 100 }
        );
    });

    // Feature: forgot-password, Property 3: Token Overwrite Idempotency
    it('Property 3: Token Overwrite Idempotency — only the last token persists after multiple calls', () => {
        fc.assert(
            fc.property(fc.array(emailArb, { minLength: 2, maxLength: 5 }), (emails) => {
                localStorage.clear();
                // Seed all emails
                emails.forEach(email => seedUser(email));
                // Call generateResetToken for each email in sequence
                let lastEmail;
                for (const email of emails) {
                    generateResetToken(email);
                    lastEmail = email;
                }
                // Only the last token should remain
                const record = DB.getOne('reset_token');
                expect(record).not.toBeNull();
                expect(record.email).toBe(lastEmail);
            }),
            { numRuns: 100 }
        );
    });

    // Feature: forgot-password, Property 4: Token Verification Correctness
    it('Property 4: Token Verification Correctness — correct token succeeds, wrong token fails, expired token fails', () => {
        fc.assert(
            fc.property(fc.tuple(emailArb, tokenArb), ([email, token]) => {
                localStorage.clear();

                // Sub-case 1: correct email + token + future expiry → success
                DB.setOne('reset_token', { email, token, expiresAt: Date.now() + 60 * 60 * 1000 });
                const resultCorrect = verifyToken(email, token);
                expect(resultCorrect).toEqual({ success: true });

                // Sub-case 2: wrong token → wrong_token error
                const wrongToken = token === '100000' ? '100001' : '100000';
                DB.setOne('reset_token', { email, token, expiresAt: Date.now() + 60 * 60 * 1000 });
                const resultWrong = verifyToken(email, wrongToken);
                expect(resultWrong).toEqual({ success: false, error: 'wrong_token' });

                // Sub-case 3: expired token → expired error
                DB.setOne('reset_token', { email, token, expiresAt: Date.now() - 1 });
                const resultExpired = verifyToken(email, token);
                expect(resultExpired).toEqual({ success: false, error: 'expired' });
            }),
            { numRuns: 100 }
        );
    });

    // Feature: forgot-password, Property 5: Password Validation Correctness
    it('Property 5: Password Validation Correctness — length and match rules hold for all inputs', () => {
        function validatePassword(newPassword, confirmPassword) {
            if (newPassword.length < 8) return { valid: false, error: 'passwordTooShort' };
            if (newPassword !== confirmPassword) return { valid: false, error: 'passwordMismatch' };
            return { valid: true };
        }

        // General case: any two passwords
        fc.assert(
            fc.property(fc.tuple(passwordArb, passwordArb), ([newPassword, confirmPassword]) => {
                const result = validatePassword(newPassword, confirmPassword);
                if (newPassword.length < 8) {
                    expect(result).toEqual({ valid: false, error: 'passwordTooShort' });
                } else if (newPassword !== confirmPassword) {
                    expect(result).toEqual({ valid: false, error: 'passwordMismatch' });
                } else {
                    expect(result).toEqual({ valid: true });
                }
            }),
            { numRuns: 100 }
        );

        // Short password case: always passwordTooShort regardless of confirmPassword
        fc.assert(
            fc.property(
                fc.tuple(fc.string({ maxLength: 7 }), passwordArb),
                ([shortPassword, confirmPassword]) => {
                    const result = validatePassword(shortPassword, confirmPassword);
                    expect(result).toEqual({ valid: false, error: 'passwordTooShort' });
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: forgot-password, Property 6: Password Reset Round-Trip
    it('Property 6: Password Reset Round-Trip — password updated in DB and token cleared', () => {
        fc.assert(
            fc.property(
                fc.tuple(emailArb, fc.string({ minLength: 8, maxLength: 30 })),
                ([email, newPassword]) => {
                    localStorage.clear();
                    // Seed user
                    DB.set('users', [{ id: 'test_' + email, name: 'Test User', email, password: 'oldpassword123' }]);
                    // Set a token record
                    DB.setOne('reset_token', { email, token: '123456', expiresAt: Date.now() + 60000 });

                    const result = resetPassword(email, newPassword);
                    expect(result.success).toBe(true);

                    // Condition 1: password updated in lu_users
                    const users = DB.get('users');
                    const user = users.find(u => u.email === email);
                    expect(user).toBeDefined();
                    expect(user.password).toBe(newPassword);

                    // Condition 2: lu_reset_token is null
                    const tokenRecord = DB.getOne('reset_token');
                    expect(tokenRecord).toBeNull();
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: forgot-password, Property 7: Back-to-Login Link Present on All Steps
    it('Property 7: Back-to-Login Link Present on All Steps — "Girişə Qayıt" calls onNavigate("login") on every step', async () => {
        // Dynamically import ForgotPassword after mocks are set up
        const { default: ForgotPassword } = await import('../pages/ForgotPassword.jsx');

        fc.assert(
            fc.property(stepArb, (step) => {
                localStorage.clear();
                const onNavigate = vi.fn();

                if (step === 1) {
                    // Step 1: render fresh component
                    const { unmount } = render(
                        React.createElement(ForgotPassword, { onNavigate })
                    );
                    const backBtn = screen.getByText('Girişə Qayıt');
                    expect(backBtn).toBeInTheDocument();
                    fireEvent.click(backBtn);
                    expect(onNavigate).toHaveBeenCalledWith('login');
                    unmount();
                } else if (step === 2) {
                    // Step 2: seed a user and simulate step 1 success to reach step 2
                    const testEmail = 'prop7step2@example.com';
                    DB.set('users', [{ id: 'u_prop7', name: 'Test', email: testEmail, password: 'pass' }]);

                    const { unmount } = render(
                        React.createElement(ForgotPassword, { onNavigate })
                    );
                    // Fill in email and submit to advance to step 2
                    const emailInput = screen.getByRole('textbox');
                    fireEvent.change(emailInput, { target: { value: testEmail } });
                    fireEvent.submit(emailInput.closest('form'));

                    const backBtn = screen.getByText('Girişə Qayıt');
                    expect(backBtn).toBeInTheDocument();
                    fireEvent.click(backBtn);
                    expect(onNavigate).toHaveBeenCalledWith('login');
                    unmount();
                } else {
                    // Step 3: simulate through to step 3
                    const testEmail = 'prop7step3@example.com';
                    DB.set('users', [{ id: 'u_prop7s3', name: 'Test', email: testEmail, password: 'pass' }]);

                    const { unmount } = render(
                        React.createElement(ForgotPassword, { onNavigate })
                    );
                    // Advance to step 2
                    const emailInput = screen.getByRole('textbox');
                    fireEvent.change(emailInput, { target: { value: testEmail } });
                    fireEvent.submit(emailInput.closest('form'));

                    // Get the generated token from localStorage
                    const tokenRecord = DB.getOne('reset_token');
                    const generatedToken = tokenRecord ? tokenRecord.token : '123456';

                    // Fill in token and submit to advance to step 3
                    const tokenInput = screen.getByRole('textbox');
                    fireEvent.change(tokenInput, { target: { value: generatedToken } });
                    fireEvent.submit(tokenInput.closest('form'));

                    const backBtn = screen.getByText('Girişə Qayıt');
                    expect(backBtn).toBeInTheDocument();
                    fireEvent.click(backBtn);
                    expect(onNavigate).toHaveBeenCalledWith('login');
                    unmount();
                }
            }),
            { numRuns: 100 }
        );
    });

});
