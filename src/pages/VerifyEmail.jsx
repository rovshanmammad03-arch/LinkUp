import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

export default function VerifyEmail({ email, onVerified, onNavigate }) {
    const { t } = useTranslation();
    const { setCurrentUser } = useAuth();

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const timerRef = useRef(null);

    useEffect(() => {
        if (!email) return;

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [email]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            setError(t('verification.errors.invalidCode') || 'Yalnış kod. 6 rəqəmli kodu daxil edin.');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'signup'
        });

        if (error) {
            setError(error.message);
        } else {
            setCurrentUser(data.session?.user ?? null);
            if (onVerified) onVerified();
            else onNavigate('dashboard');
        }

        setLoading(false);
    };

    const handleResend = async () => {
        setError('');
        setSuccessMsg('');
        setLoading(true);

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccessMsg(t('verification.codeSent') || 'Yeni kod göndərildi!');
            setCode('');
            setCanResend(false);
            setTimeRemaining(60);
            
            clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto px-6 py-12 anim-up">
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-500/20">
                    <Icon icon="mdi:email-check-outline" className="text-white text-3xl" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('verification.pageTitle') || 'Emaili təsdiqləyin'}</h1>
                <p className="text-neutral-400 text-sm">
                    {t('verification.pageDesc') || 'Təsdiq kodu bu ünvana göndərildi:'}{' '}
                    <span className="text-brand-400 font-medium">{email}</span>
                </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                            <Icon icon="mdi:alert-circle-outline" /> {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-3 rounded-lg flex items-center gap-2">
                            <Icon icon="mdi:check-circle-outline" /> {successMsg}
                        </div>
                    )}

                    <div>
                        <label htmlFor="verification-code" className="text-xs text-neutral-400 mb-1.5 block">
                            {t('verification.codeLabel') || '6-rəqəmli Kod'}
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
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                            <Icon icon="mdi:clock-outline" />
                            {timeRemaining > 0
                                ? formatTime(timeRemaining)
                                : (t('verification.expired') || 'Vaxt bitdi')}
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 disabled:opacity-50"
                        disabled={loading || code.length !== 6}
                    >
                        {loading ? (
                            <><Icon icon="mdi:loading" className="animate-spin" /> Yoxlanılır...</>
                        ) : (
                            <>{t('verification.verifyBtn') || 'Təsdiqlə'} <Icon icon="mdi:arrow-right" /></>
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!canResend || loading}
                            className="text-sm text-brand-400 hover:text-brand-300 transition-colors disabled:text-neutral-600"
                        >
                            {canResend
                                ? (t('verification.resendBtn') || 'Yenidən göndər')
                                : `${timeRemaining} saniyə sonra yenidən göndərə bilərsiniz`}
                        </button>
                    </div>
                </form>
            </div>

            <button
                onClick={() => onNavigate('login')}
                className="mt-8 text-neutral-500 hover:text-neutral-300 transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
            >
                <Icon icon="mdi:chevron-left" /> Geri qayıt
            </button>
        </div>
    );
}
