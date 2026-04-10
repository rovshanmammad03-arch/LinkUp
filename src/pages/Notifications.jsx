import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DB, getUser, initials, timeAgo } from '../services/db';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const NOTIF_ICONS = {
  like:    { icon: 'mdi:heart',               color: 'text-rose-400 bg-rose-500/10' },
  comment: { icon: 'mdi:comment-outline',      color: 'text-brand-400 bg-brand-500/10' },
  follow:  { icon: 'mdi:account-plus-outline', color: 'text-green-400 bg-green-500/10' },
  reply:   { icon: 'mdi:reply',                color: 'text-purple-400 bg-purple-500/10' },
  apply:   { icon: 'mdi:briefcase-outline',    color: 'text-amber-400 bg-amber-500/10' },
};

export default function Notifications({ onNavigate }) {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const all = DB.get('notifications');
    const mine = all
      .filter(n => n.toUserId === currentUser?.id)
      .sort((a, b) => b.ts - a.ts);
    setNotifications(mine);

    // Mark all as read
    const updated = all.map(n =>
      n.toUserId === currentUser?.id ? { ...n, read: true } : n
    );
    DB.set('notifications', updated);
  }, [currentUser]);

  const markAllRead = () => {
    const all = DB.get('notifications');
    const updated = all.map(n =>
      n.toUserId === currentUser?.id ? { ...n, read: true } : n
    );
    DB.set('notifications', updated);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-6 anim-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('nav.notifications')}</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{t('notifications.unread', { count: unreadCount })}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Icon icon="mdi:bell-outline" className="text-3xl text-neutral-600" />
          </div>
          <p className="text-neutral-500 text-sm font-medium">{t('nav.noNotifications')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(n => {
            const sender = getUser(n.fromUserId);
            const meta = NOTIF_ICONS[n.type] || NOTIF_ICONS.like;
            return (
              <div
                key={n.id}
                onClick={() => n.route && onNavigate(n.route, n.routeParams || {})}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer
                  ${n.read
                    ? 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                    : 'bg-brand-500/5 border-brand-500/20 hover:bg-brand-500/10'
                  }`}
              >
                {/* Sender avatar */}
                <div className="relative shrink-0">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${sender?.grad || 'from-neutral-600 to-neutral-700'} flex items-center justify-center text-sm font-bold overflow-hidden`}>
                    {sender?.avatar
                      ? <img src={sender.avatar} className="w-full h-full object-cover" />
                      : initials(sender?.name || '?')}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${meta.color}`}>
                    <Icon icon={meta.icon} className="text-[10px]" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-snug">
                    <span className="font-semibold">{sender?.name || t('notifications.unknown')}</span>
                    {' '}{n.text}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{timeAgo(n.ts, t)}</p>
                </div>

                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
