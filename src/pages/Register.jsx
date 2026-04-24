import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from '@iconify/react';
import { DB, uid, GRADIENTS, hashPassword } from '../services/db';
import { useTranslation } from 'react-i18next';

export default function Register({ onNavigate, onRegisterDone }) {
    const { setCurrentUser } = useAuth();
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [university, setUniversity] = useState('');
    const [field, setField] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const users = DB.get('users');
        if (users.find(u => u.email === email)) {
            setError(t('auth.emailExists'));
            return;
        }

        const newUser = {
            id: uid(),
            email,
            password: hashPassword(password),
            name: `${name} ${surname}`,
            university: university.trim() || '',
            field: field.trim() || t('auth.fields.other'),
            level: 'Başlanğıc',
            bio: '',
            skills: [],
            links: [],
            avatar: '',
            views: 0,
            onboardingDone: false,
            followers: [],
            following: [],
            grad: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
            createdAt: Date.now()
        };

        users.push(newUser);
        DB.set('users', users);
        DB.setOne('session', { userId: newUser.id });
        setCurrentUser(newUser);
        if (onRegisterDone) {
            onRegisterDone();
        } else {
            onNavigate('dashboard');
        }
    };

    return (
        <div className="max-w-md mx-auto px-6 py-12 anim-up">
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-500/20">
                    <Icon icon="mdi:link-variant" className="text-white text-3xl" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('auth.joinPlatform')}</h1>
                <p className="text-neutral-400 text-sm">{t('auth.joinPlatformDesc')}</p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                            <Icon icon="mdi:alert-circle-outline" /> {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-neutral-400 mb-1 block">{t('auth.name')}</label>
                            <input type="text" className="input-field" placeholder={t('auth.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-400 mb-1 block">{t('auth.surname')}</label>
                            <input type="text" className="input-field" placeholder={t('auth.surnamePlaceholder')} value={surname} onChange={(e) => setSurname(e.target.value)} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-neutral-400 mb-1 block">{t('auth.email')}</label>
                        <input type="email" className="input-field" placeholder={t('auth.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs text-neutral-400 mb-1 block">{t('auth.password')}</label>
                        <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-neutral-400 mb-1 block">
                                {t('auth.university')}
                                <span className="ml-1 text-neutral-600">({t('auth.optional')})</span>
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder={t('auth.universityPlaceholder')}
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-400 mb-1 block">{t('auth.field')}</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder={t('auth.fieldPlaceholder')}
                                value={field}
                                onChange={(e) => setField(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 mt-4 text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30">
                        {t('auth.registerBtn')} <Icon icon="mdi:chevron-right" />
                    </button>
                </form>
                
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-sm text-neutral-500">
                        {t('auth.hasAccount')}{' '}
                        <button onClick={() => onNavigate('login')} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                            {t('auth.signIn')}
                        </button>
                    </p>
                </div>
            </div>
            
            <button onClick={() => onNavigate('landing')} className="mt-8 text-neutral-500 hover:text-neutral-300 transition-colors text-sm flex items-center justify-center gap-2 mx-auto">
                <Icon icon="mdi:chevron-left" /> {t('auth.backHome')}
            </button>
        </div>
    );
}
