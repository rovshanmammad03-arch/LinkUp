import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const settingsRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    const all = (() => { try { return JSON.parse(localStorage.getItem('lu_notifications')) || []; } catch(e) { return []; } })();
    setNotifs(all.filter(n => n.toUserId === currentUser.id));
  }, [currentUser, notifOpen, currentRoute]);

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
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-black/10 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden z-50">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangChange(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${i18n.language === lang.code ? 'text-neutral-900 dark:text-white bg-black/8 dark:bg-white/10' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
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
            <button onClick={toggleNotif} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white p-2 transition-colors relative flex items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <Icon icon="mdi:bell-outline" className="text-xl" />
              {notifs.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white dark:bg-neutral-900 rounded-xl border border-black/10 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden z-[60]">
                <div className="p-3 border-b border-black/8 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{t('nav.notifications')}</span>
                  <button
                    onClick={() => { setNotifOpen(false); onNavigate('notifications'); }}
                    className="text-[10px] text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
                  >{t('nav.viewAll')}</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400 dark:text-neutral-500">{t('nav.noNotifications')}</div>
                  ) : (
                    notifs.slice(0, 5).map(n => {
                      const sender = (() => { try { return (JSON.parse(localStorage.getItem('lu_users')) || []).find(u => u.id === n.fromUserId); } catch(e) { return null; } })();
                      return (
                        <div
                          key={n.id}
                          onClick={() => { setNotifOpen(false); onNavigate('notifications'); }}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!n.read ? 'bg-brand-500/5' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${sender?.grad || 'from-brand-500 to-purple-500'} flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden`}>
                            {sender?.avatar ? <img src={sender.avatar} className="w-full h-full object-cover" /> : (sender?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">
                              <span className="font-semibold">{sender?.name}</span> {n.text}
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">{(() => { const m = Math.floor((Date.now()-n.ts)/60000); return m < 1 ? 'İndi' : m < 60 ? m+' dəq' : Math.floor(m/60)+' saat'; })()}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0"></div>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <button onClick={() => onNavigate('profile', {}, true)} className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-[10px] text-white font-bold overflow-hidden border border-black/10 dark:border-white/10">
              {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : initials(currentUser.name)}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
          </button>

          {/* Settings */}
          <div className="relative" ref={settingsRef}>
            <button onClick={toggleSettings} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white p-1 transition-colors relative flex items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <Icon icon="mdi:cog-outline" className="text-xl" />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-black/10 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden z-[60]">
                <div className="p-3 border-b border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-black/60">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{t('nav.settings')}</span>
                </div>
                <div className="p-2 flex flex-col gap-1 text-neutral-600 dark:text-neutral-300">
                  {/* Settings Page Link */}
                  <button onClick={() => { setSettingsOpen(false); onNavigate('settings'); }} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left text-sm hover:text-neutral-900 dark:hover:text-white">
                    <Icon icon="mdi:account-cog-outline" className="text-lg text-brand-400" /> {t('settingsPage.title')}
                  </button>
                  
                  {/* Language selector */}
                  <div className="relative">
                    <button
                      onClick={() => setLangOpen(!langOpen)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm hover:text-neutral-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Icon icon="mdi:translate" className="text-lg text-brand-400" />
                        {t('nav.language')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                        <Icon icon="mdi:chevron-right" className={`text-sm text-neutral-400 dark:text-neutral-500 transition-transform ${langOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </button>
                    {langOpen && (
                      <div className="mt-1 mx-1 bg-neutral-50 dark:bg-black/60 rounded-xl border border-black/5 dark:border-white/5 overflow-hidden">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => handleLangChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors text-left ${i18n.language === lang.code ? 'text-neutral-900 dark:text-white bg-black/8 dark:bg-white/10' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
                          >
                            <span className="text-sm">{lang.flag}</span>
                            <span className="font-medium">{lang.label}</span>
                            {i18n.language === lang.code && <Icon icon="mdi:check" className="ml-auto text-brand-400 text-sm" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={toggleTheme} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm hover:text-neutral-900 dark:hover:text-white">
                    <div className="flex items-center gap-2">
                      <Icon icon={theme === 'dark' ? 'mdi:weather-sunny' : 'mdi:weather-night'} className="text-lg text-brand-400" />
                      <span>{theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}</span>
                    </div>
                    <div className={`w-9 h-5 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-neutral-300 dark:bg-neutral-700' : 'bg-brand-500'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'left-0.5' : 'left-[18px]'}`} />
                    </div>
                  </button>
                  <button onClick={() => { setSettingsOpen(false); setSupportModalOpen(true); }} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left text-sm hover:text-neutral-900 dark:hover:text-white">
                    <Icon icon="mdi:help-circle-outline" className="text-lg text-brand-400" /> {t('nav.help')}
                  </button>
                  <div className="h-px w-full bg-black/8 dark:bg-white/10 my-1"></div>
                  <button onClick={logout} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/10 transition-colors text-left text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
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
      {/* Support Modal */}
      {supportModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md anim-fade-in" style={{ margin: 0 }}>
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl anim-scale-in flex flex-col max-h-[90vh] border border-black/5 dark:border-white/10 relative">
            
            {/* Header */}
            <div className="px-6 py-6 border-b border-black/5 dark:border-white/5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
                  Bizimlə Əlaqə
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Sual, şikayət və ya təkliflərinizi komandamıza göndərin.
                </p>
              </div>
              <button 
                onClick={() => setSupportModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 transition-colors shrink-0"
              >
                <Icon icon="mdi:close" className="text-lg" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {supportSuccess && (
                <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm flex items-center gap-3 font-medium anim-fade-in">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                    <Icon icon="mdi:check-circle" className="text-xl" />
                  </div>
                  Mesajınız uğurla göndərildi!
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Mövzu</label>
                <input
                  type="text"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="Məsələn: Xəta barədə, Şikayət..."
                  disabled={supportSubmitting || supportSuccess}
                  className="w-full bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-4 focus:ring-brand-500/10 rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-white transition-all outline-none disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Mesajınız</label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Problemi detaylı təsvir edin..."
                  rows={4}
                  disabled={supportSubmitting || supportSuccess}
                  className="w-full bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-4 focus:ring-brand-500/10 rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-white transition-all outline-none resize-none disabled:opacity-50"
                ></textarea>
                <p className="mt-2 ml-1 text-[11px] text-neutral-400 dark:text-neutral-500 flex items-start gap-1">
                  <Icon icon="mdi:information-outline" className="text-[13px] shrink-0 mt-0.5" />
                  Sistemə birbaşa fayl və ya şəkil əlavə etmək mümkün deyil. Bunun üçün <a href="mailto:linkup.az.info@gmail.com" className="text-brand-500 hover:underline">linkup.az.info@gmail.com</a> ünvanına birbaşa məktub yaza bilərsiniz.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSupportModalOpen(false)}
                disabled={supportSubmitting}
                className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Ləğv et
              </button>
              <button
                onClick={async () => {
                  setSupportSubmitting(true);
                  try {
                    const response = await fetch('https://api.web3forms.com/submit', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                      },
                      body: JSON.stringify({
                        access_key: 'a0fc5d9d-6163-4a6a-9a39-847b0134db94',
                        subject: supportSubject || 'LinkUp Dəstək / Şikayət',
                        from_name: currentUser?.name || 'LinkUp İstifadəçisi',
                        email: currentUser?.email,
                        message: `İstifadəçi: ${currentUser?.name}\nE-poçt: ${currentUser?.email}\n\nMövzu: ${supportSubject || 'Bildirilməyib'}\n\nMesaj:\n${supportMessage}`
                      })
                    });
                    const result = await response.json();
                    if (result.success) {
                        setSupportSuccess(true);
                        setTimeout(() => {
                           setSupportModalOpen(false);
                           setSupportSuccess(false);
                           setSupportSubject('');
                           setSupportMessage('');
                        }, 2500);
                    } else {
                        alert("Xəta baş verdi. Zəhmət olmasa biraz sonra yenidən cəhd edin.");
                    }
                  } catch (e) {
                      console.error(e);
                      alert("İnternet bağlantınızı yoxlayın.");
                  } finally {
                      setSupportSubmitting(false);
                  }
                }}
                disabled={!supportMessage.trim() || supportSubmitting || supportSuccess}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-brand-500/25 active:scale-95"
              >
                {supportSubmitting ? (
                  <>
                    <Icon icon="mdi:loading" className="text-lg animate-spin" />
                    Göndərilir...
                  </>
                ) : supportSuccess ? (
                  <>
                    <Icon icon="mdi:check" className="text-lg" />
                    Göndərildi
                  </>
                ) : (
                  <>
                    Göndər
                    <Icon icon="mdi:send" className="text-base" />
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
}
