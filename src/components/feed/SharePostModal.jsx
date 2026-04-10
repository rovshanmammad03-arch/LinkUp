import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DB, initials, uid } from '../../services/db';
import { Icon } from '@iconify/react';
import { useScrollLock } from '../../hooks/useScrollLock';

const SOCIAL_PLATFORMS = [
    { name: 'WhatsApp', icon: 'mdi:whatsapp', color: 'bg-[#25D366]', url: (url) => `https://wa.me/?text=${encodeURIComponent(url)}` },
    { name: 'Telegram', icon: 'mdi:telegram', color: 'bg-[#0088cc]', url: (url) => `https://t.me/share/url?url=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', icon: 'mdi:linkedin', color: 'bg-[#0077b5]', url: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'X', icon: 'mdi:twitter', color: 'bg-black', url: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}` },
    { name: 'Facebook', icon: 'mdi:facebook', color: 'bg-[#1877F2]', url: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
];

export default function SharePostModal({ post, onClose }) {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [sentStatus, setSentStatus] = useState({});
    const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'social'
    const [copied, setCopied] = useState(false);

    useScrollLock(true);

    const postUrl = `https://linkup.social/post/${post.id}`;

    useEffect(() => {
        const followingIds = currentUser?.following || [];
        const followedUsers = DB.get('users').filter(u => followingIds.includes(u.id));
        setUsers(followedUsers);
    }, [currentUser]);

    const handleSend = (user) => {
        const messages = DB.get('messages');
        const newMessage = {
            id: 'msg_' + uid(),
            from: currentUser.id,
            to: user.id,
            text: `Bu paylaşımı sənə göndərdim: [Post]`,
            postId: post.id,
            ts: Date.now()
        };
        DB.set('messages', [...messages, newMessage]);
        
        setSentStatus(prev => ({ ...prev, [user.id]: true }));
        setTimeout(() => {
            setSentStatus(prev => ({ ...prev, [user.id]: false }));
        }, 2000);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.field.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            
            <div className="bg-[#121212] border border-white/10 rounded-[32px] w-full max-w-sm relative z-10 anim-up flex flex-col shadow-2xl overflow-hidden h-[540px]">
                {/* Header */}
                <div className="p-6 pb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white tracking-tight">Paylaş</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                        <Icon icon="mdi:close" className="text-xl" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 mb-6">
                    <div className="flex p-1 bg-white/5 rounded-2xl">
                        <button 
                            onClick={() => setActiveTab('friends')}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'friends' ? 'bg-brand-500 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            Dostlar
                        </button>
                        <button 
                            onClick={() => setActiveTab('social')}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'social' ? 'bg-brand-500 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            Xarici
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
                    {activeTab === 'friends' ? (
                        <>
                            <div className="relative mb-4">
                                <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg" />
                                <input 
                                    type="text" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="İzlədiyin adamları axtar..." 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500/50 transition-all"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${u.grad} flex items-center justify-center text-xs font-bold overflow-hidden shrink-0 shadow-lg shadow-black/20`}>
                                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : initials(u.name)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">{u.name}</h4>
                                                <p className="text-[11px] text-neutral-500 font-medium">{u.field}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleSend(u)}
                                            disabled={sentStatus[u.id]}
                                            className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${
                                                sentStatus[u.id] 
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                : 'bg-white/5 text-white hover:bg-brand-500 hover:scale-105 active:scale-95'
                                            }`}
                                        >
                                            {sentStatus[u.id] ? (
                                                <div className="flex items-center gap-1">
                                                    <Icon icon="mdi:check" className="text-sm" /> Göndərildi
                                                </div>
                                            ) : 'Göndər'}
                                        </button>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center h-full text-neutral-600 gap-2">
                                        <Icon icon="mdi:account-search-outline" className="text-4xl opacity-20" />
                                        <p className="text-sm font-medium">İzlədiyin heç kim tapılmadı</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col h-full anim-up">
                            {/* Copy Link */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6">
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Post Linki</p>
                                <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1.5 pl-3 border border-white/5">
                                    <span className="text-xs text-neutral-400 truncate flex-1 font-mono">{postUrl}</span>
                                    <button 
                                        onClick={copyToClipboard}
                                        className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 ${
                                            copied ? 'bg-green-500 text-white' : 'bg-brand-500 text-white hover:bg-brand-600'
                                        }`}
                                    >
                                        <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} />
                                        {copied ? 'Kopyalandı' : 'Kopyala'}
                                    </button>
                                </div>
                            </div>

                            {/* Social Grid */}
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Sosial Şəbəkələr</p>
                            <div className="grid grid-cols-4 gap-4">
                                {SOCIAL_PLATFORMS.map((platform) => (
                                    <a 
                                        key={platform.name}
                                        href={platform.url(postUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl ${platform.color} flex items-center justify-center text-white text-2xl shadow-lg transition-all group-hover:scale-110 group-hover:-translate-y-1 active:scale-95`}>
                                            <Icon icon={platform.icon} />
                                        </div>
                                        <span className="text-[10px] text-neutral-500 font-bold tracking-tight group-hover:text-white transition-colors">{platform.name}</span>
                                    </a>
                                ))}
                                <button className="flex flex-col items-center gap-2 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 text-2xl transition-all group-hover:bg-white/10 group-hover:text-white group-hover:-translate-y-1">
                                        <Icon icon="mdi:dots-horizontal" />
                                    </div>
                                    <span className="text-[10px] text-neutral-500 font-bold tracking-tight group-hover:text-white transition-colors">Daha çox</span>
                                </button>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5 text-center">
                                <p className="text-[11px] text-neutral-600 font-medium">LinkUp ilə dünyanı paylaşın</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
