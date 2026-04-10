import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DB, getUser, initials, uid } from '../services/db';
import { Icon } from '@iconify/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function Messages({ params, onNavigate }) {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [conversations, setConversations] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(params?.userId || null);
    const [msgText, setMsgText] = useState('');
    const [search, setSearch] = useState('');
    const scrollRef = useRef();

    const refreshConvos = () => {
        const msgs = DB.get('messages');
        const userConvos = msgs.filter(m => m.from === currentUser?.id || m.to === currentUser?.id);
        
        const uniqueUsers = new Set();
        userConvos.forEach(m => {
            uniqueUsers.add(m.from === currentUser?.id ? m.to : m.from);
        });

        const convos = Array.from(uniqueUsers).map(userId => {
            const user = getUser(userId);
            const lastMsg = userConvos.filter(m => m.from === userId || m.to === userId).sort((a, b) => b.ts - a.ts)[0];
            return { user, lastMsg };
        }).filter(c => c.user);

        if (params?.userId && !uniqueUsers.has(params.userId)) {
            const user = getUser(params.userId);
            if (user) {
                convos.unshift({ user, lastMsg: null });
            }
        }
        setConversations(convos);
    };

    useEffect(() => {
        refreshConvos();
    }, [currentUser, params?.userId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedUserId, conversations]);

    const selectedConvo = conversations.find(c => c.user.id === selectedUserId);

    const chatMsgs = DB.get('messages').filter(m => 
        (m.from === currentUser?.id && m.to === selectedUserId) || 
        (m.from === selectedUserId && m.to === currentUser?.id)
    ).sort((a, b) => a.ts - b.ts);

    const handleSend = () => {
        if (!msgText.trim() || !selectedUserId) return;

        const allMsgs = DB.get('messages');
        const newMsg = {
            id: 'm_' + uid(),
            from: currentUser.id,
            to: selectedUserId,
            text: msgText.trim(),
            ts: Date.now()
        };

        DB.set('messages', [...allMsgs, newMsg]);
        setMsgText('');
        refreshConvos();
    };

    const filteredConvos = conversations.filter(c => 
        c.user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] anim-up">
            <div className="flex bg-[#000] border border-white/10 rounded-2xl overflow-hidden h-full shadow-2xl">
                {/* Sidebar (Contacts) */}
                <div className="w-80 border-r border-white/10 flex flex-col bg-[#000]">
                    <div className="p-5 border-b border-white/10">
                        <span className="text-xl font-bold text-white tracking-tight">{currentUser?.name}</span>
                    </div>

                    <div className="p-4">
                        <div className="relative">
                            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input 
                                className="w-full bg-[#121212] border-none rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:ring-1 focus:ring-white/20 outline-none" 
                                placeholder={t('messages.search')} 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="px-5 py-2">
                            <span className="text-sm font-bold text-white uppercase tracking-wider">Mesajlar</span>
                        </div>
                        {filteredConvos.length > 0 ? (
                            filteredConvos.map((c, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedUserId(c.user.id)}
                                    className={`px-5 py-3 flex items-center gap-4 hover:bg-[#121212] cursor-pointer transition-colors ${selectedUserId === c.user.id ? 'bg-[#121212]' : ''}`}
                                >
                                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${c.user.grad} p-[2px] shrink-0`}>
                                        <div className="w-full h-full rounded-full bg-black p-[2px]">
                                            {c.user.avatar ? (
                                                <img src={c.user.avatar} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-white">
                                                    {initials(c.user.name)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-medium text-white truncate">{c.user.name}</h4>
                                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                                            {c.lastMsg?.from === currentUser.id ? t('messages.you') : ''}{c.lastMsg?.text || t('messages.startTyping')}
                                        </p>
                                    </div>
                                    {!c.lastMsg && <div className="w-2 h-2 bg-brand-500 rounded-full"></div>}
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-neutral-600">
                                <p className="text-xs font-medium uppercase tracking-widest leading-loose">{t('messages.noConversations')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                {selectedConvo ? (
                    <div className="flex-1 flex flex-col bg-[#000]">
                        {/* Header */}
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#000]">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedConvo.user.grad} flex items-center justify-center text-[10px] font-bold shadow-lg`}>
                                    {selectedConvo.user.avatar ? <img src={selectedConvo.user.avatar} className="w-full h-full object-cover rounded-full" /> : initials(selectedConvo.user.name)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white leading-none">{selectedConvo.user.name}</h4>
                                    <p className="text-[10px] text-neutral-500 mt-1 font-medium">{t('messages.active')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 text-white">
                                <button className="hover:opacity-60 transition-opacity"><Icon icon="mdi:information-outline" className="text-2xl" /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col scroll-smooth" ref={scrollRef}>
                            <div className="flex flex-col items-center mb-8">
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${selectedConvo.user.grad} p-1 mb-3`}>
                                   <div className="w-full h-full rounded-full bg-black p-1">
                                        {selectedConvo.user.avatar ? <img src={selectedConvo.user.avatar} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full flex items-center justify-center text-xl font-bold">{initials(selectedConvo.user.name)}</div>}
                                   </div>
                                </div>
                                <h3 className="text-lg font-bold text-white">{selectedConvo.user.name}</h3>
                                <p className="text-[11px] text-neutral-500 mt-1 tracking-wider uppercase font-bold">{selectedConvo.user.field} · {selectedConvo.user.university}</p>
                                <button 
                                    onClick={() => onNavigate('profile', { userId: selectedConvo.user.id })}
                                    className="mt-4 px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    {t('messages.viewProfile')}
                                </button>
                            </div>

                            {chatMsgs.map((m, i) => {
                                const isMe = m.from === currentUser?.id;
                                const sharedPost = m.postId ? DB.get('posts').find(p => p.id === m.postId) : null;

                                return (
                                    <div key={m.id || i} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        {!isMe && (
                                            <div className="w-6 h-6 rounded-full overflow-hidden mb-1">
                                                {selectedConvo.user.avatar ? (
                                                    <img src={selectedConvo.user.avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full bg-gradient-to-br ${selectedConvo.user.grad} flex items-center justify-center text-[8px] font-bold`}>{initials(selectedConvo.user.name)}</div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-1 max-w-[70%]">
                                            <div className={`ig-bubble ${isMe ? 'ig-bubble-me' : 'ig-bubble-them'}`}>
                                                {m.text}
                                            </div>
                                            
                                            {sharedPost && (
                                                <div 
                                                    onClick={() => onNavigate('dashboard', { postId: sharedPost.id })}
                                                    className={`cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#121212] transition-all hover:border-white/20 active:scale-95 group ${isMe ? 'self-end' : 'self-start'}`}
                                                >
                                                    <div className="aspect-video relative overflow-hidden bg-neutral-900 border-b border-white/5">
                                                        {sharedPost.image ? (
                                                            <img src={sharedPost.image} className="w-full h-full object-cover" alt="Shared Post" />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                                                                <Icon icon={sharedPost.type === 'code' ? 'mdi:code-braces' : sharedPost.type === 'design' ? 'mdi:palette-outline' : 'mdi:format-quote-close'} className="text-3xl text-brand-400/30 mb-2" />
                                                                <p className="text-[10px] text-neutral-500 font-medium line-clamp-2 px-2 italic">"{sharedPost.caption}"</p>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold text-white border border-white/10">
                                                                <Icon icon="mdi:eye-outline" className="text-sm" />
                                                                Posta bax
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getUser(sharedPost.authorId)?.grad} flex items-center justify-center text-[6px] font-black text-white`}>
                                                                {initials(getUser(sharedPost.authorId)?.name)}
                                                            </div>
                                                            <span className="text-[9px] font-bold text-neutral-400">{getUser(sharedPost.authorId)?.name}</span>
                                                        </div>
                                                        <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">{sharedPost.caption}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer / Input */}
                        <div className="p-4">
                            <div className="ig-input-pill group focus-within:ring-1 focus-within:ring-white/10">
                                <button className="text-white hover:opacity-70"><Icon icon="mdi:emoticon-outline" className="text-2xl" /></button>
                                <input 
                                    className="flex-1 bg-transparent border-none text-sm text-white placeholder-neutral-500 py-3 outline-none" 
                                    placeholder={t('messages.messagePlaceholder')} 
                                    value={msgText}
                                    onChange={(e) => setMsgText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                {msgText.trim() ? (
                                    <button 
                                        onClick={handleSend}
                                        className="text-brand-400 font-bold text-sm hover:text-white transition-colors px-2"
                                    >
                                        {t('messages.send')}
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4 text-white">
                                        <button className="hover:opacity-70 transition-opacity"><Icon icon="mdi:microphone-outline" className="text-2xl" /></button>
                                        <button className="hover:opacity-70 transition-opacity"><Icon icon="mdi:image-outline" className="text-2xl" /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                        <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-6">
                            <Icon icon="mdi:chat-processing-outline" className="text-5xl text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">{t('messages.emptyTitle')}</h2>
                        <p className="text-sm text-neutral-500 max-w-xs">{t('messages.emptyDesc')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
