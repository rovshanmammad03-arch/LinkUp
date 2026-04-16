import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import React from 'react';

// ─── localStorage mock ────────────────────────────────────────────────────────
const localStorageStore = {};
const localStorageMock = {
    getItem: (key) => (key in localStorageStore ? localStorageStore[key] : null),
    setItem: (key, value) => { localStorageStore[key] = String(value); },
    removeItem: (key) => { delete localStorageStore[key]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); },
};
vi.stubGlobal('localStorage', localStorageMock);

// ─── Imports (after mock is set up) ──────────────────────────────────────────
import { DB } from '../services/db';

// ─── Mock heavy UI dependencies ───────────────────────────────────────────────
vi.mock('@iconify/react', () => ({
    Icon: ({ icon }) => React.createElement('span', { 'data-testid': `icon-${icon}` }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, opts) => {
            const translations = {
                'forgotPassword.forgotLink': 'Şifrəni unutdum?',
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
                'auth.welcomeBack': 'Yenidən Xoş Gəldin',
                'auth.welcomeBackDesc': 'Sahəndəki insanlarla əlaqəni davam etdir',
                'auth.email': 'E-poçt',
                'auth.emailPlaceholder': 'nümunə@mail.com',
                'auth.password': 'Şifrə',
                'auth.loginBtn': 'Daxil Ol',
                'auth.noAccount': 'Hesabın yoxdur?',
                'auth.signUp': 'Qeydiyyatdan keç',
                'auth.backHome': 'Ana səhifəyə qayıt',
            };
            if (key === 'forgotPassword.demoCodeMsg') {
                return `Demo üçün kodunuz: ${opts && opts.code ? opts.code : '...'}`;
            }
            return translations[key] || key;
        },
        i18n: { changeLanguage: vi.fn() },
    }),
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        login: vi.fn().mockReturnValue({ success: false, message: 'error' }),
    }),
}));

// ─── Lazy imports (after mocks) ───────────────────────────────────────────────
let Login;
let ForgotPassword;

beforeEach(async () => {
    localStorage.clear();
    if (!Login) {
        const loginModule = await import('../pages/Login.jsx');
        Login = loginModule.default;
    }
    if (!ForgotPassword) {
        const fpModule = await import('../pages/ForgotPassword.jsx');
        ForgotPassword = fpModule.default;
    }
});

// ─── Helper: seed a user into DB ─────────────────────────────────────────────
function seedUser(email, password = 'oldpassword123') {
    const users = DB.get('users');
    if (!users.find(u => u.email === email)) {
        DB.set('users', [...users, { id: 'test_' + email, name: 'Test User', email, password }]);
    }
}

// ─── Helper: navigate to step 2 ──────────────────────────────────────────────
function submitEmailForm(email) {
    const emailInput = screen.getByRole('textbox');
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.submit(emailInput.closest('form'));
}

// ─── Helper: navigate to step 3 ──────────────────────────────────────────────
function submitTokenForm(token) {
    const tokenInput = screen.getByRole('textbox');
    fireEvent.change(tokenInput, { target: { value: token } });
    fireEvent.submit(tokenInput.closest('form'));
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Login page — Forgot Password link', () => {

    // Task 7.1 — Req 1.1, 1.2
    it('renders the forgot password link below the password field', () => {
        const onNavigate = vi.fn();
        render(React.createElement(Login, { onNavigate }));
        const link = screen.getByText('Şifrəni unutdum?');
        expect(link).toBeInTheDocument();
    });

    it('calls onNavigate("forgot-password") when the link is clicked', () => {
        const onNavigate = vi.fn();
        render(React.createElement(Login, { onNavigate }));
        const link = screen.getByText('Şifrəni unutdum?');
        fireEvent.click(link);
        expect(onNavigate).toHaveBeenCalledWith('forgot-password');
    });

});

// ─────────────────────────────────────────────────────────────────────────────
describe('ForgotPassword component', () => {

    // Task 7.2 — Req 2.1
    it('renders step 1 email form on initial render', () => {
        render(React.createElement(ForgotPassword, { onNavigate: vi.fn() }));
        const emailInput = screen.getByRole('textbox');
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('type', 'email');
        const sendBtn = screen.getByText('Kodu Göndər');
        expect(sendBtn).toBeInTheDocument();
    });

    // Task 7.3 — Req 2.6
    it('shows emailNotFound error when email is not in DB', () => {
        render(React.createElement(ForgotPassword, { onNavigate: vi.fn() }));
        submitEmailForm('nonexistent@example.com');
        expect(screen.getByText('Bu e-poçt qeydiyyatda yoxdur')).toBeInTheDocument();
    });

    // Task 7.4 — Req 3.4
    it('shows demo code message after successful email submission', () => {
        const email = 'demouser@example.com';
        seedUser(email);
        render(React.createElement(ForgotPassword, { onNavigate: vi.fn() }));
        submitEmailForm(email);
        // The demo code message should contain the key text
        const demoMsg = screen.getByText(/Demo üçün kodunuz:/);
        expect(demoMsg).toBeInTheDocument();
    });

    // Task 7.5 — Req 4.1
    it('renders step 2 token form after successful email submission', () => {
        const email = 'step2user@example.com';
        seedUser(email);
        render(React.createElement(ForgotPassword, { onNavigate: vi.fn() }));
        submitEmailForm(email);
        // Token input should be present
        const tokenInput = screen.getByRole('textbox');
        expect(tokenInput).toBeInTheDocument();
        // Verify button should be present
        const verifyBtn = screen.getByText('Doğrula');
        expect(verifyBtn).toBeInTheDocument();
    });

    // Task 7.6 — Req 4.5
    it('shows wrongToken error when incorrect token is entered', () => {
        const email = 'wrongtoken@example.com';
        seedUser(email);
        render(React.createElement(ForgotPassword, { onNavigate: vi.fn() }));
        submitEmailForm(email);
        // Enter a wrong token (not the generated one)
        submitTokenForm('000000');
        expect(screen.getByText('Kod yanlışdır')).toBeInTheDocument();
    });

    // Task 7.7 — Req 4.6
    it('shows expiredToken error when token has expired', () => {
        const email = 'expiredtoken@example.com';
        seedUser(email);
        render(React.createElement(ForgotPassword, { onNavigate: vi.fn() }));
        submitEmailForm(email);
        // Manually overwrite the token record with a past expiresAt
        DB.setOne('reset_token', { email, token: '123456', expiresAt: Date.now() - 1000 });
        submitTokenForm('123456');
        expect(screen.getByText('Kodun müddəti bitib')).toBeInTheDocument();
    });

    // Task 7.8 — Req 4.7
    it('advances to step 3 after successful token verification', () => {
        const email = 'step3user@example.com';
        seedUser(email);
        render(React.createElement(ForgotPassword, { onNavigate: vi.fn() }));
        submitEmailForm(email);
        // Get the generated token from localStorage
        const record = DB.getOne('reset_token');
        const generatedToken = record ? record.token : '123456';
        submitTokenForm(generatedToken);
        // Step 3 elements should be present
        expect(screen.getByText('Yeni Şifrə')).toBeInTheDocument();
        expect(screen.getByText('Şifrəni Təkrarla')).toBeInTheDocument();
    });

    // Task 7.9 — Req 4.8
    it('returns to step 1 when "E-poçtu dəyiş" back button is clicked', () => {
        const email = 'backtoemail@example.com';
        seedUser(email);
        render(React.createElement(ForgotPassword, { onNavigate: vi.fn() }));
        submitEmailForm(email);
        // Click the back to email button
        const backBtn = screen.getByText('E-poçtu dəyiş');
        fireEvent.click(backBtn);
        // Step 1 email form should be shown again
        const emailInput = screen.getByRole('textbox');
        expect(emailInput).toHaveAttribute('type', 'email');
        expect(screen.getByText('Kodu Göndər')).toBeInTheDocument();
    });

    // Task 7.10 — Req 5.1
    it('renders step 3 new password form', () => {
        const email = 'step3render@example.com';
        seedUser(email);
        render(React.createElement(ForgotPassword, { onNavigate: vi.fn() }));
        submitEmailForm(email);
        const record = DB.getOne('reset_token');
        const generatedToken = record ? record.token : '123456';
        submitTokenForm(generatedToken);
        // Both password inputs should be present
        const passwordInputs = screen.getAllByDisplayValue('');
        const passwordFields = passwordInputs.filter(el => el.getAttribute('type') === 'password');
        expect(passwordFields.length).toBeGreaterThanOrEqual(2);
    });

    // Task 7.11 — Req 5.7
    it('shows success message and calls onNavigate("login") after successful reset', async () => {
        vi.useFakeTimers();
        const onNavigate = vi.fn();
        const email = 'successreset@example.com';
        seedUser(email);
        render(React.createElement(ForgotPassword, { onNavigate }));
        submitEmailForm(email);
        const record = DB.getOne('reset_token');
        const generatedToken = record ? record.token : '123456';
        submitTokenForm(generatedToken);

        // Fill in new password and confirm password
        const passwordInputs = screen.getAllByDisplayValue('');
        const passwordFields = passwordInputs.filter(el => el.getAttribute('type') === 'password');
        fireEvent.change(passwordFields[0], { target: { value: 'newpassword123' } });
        fireEvent.change(passwordFields[1], { target: { value: 'newpassword123' } });
        fireEvent.submit(passwordFields[0].closest('form'));

        // Success message should be shown
        expect(screen.getByText('Şifrəniz uğurla yeniləndi!')).toBeInTheDocument();

        // Advance timers by 2000ms
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(onNavigate).toHaveBeenCalledWith('login');
        vi.useRealTimers();
    });

});
