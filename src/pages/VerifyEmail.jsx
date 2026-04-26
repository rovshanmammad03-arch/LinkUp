import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { verifyCode, getRemainingAttempts, resendCode, isCodeExpired } from '../services/verification';
import { activateUser } from '../services/db';
import { sendVerificationEmail } from '../services/emailService';
import { useAuth } from '../context/AuthContext';

/**
 * VerifyEmail page component
 * Handles email verification code input, countdown timer, resend functionality
 *
 * Props:
 *   email {string}       - Email address to verify
 *   onVerified {Function} - Callback when verification succeeds
 *   onNavigate {Function} - Navigation handler
 */
export default function VerifyEmail({ email, onVerified, onNavigate }) {
    const { t } = useTranslation();
    const { setCurrentUser } = useAuth();

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);

    const timerRef = useRef(null);
    const cooldownRef = useRef(null);

    // ── Helpers ──────────────────────────────────────────────────────────────

    function getStoredData() {
        try {
            return JSON.parse(localStorage.getItem(`lu_verification_${email}`));
        } catch {
            return null;
        }
    }

    function formatTime(seconds) {
        if (seconds <= 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // ── Initialise timers on mount / when email changes ───────────────────────

    useEffect(() => {
        if (!email) return;

        syncState();

        // Countdown tick every second
        timerRef.current = setInterval(() => {
            const data = getStoredData();
            if (!data) {
                setTimeRemaining(0);
                setCanResend(true);
                return;
            }

            const remaining = Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000));
            setTimeRemaining(remaining);

            if (remaining === 0) {
                setCanResend(true);
            }

            // Resend cooldown
            const cooldownLeft = Math.max(0, Math.ceil((data.lastResendAt + 60000 - Date.now()) / 1000));
            setResendCooldown(cooldownLeft);
            setCanResend(cooldownLeft === 0);
        }, 1000);

        return () => {
            clearInterval(timerRef.current);
            clearInterval(cooldownRef.current);
        };
    }, [email]);

    function syncState() {
        const data = getStoredData();
        if (!data) {
            setTimeRemaining(0);
            setCanResend(true);
            setAttemptsRemaining(0);
            return;
        }

        const remaining = Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000));
        setTimeRemaining(remaining);

        const cooldownLeft = Math.max(0, Math.ceil((data.lastResendAt + 60000 - Date.now()) / 1000));
        setResendCooldown(cooldownLeft);
        setCanResend(cooldownLeft === 0);

        const maxAttempts = 5;
        setAttemptsRemaining(Math.max(0, maxAttempts - (data.attempts || 0)));
    }

    // ── Submit handler ────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            setError(t('verification.errors.invalidCode'));
            return;
        }

        setLoading(true);

        const result = verifyCode(email, code);

        if (result.success) {
            // Activate user account and create session
            const activation = activateUser(email);
            if (activation.success) {
                setCurrentUser(activation.user);
                if (onVerified) onVerified();
            } else {
                setError(t('verification.errors.sendFailed'));
            }
        } else {
            switch (result.error) {
                case 'expired':
                    setError(t('verification.errors.expired'));
                    setCanResend(true);
                    break;
                case 'too_many_attempts':
                    setError(t('verification.errors.tooManyAttempts'));
                    setCanResend(true);
                    break;
                case 'wrong_code': {
                    const remaining = getRemainingAttempts(email);
                    setAttemptsRemaining(remaining);
                    setError(t('verification.errors.wrongCode', { count: remaining }));
                    break;
                }
                default:
                    setError(t('verification.errors.invalidCode'));
            }
        }

        setLoading(false);
    };

    // ── Resend handler ────────────────────────────────────────────────────────

    const handleResend = async () => {
        setError('');
        setSuccessMsg('');

        const result = resendCode(email);

        if (result.success) {
            // Simulate sending the new code via email
            await sendVerificationEmail(email, result.code);
            setSuccessMsg(t('verification.codeSent'));
            setCode('');
            syncState();
        } else if (result.error === 'cooldown_active') {
            const data = getStoredData();
            const cooldownLeft = data
                ? Math.ceil((data.lastResendAt + 60000 - Date.now()) / 1000)
                : 60;
            setError(t('verification.errors.cooldownActive', { seconds: cooldownLeft }));
        } else {
            setError(t('verification.errors.sendFailed'));
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const isExpired = timeRemaining === 0 && !canResend === false;
    const tooManyAttempts = attemptsRemaining === 0;

    return (
        <div className="max-w-md mx-auto px-6 py-12 anim-up">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-500/20">
                    <Icon icon="mdi:email-check-outline" className="text-white text-3xl" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('verification.pageTitle')}</h1>
                <p className="text-neutral-400 text-sm">
                    {t('verification.pageDesc')}{' '}
                    <span className="text-brand-400 font-medium">{email}</span>
                </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2" role="alert" aria-live="polite">
                            <Icon icon="mdi:alert-circle-outline" aria-hidden="true" /> {error}
                        </div>
                    )}

                    {/* Success message */}
                    {successMsg && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-3 rounded-lg flex items-center gap-2" role="status" aria-live="polite">
                            <Icon icon="mdi:check-circle-outline" aria-hidden="true" /> {successMsg}
                        </div>
                    )}

                    {/* Code input */}
                    <div>
                        <label htmlFor="verification-code" className="text-xs text-neutral-400 mb-1.5 block">
                            {t('verification.codeLabel')}
                        </label>
                        <input
                            id="verification-code"
                            type="text"
                            inputMode="numeric"
                            pattern="\d{6}"
                            maxLength={6}
                            className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                            placeholder="••••••"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            disabled={loading || tooManyAttempts}
                            autoComplete="one-time-code"
                            aria-label={t('verification.codeLabel')}
                            aria-describedby="attempts-info timer-info"
                            required
                        />
                    </div>

                    {/* Timer */}
                    <div id="timer-info" className="flex items-center justify-between text-xs text-neutral-500" aria-live="polite">
                        <span className="flex items-center gap-1">
                            <Icon icon="mdi:clock-outline" aria-hidden="true" />
                            {timeRemaining > 0
                                ? t('verification.timeRemaining', { time: formatTime(timeRemaining) })
                                : t('verification.expired')}
                        </span>

                        {/* Attempts remaining */}
                        {attemptsRemaining > 0 && (
                            <span id="attempts-info" className="text-neutral-500">
                                {t('verification.attemptsRemaining', { count: attemptsRemaining })}
                            </span>
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || tooManyAttempts || code.length !== 6}
                        aria-busy={loading}
                    >
                        {loading ? (
                            <>
                                <Icon icon="mdi:loading" className="animate-spin" aria-hidden="true" />
                                {t('verification.verifying')}
                            </>
                        ) : (
                            <>
                                {t('verification.verifyBtn')}
                                <Icon icon="mdi:arrow-right" aria-hidden="true" />
                            </>
                        )}
                    </button>

                    {/* Resend button */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!canResend}
                            className="text-sm text-brand-400 hover:text-brand-300 transition-colors disabled:text-neutral-600 disabled:cursor-not-allowed"
                            aria-label={canResend ? t('verification.resendBtn') : t('verification.resendCooldown', { seconds: resendCooldown })}
                        >
                            {canResend
                                ? t('verification.resendBtn')
                                : t('verification.resendCooldown', { seconds: resendCooldown })}
                        </button>
                    </div>
                </form>
            </div>

            {/* Back to login */}
            <button
                onClick={() => onNavigate('login')}
                className="mt-8 text-neutral-500 hover:text-neutral-300 transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
            >
                <Icon icon="mdi:chevron-left" aria-hidden="true" /> {t('auth.backHome')}
            </button>
        </div>
    );
}
