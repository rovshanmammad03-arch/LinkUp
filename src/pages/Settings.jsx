import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { DB, hashPassword } from '../services/db';

const LANGUAGES = [
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function Settings({ onNavigate }) {
  const { t, i18n } = useTranslation();
  const { currentUser, logout, refreshUser } = useAuth();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [deleteStep, setDeleteStep] = useState(0); // 0=none, 1=confirm, 2=password
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleEmailChange = (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (currentUser.password !== hashPassword(emailPassword)) {
      setEmailError(t('settingsPage.pwdError'));
      return;
    }

    const users = DB.get('users');
    const emailExists = users.some(u => u.email === newEmail && u.id !== currentUser.id);
    if (emailExists) {
      setEmailError(t('settingsPage.emailExists'));
      return;
    }

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].email = newEmail;
      DB.set('users', users);
      refreshUser();
      setEmailSuccess(t('settingsPage.emailSuccess'));
      setNewEmail('');
      setEmailPassword('');
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword !== confirmPassword) {
      setPwdError(t('settingsPage.pwdMismatch'));
      return;
    }

    const users = DB.get('users');
    const user = users.find(u => u.id === currentUser.id);
    
    if (user.password !== hashPassword(oldPassword)) {
      setPwdError(t('settingsPage.pwdError'));
      return;
    }

    user.password = hashPassword(newPassword);
    DB.set('users', users);
    
    setPwdSuccess(t('settingsPage.pwdSuccess'));
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    setDeleteError('');
    if (currentUser.password !== hashPassword(deletePassword)) {
      setDeleteError(t('settingsPage.pwdError'));
      return;
    }
    const users = DB.get('users').filter(u => u.id !== currentUser.id);
    DB.set('users', users);
    logout();
    onNavigate('landing');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNavigate('dashboard')} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-neutral-500">
          <Icon icon="mdi:arrow-left" className="text-xl" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
          {t('settingsPage.title')}
        </h1>
      </div>

      <div className="max-w-xl mx-auto space-y-8 pb-12">
          
          {/* Language */}
          <div className="glass-card p-6 border border-black/5 dark:border-white/5">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Icon icon="mdi:translate" className="text-brand-500" />
              {t('settingsPage.language')}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    i18n.language === lang.code 
                      ? 'border-brand-500 bg-brand-500/5 text-brand-600 dark:text-brand-400' 
                      : 'border-black/10 dark:border-white/10 hover:border-brand-500/30 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                  {i18n.language === lang.code && (
                    <Icon icon="mdi:check-circle" className="ml-auto text-brand-500 text-lg" />
                  )}
                </button>
              ))}
            </div>
          </div>



          {/* Email */}
          <div className="glass-card p-6 border border-black/5 dark:border-white/5">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Icon icon="mdi:email-outline" className="text-brand-500" />
              {t('settingsPage.emailTitle')}
            </h2>
            <form onSubmit={handleEmailChange} className="space-y-4">
              {emailError && (
                <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                  <Icon icon="mdi:alert-circle" /> {emailError}
                </div>
              )}
              {emailSuccess && (
                <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 text-sm rounded-lg flex items-center gap-2">
                  <Icon icon="mdi:check-circle" /> {emailSuccess}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('settingsPage.currentEmail')}</label>
                <input 
                  type="email" 
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-xl px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 cursor-not-allowed outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('settingsPage.newEmail')}</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-900 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white transition-all outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('settingsPage.emailPassword')}</label>
                <input 
                  type="password" 
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-900 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white transition-all outline-none"
                  required
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  {t('settingsPage.changeEmailBtn')}
                </button>
              </div>
            </form>
          </div>

          {/* Password */}
          <div id="password-section" className="glass-card p-6 border border-black/5 dark:border-white/5">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Icon icon="mdi:lock-outline" className="text-brand-500" />
              {t('settingsPage.password')}
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {pwdError && (
                <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                  <Icon icon="mdi:alert-circle" /> {pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 text-sm rounded-lg flex items-center gap-2">
                  <Icon icon="mdi:check-circle" /> {pwdSuccess}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('settingsPage.oldPassword')}</label>
                <input 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-900 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white transition-all outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('settingsPage.newPassword')}</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-900 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white transition-all outline-none"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('settingsPage.confirmPassword')}</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-900 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white transition-all outline-none"
                  required
                  minLength={8}
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  {t('settingsPage.changePasswordBtn')}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div id="danger-section" className="glass-card p-6 border border-red-500/20 bg-red-500/5">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
              <Icon icon="mdi:alert-circle-outline" />
              {t('settingsPage.dangerZone')}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {t('settingsPage.deleteAccountDesc')}
            </p>
            <button 
              onClick={() => setDeleteStep(1)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              {t('settingsPage.deleteAccountBtn')}
            </button>
          </div>

      </div>

      {deleteStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl anim-scale-in p-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <Icon icon="mdi:alert" className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-center text-neutral-900 dark:text-white mb-2">
              {t('settingsPage.deleteConfirmTitle')}
            </h3>
            <p className="text-center text-neutral-600 dark:text-neutral-400 mb-6 text-sm">
              {t('settingsPage.deleteConfirmDesc')}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteStep(0)}
                className="flex-1 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {t('post.cancel')}
              </button>
              <button 
                onClick={() => setDeleteStep(2)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                {t('settingsPage.continueBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl anim-scale-in">
            <form onSubmit={handleDeleteAccount} className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 mx-auto">
                <Icon icon="mdi:lock-alert-outline" className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-center text-neutral-900 dark:text-white mb-2">
                Şifrənizi təsdiqləyin
              </h3>
              <p className="text-center text-neutral-600 dark:text-neutral-400 mb-6 text-sm">
                Hesabınızı həmişəlik silmək üçün zəhmət olmasa cari şifrənizi daxil edin.
              </p>
              
              {deleteError && (
                <div className="mb-4 p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                  <Icon icon="mdi:alert-circle" /> {deleteError}
                </div>
              )}
              
              <div className="mb-6">
                <input 
                  type="password" 
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder={t('settingsPage.oldPassword')}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-neutral-900 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white transition-all outline-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setDeleteStep(0); setDeletePassword(''); setDeleteError(''); }}
                  className="flex-1 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {t('post.cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                >
                  {t('post.confirmDelete')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
