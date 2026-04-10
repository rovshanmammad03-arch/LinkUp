import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '@iconify/react';
import { initials } from '../../services/db';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function Navbar({ onNavigate, currentRoute, canGoBack, onBack }) {
  const { currentUser, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const settingsRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
    setNotifOpen(false);
    setLangOpen(false);
  };

  const toggleNotif = () => {
    setNotifOpen(!notifOpen);
    setSettingsOpen(false);
    setLangOpen(false);
  };

  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  if (!currentUser) {
    return (
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 h-16">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div onClick={() => onNavigate('landing')} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <Icon icon="mdi:link-variant" className="text-white text-lg" />
            </div>
            <span className="font-semibold text-base">LinkUp</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link">{t('nav.features')}</button>
            <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link">{t('nav.howItWorks')}</button>
          </div>
          <div className="flex items-center gap-3">
            {/* Language picker for landing */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
              >
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline text-xs font-semibold">{currentLang.code.toUpperCase()}</span>
                <Icon icon="mdi:chevron-down" className={`text-sm transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-44 bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangChange(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${i18n.language === lang.code ? 'text-white bg-white/10' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span className="font-medium">{lang.label}</span>
                        {i18n.language === lang.code && <Icon icon="mdi:check" className="ml-auto text-brand-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={() => onNavigate('login')} className="btn-outline btn-sm hidden sm:inline-flex">{t('nav.login')}</button>
            <button onClick={() => onNavigate('register')} className="btn-primary btn-sm">{t('nav.register')}</button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 h-16">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3 h-full">
          {canGoBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all anim-up"
            >
              <Icon icon="mdi:arrow-left" className="text-xl" />
            </button>
          )}
          <div onClick={() => onNavigate('dashboard', {}, true)} className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <Icon icon="mdi:link-variant" className="text-white text-lg" />
            </div>
            <span className="font-semibold text-base hidden sm:inline">LinkUp</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <button onClick={() => onNavigate('dashboard', {}, true)} className={`nav-link ${currentRoute === 'dashboard' ? 'active' : ''}`}>
            <Icon icon="mdi:view-dashboard" className="mr-1.5 text-lg" /> {t('nav.dashboard')}
          </button>
          <button onClick={() => onNavigate('discover', {}, true)} className={`nav-link ${currentRoute === 'discover' ? 'active' : ''}`}>
            <Icon icon="mdi:compass-outline" className="mr-1.5 text-lg" /> {t('nav.discover')}
          </button>
          <button onClick={() => onNavigate('new-post', {}, true)} className="nav-link">
            <Icon icon="mdi:plus-circle-outline" className="mr-1.5 text-lg" /> {t('nav.share')}
          </button>
          <button onClick={() => onNavigate('messages', {}, true)} className={`nav-link relative ${currentRoute === 'messages' ? 'active' : ''}`}>
            <Icon icon="mdi:message-outline" className="mr-1.5 text-lg" /> {t('nav.messages')}
            <span className="notif-dot hidden"></span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={toggleNotif} className="text-neutral-500 hover:text-white p-2 transition-colors relative flex items-center rounded-lg hover:bg-white/5">
              <Icon icon="mdi:bell-outline" className="text-xl" />
              <span className="notif-dot hidden"></span>
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-neutral-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-[60]">
                <div className="p-3 border-b border-white/10 flex items-center justify-between bg-neutral-900">
                  <span className="text-xs font-medium text-neutral-300">{t('nav.notifications')}</span>
                  <button
                    onClick={() => { setNotifOpen(false); onNavigate('notifications'); }}
                    className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
                  >{t('nav.viewAll')}</button>
                </div>
                <div className="max-h-80 overflow-y-auto p-4 text-center text-xs text-neutral-500">
                  {t('nav.noNotifications')}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <button onClick={() => onNavigate('profile', {}, true)} className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-[10px] text-white font-bold overflow-hidden border border-white/10">
              {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : initials(currentUser.name)}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
          </button>

          {/* Settings */}
          <div className="relative" ref={settingsRef}>
            <button onClick={toggleSettings} className="text-neutral-500 hover:text-white p-1 transition-colors relative flex items-center rounded-lg hover:bg-white/5">
              <Icon icon="mdi:cog-outline" className="text-xl" />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-[60]">
                <div className="p-3 border-b border-white/5 bg-black/60">
                  <span className="text-xs font-medium text-neutral-300">{t('nav.settings')}</span>
                </div>
                <div className="p-2 flex flex-col gap-1 text-neutral-300">
                  {/* Language selector */}
                  <div className="relative">
                    <button
                      onClick={() => setLangOpen(!langOpen)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors text-sm hover:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Icon icon="mdi:translate" className="text-lg text-brand-400" />
                        {t('nav.language')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                        <Icon icon="mdi:chevron-right" className={`text-sm text-neutral-500 transition-transform ${langOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </button>
                    {langOpen && (
                      <div className="mt-1 mx-1 bg-black/60 rounded-xl border border-white/5 overflow-hidden">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => handleLangChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors text-left ${i18n.language === lang.code ? 'text-white bg-white/10' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                          >
                            <span className="text-sm">{lang.flag}</span>
                            <span className="font-medium">{lang.label}</span>
                            {i18n.language === lang.code && <Icon icon="mdi:check" className="ml-auto text-brand-400 text-sm" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors text-sm hover:text-white">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:weather-sunny" className="text-lg text-brand-400" />
                      <span>{t('nav.lightMode')}</span>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-left text-sm hover:text-white">
                    <Icon icon="mdi:help-circle-outline" className="text-lg text-brand-400" /> {t('nav.help')}
                  </button>
                  <div className="h-px w-full bg-white/10 my-1"></div>
                  <button onClick={logout} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/15 transition-colors text-left text-sm text-red-400 hover:text-red-300">
                    <Icon icon="mdi:logout" className="text-lg" /> {t('nav.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-white/10 border-b-0">
        <div className="flex items-center justify-around py-2">
          <button onClick={() => onNavigate('dashboard', {}, true)} className={`flex flex-col items-center gap-0.5 p-2 ${currentRoute === 'dashboard' ? 'text-brand-400' : 'text-neutral-500'}`}>
            <Icon icon="mdi:view-dashboard" className="text-xl" /><span className="text-[10px]">{t('nav.dashboard')}</span>
          </button>
          <button onClick={() => onNavigate('discover', {}, true)} className={`flex flex-col items-center gap-0.5 p-2 ${currentRoute === 'discover' ? 'text-brand-400' : 'text-neutral-500'}`}>
            <Icon icon="mdi:compass-outline" className="text-xl" /><span className="text-[10px]">{t('nav.discover')}</span>
          </button>
          <button onClick={() => onNavigate('new-post', {}, true)} className="flex flex-col items-center gap-0.5 p-2 text-neutral-500">
            <Icon icon="mdi:plus-circle-outline" className="text-xl" /><span className="text-[10px]">{t('nav.share')}</span>
          </button>
          <button onClick={() => onNavigate('messages', {}, true)} className={`flex flex-col items-center gap-0.5 p-2 ${currentRoute === 'messages' ? 'text-brand-400' : 'text-neutral-500'}`}>
            <Icon icon="mdi:message-outline" className="text-xl" /><span className="text-[10px]">{t('nav.messages')}</span>
          </button>
          <button onClick={() => onNavigate('profile', {}, true)} className={`flex flex-col items-center gap-0.5 p-2 ${currentRoute === 'profile' ? 'text-brand-400' : 'text-neutral-500'}`}>
            <Icon icon="mdi:account-outline" className="text-xl" /><span className="text-[10px]">{t('profile.posts')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
