import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { DB, getUser, initials, uid, addNotification } from '../services/db';
import { supabase } from '../services/supabaseClient';
import { projectsService } from '../services/projectsService';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import AddMemberModal from '../components/messages/AddMemberModal';
import EmptyState from '../components/common/EmptyState';

function translateField(field, t) {
    const map = {
        'Proqramlaşdırma': t('auth.fields.programming'),
        'Dizayn': t('auth.fields.design'),
        'Marketinq': t('auth.fields.marketing'),
        'Digər': t('auth.fields.other'),
    };
    return map[field] || field;
}

export default function Messages({ params, onNavigate }) {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [tab, setTab] = useState(params?.projectId ? 'projects' : 'personal');
    const [conversations, setConversations] = useState([]);
    const [projectConversations, setProjectConversations] = useState([]);
    const [chatMsgs, setChatMsgs] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(params?.userId || null);
    const [selectedProjectId, setSelectedProjectId] = useState(params?.projectId || null);
    const [msgText, setMsgText] = useState('');
    const [search, setSearch] = useState('');
    const [showManageTeam, setShowManageTeam] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [addMemberError, setAddMemberError] = useState('');
    const scrollRef = useRef();
    const imageInputRef = useRef();
    const selectedUserIdRef = useRef(selectedUserId);
    const selectedProjectIdRef = useRef(selectedProjectId);
    const tabRef = useRef(tab);

    useEffect(() => { selectedUserIdRef.current = selectedUserId; }, [selectedUserId]);
    useEffect(() => { selectedProjectIdRef.current = selectedProjectId; }, [selectedProjectId]);
    useEffect(() => { tabRef.current = tab; }, [tab]);

    const markMessagesRead = async (userId, projectId) => {
        // Supabase-də oxunmuş et
        try {
            if (projectId) {
                await supabase
                    .from('messages')
                    .update({ read: true })
                    .eq('project_id', projectId)
                    .neq('from_user', currentUser?.id)
                    .eq('read', false);
            } else if (userId) {
                await supabase
                    .from('messages')
                    .update({ read: true })
                    .eq('from_user', userId)
                    .eq('to_user', currentUser?.id)
                    .eq('read', false);
            }
        } catch (err) {
            console.error('markMessagesRead error:', err);
        }

        // localStorage da sinxronlaşdır
        const msgs = DB.get('messages');
        const updated = msgs.map(m => {
            if (projectId) {
                if (m.projectId === projectId && m.from !== currentUser?.id && !m.read)
                    return { ...m, read: true };
            } else if (userId) {
                if (!m.projectId && m.from === userId && m.to === currentUser?.id && !m.read)
                    return { ...m, read: true };
            }
            return m;
        });
        DB.set('messages', updated);
        window.dispatchEvent(new Event('storage'));
    };

    const loadChatMsgs = useCallback(async (userId, projectId) => {
        try {
            let query = supabase.from('messages').select('*').order('ts', { ascending: true });
            if (projectId) {
                query = query.eq('project_id', projectId);
            } else if (userId) {
                query = query.or(
                    `and(from_user.eq.${currentUser.id},to_user.eq.${userId}),and(from_user.eq.${userId},to_user.eq.${currentUser.id})`
                );
            }
            const { data, error } = await query;
            if (!error && data) {
                setChatMsgs(data.map(m => ({
                    id: m.id,
                    from: m.from_user,
                    to: m.to_user,
                    projectId: m.project_id,
                    text: m.text || '',
                    image: m.image || '',
                    postId: m.post_id,
                    read: m.read,
                    ts: m.ts,
                })));
            }
        } catch (err) {
            console.error('loadChatMsgs error:', err);
            // Fallback: localStorage
            const msgs = DB.get('messages').filter(m => {
                if (projectId) return m.projectId === projectId;
                return !m.projectId && (
                    (m.from === currentUser.id && m.to === userId) ||
                    (m.from === userId && m.to === currentUser.id)
                );
            }).sort((a, b) => a.ts - b.ts);
            setChatMsgs(msgs);
        }
    }, [currentUser?.id]);

    const refreshConvos = useCallback(async () => {

        // Supabase-dən mesajları çək
        let supabaseMsgs = [];
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`from_user.eq.${currentUser.id},to_user.eq.${currentUser.id},project_id.not.is.null`)
                .order('ts', { ascending: true });
            if (!error && data) {
                // Supabase formatını localStorage formatına çevir
                supabaseMsgs = data.map(m => ({
                    id: m.id,
                    from: m.from_user,
                    to: m.to_user,
                    projectId: m.project_id,
                    text: m.text || '',
                    image: m.image || '',
                    postId: m.post_id,
                    read: m.read,
                    ts: m.ts,
                }));
                // localStorage-ı Supabase ilə sinxronlaşdır
                DB.set('messages', supabaseMsgs);
            }
        } catch (err) {
            console.error('Supabase messages fetch error:', err);
        }

        const msgs = supabaseMsgs.length > 0 ? supabaseMsgs : DB.get('messages');

        // Migration: köhnə mesajlara read sahəsi əlavə et
        const migratedMsgs = msgs.map(m => m.read === undefined ? { ...m, read: true } : m);

        const userConvos = migratedMsgs.filter(m => !m.projectId && (m.from === currentUser?.id || m.to === currentUser?.id));
        const uniqueUsers = new Set();
        userConvos.forEach(m => {
            uniqueUsers.add(m.from === currentUser?.id ? m.to : m.from);
        });

        const convos = Array.from(uniqueUsers).map(userId => {
            const user = getUser(userId);
            const userMsgs = userConvos.filter(m => m.from === userId || m.to === userId);
            const lastMsg = userMsgs.sort((a, b) => b.ts - a.ts)[0];
            const unreadCount = userMsgs.filter(m => m.from === userId && m.to === currentUser?.id && !m.read).length;
            return { user, lastMsg, unreadCount };
        }).filter(c => c.user);

        if (params?.userId && !uniqueUsers.has(params.userId)) {
            const user = getUser(params.userId);
            if (user) convos.unshift({ user, lastMsg: null, unreadCount: 0 });
        }
        setConversations(convos.sort((a, b) => (b.lastMsg?.ts || 0) - (a.lastMsg?.ts || 0)));

        const allProjects = await projectsService.getAll();
        const myProjects = allProjects.filter(p =>
            p.authorId === currentUser?.id ||
            (p.applicants && p.applicants.some(a => {
                const aId = typeof a === 'object' ? a.id : a;
                const aStatus = typeof a === 'object' ? a.status : 'pending';
                return aId === currentUser?.id && aStatus === 'accepted';
            }))
        );

        const pConvos = myProjects.map(p => {
            const projectMsgs = migratedMsgs.filter(m => m.projectId === p.id);
            const lastMsg = projectMsgs.sort((a, b) => b.ts - a.ts)[0];
            const unreadCount = projectMsgs.filter(m => m.from !== currentUser?.id && m.from !== 'system' && !m.read).length;
            return { project: p, lastMsg, unreadCount };
        }).sort((a, b) => (b.lastMsg?.ts || a.project.createdAt) - (a.lastMsg?.ts || b.project.createdAt));

        setProjectConversations(pConvos);
    }, [currentUser?.id, params?.userId]);

    useEffect(() => { refreshConvos(); }, [refreshConvos]);

    // Aktiv söhbətin mesajlarını yüklə
    useEffect(() => {
        if (tab === 'personal' && selectedUserId) {
            loadChatMsgs(selectedUserId, null);
        } else if (tab === 'projects' && selectedProjectId) {
            loadChatMsgs(null, selectedProjectId);
        } else {
            setChatMsgs([]);
        }
    }, [selectedUserId, selectedProjectId, tab, loadChatMsgs]);

    // Supabase real-time subscription
    useEffect(() => {
        if (!currentUser?.id) return;

        const channel = supabase
            .channel('messages-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                const m = payload.new;
                const isForMe = m.to_user === currentUser.id || m.project_id || m.from_user === currentUser.id;
                if (!isForMe) return;

                const newMsg = {
                    id: m.id,
                    from: m.from_user,
                    to: m.to_user,
                    projectId: m.project_id,
                    text: m.text || '',
                    image: m.image || '',
                    postId: m.post_id,
                    read: m.read,
                    ts: m.ts,
                };

                // Ref-lərdən aktiv söhbəti oxu (həmişə ən son dəyər)
                const activeUserId = selectedUserIdRef.current;
                const activeProjectId = selectedProjectIdRef.current;
                const activeTab = tabRef.current;

                const isActivePersonal = activeTab === 'personal' && !m.project_id &&
                    ((m.from_user === currentUser.id && m.to_user === activeUserId) ||
                     (m.from_user === activeUserId && m.to_user === currentUser.id));
                const isActiveProject = activeTab === 'projects' && m.project_id && m.project_id === activeProjectId;

                if (isActivePersonal || isActiveProject) {
                    setChatMsgs(prev => {
                        if (prev.find(p => p.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }

                // Sidebar unread count yenilə
                refreshConvos();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [currentUser?.id, refreshConvos]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chatMsgs]);

    const selectedUserConvo = conversations.find(c => c.user.id === selectedUserId);
    const selectedProjectConvo = projectConversations.find(c => c.project.id === selectedProjectId);

    const handleSend = async () => {
        if (!msgText.trim()) return;
        if (tab === 'personal' && !selectedUserId) return;
        if (tab === 'projects' && !selectedProjectId) return;

        const msgId = 'm_' + uid();
        const now = Date.now();
        const newMsg = {
            id: msgId,
            from: currentUser.id,
            text: msgText.trim(),
            ts: now,
            read: false,
        };

        const supabasePayload = {
            id: msgId,
            from_user: currentUser.id,
            text: msgText.trim(),
            ts: now,
            read: false,
        };

        if (tab === 'personal') {
            newMsg.to = selectedUserId;
            supabasePayload.to_user = selectedUserId;
        } else {
            newMsg.projectId = selectedProjectId;
            supabasePayload.project_id = selectedProjectId;
        }

        // Optimistic update — dərhal göstər
        setChatMsgs(prev => [...prev, newMsg]);
        setMsgText('');

        // Supabase-ə yaz
        try {
            await supabase.from('messages').insert([supabasePayload]);
        } catch (err) {
            console.error('Supabase message send error:', err);
            // Xəta olarsa mesajı geri al
            setChatMsgs(prev => prev.filter(m => m.id !== msgId));
        }

        // localStorage-a da yaz
        DB.set('messages', [...DB.get('messages'), newMsg]);
        refreshConvos();
    };

    const handleImageSend = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (tab === 'personal' && !selectedUserId) return;
        if (tab === 'projects' && !selectedProjectId) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            const msgId = 'm_' + uid();
            const imageData = ev.target.result;

            const payload = {
                id: msgId,
                from: currentUser.id,
                text: '',
                image: imageData,
                ts: Date.now(),
                read: false,
            };

            const supabasePayload = {
                id: msgId,
                from_user: currentUser.id,
                text: '',
                image: imageData,
                ts: Date.now(),
                read: false,
            };

            if (tab === 'personal') {
                payload.to = selectedUserId;
                supabasePayload.to_user = selectedUserId;
            } else {
                payload.projectId = selectedProjectId;
                supabasePayload.project_id = selectedProjectId;
            }

            try {
                await supabase.from('messages').insert([supabasePayload]);
            } catch (err) {
                console.error('Supabase image send error:', err);
            }

            DB.set('messages', [...DB.get('messages'), payload]);
            refreshConvos();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleRemoveMember = async (memberId) => {
        if (!selectedProjectId) return;
        const project = projectConversations.find(c => c.project.id === selectedProjectId)?.project;
        if (!project) return;

        const newApplicants = (project.applicants || []).map(a => {
            const id = typeof a === 'object' ? a.id : a;
            if (id === memberId) return { id, status: 'rejected' };
            return a;
        });
        await projectsService.update(selectedProjectId, { applicants: newApplicants });

        const sysMsg = {
            id: 'm_' + uid(),
            from_user: 'system',
            project_id: selectedProjectId,
            text: `${getUser(memberId)?.name} qrupdan çıxarıldı.`,
            ts: Date.now(),
            read: true,
        };
        try {
            await supabase.from('messages').insert([sysMsg]);
        } catch (err) {
            console.error('System message error:', err);
        }
        DB.set('messages', [...DB.get('messages'), { id: sysMsg.id, from: 'system', projectId: selectedProjectId, text: sysMsg.text, ts: sysMsg.ts }]);
        refreshConvos();
    };

    const handleAddMember = async (userId) => {
        if (!selectedProjectId) return;
        const project = projectConversations.find(c => c.project.id === selectedProjectId)?.project;
        if (!project) return;

        const alreadyMember = (project.applicants || []).some(a => {
            const id = typeof a === 'object' ? a.id : a;
            const status = typeof a === 'object' ? a.status : 'pending';
            return id === userId && status === 'accepted';
        });
        if (alreadyMember) {
            setAddMemberError('Bu istifadəçi artıq qrupun üzvüdür.');
            return;
        }

        const newApplicants = [...(project.applicants || []), { id: userId, status: 'accepted' }];
        await projectsService.update(selectedProjectId, { applicants: newApplicants });

        const addedUser = getUser(userId);
        const sysMsg = {
            id: 'm_' + uid(),
            from_user: 'system',
            project_id: selectedProjectId,
            text: `${addedUser?.name} qrupa əlavə edildi.`,
            ts: Date.now(),
            read: true,
        };
        try {
            await supabase.from('messages').insert([sysMsg]);
        } catch (err) {
            console.error('System message error:', err);
        }
        DB.set('messages', [...DB.get('messages'), { id: sysMsg.id, from: 'system', projectId: selectedProjectId, text: sysMsg.text, ts: sysMsg.ts }]);

        addNotification({
            toUserId: userId,
            fromUserId: currentUser.id,
            type: 'group_add',
            text: `${currentUser.name} sizi "${project.title}" qrupuna əlavə etdi.`,
            route: 'messages',
            routeParams: { projectId: selectedProjectId }
        });

        setShowAddMember(false);
        refreshConvos();
    };

    const handleLeaveGroup = async () => {
        if (!selectedProjectId) return;
        const project = projectConversations.find(c => c.project.id === selectedProjectId)?.project;
        if (!project) return;

        const newApplicants = (project.applicants || []).map(a => {
            const id = typeof a === 'object' ? a.id : a;
            if (id === currentUser?.id) return { id, status: 'left' };
            return a;
        });
        await projectsService.update(selectedProjectId, { applicants: newApplicants });

        const sysMsg = {
            id: 'm_' + uid(),
            from_user: 'system',
            project_id: selectedProjectId,
            text: `${currentUser?.name} qrupdan çıxdı.`,
            ts: Date.now(),
            read: true,
        };
        try {
            await supabase.from('messages').insert([sysMsg]);
        } catch (err) {
            console.error('System message error:', err);
        }
        DB.set('messages', [...DB.get('messages'), { id: sysMsg.id, from: 'system', projectId: selectedProjectId, text: sysMsg.text, ts: sysMsg.ts }]);

        setSelectedProjectId(null);
        setShowManageTeam(false);
        refreshConvos();
    };

    const filteredPersonalConvos = conversations.filter(c =>
        c.user.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredProjectConvos = projectConversations.filter(c =>
        c.project.title.toLowerCase().includes(search.toLowerCase())
    );

    const activeConvoList = tab === 'personal' ? filteredPersonalConvos : filteredProjectConvos;

    return (
        <>
        <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] anim-up relative">
            <div className="flex bg-white dark:bg-[#000] md:border border-black/10 dark:border-white/10 md:rounded-2xl overflow-hidden h-full shadow-xl dark:shadow-2xl">

                {/* Sidebar */}
                <div className={`${(selectedUserId || selectedProjectId) ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-black/8 dark:border-white/10 flex-col bg-white dark:bg-[#000] z-10 shrink-0`}>
                    <div className="p-5 border-b border-black/8 dark:border-white/10 flex flex-col gap-4">
                        <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">{t('messages.messagesTitle')}</span>

                        {/* Tab Switcher */}
                        <div className="flex bg-neutral-100 dark:bg-[#121212] p-1 rounded-xl">
                            <button
                                onClick={() => setTab('personal')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === 'personal' ? 'bg-white dark:bg-black text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                            >
                                Şəxsi
                            </button>
                            <button
                                onClick={() => setTab('projects')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'projects' ? 'bg-white dark:bg-black text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                            >
                                <Icon icon="mdi:folder-account-outline" className="text-sm" /> Layihələr
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border-b border-black/5 dark:border-white/5">
                        <div className="relative">
                            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                            <input
                                className="w-full bg-neutral-100 dark:bg-[#121212] border-none rounded-lg pl-10 pr-4 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 outline-none"
                                placeholder={t('messages.search')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {activeConvoList.length > 0 ? (
                            activeConvoList.map((item, i) => {
                                const isProject = tab === 'projects';
                                const id = isProject ? item.project.id : item.user.id;
                                const isSelected = isProject ? selectedProjectId === id : selectedUserId === id;
                                const name = isProject ? item.project.title : item.user.name;
                                const lastMsgObj = item.lastMsg;
                                const lastMsgText = lastMsgObj?.text || (lastMsgObj?.image ? 'Şəkil göndərildi' : (isProject ? 'Qrup yaradıldı' : t('messages.startTyping')));
                                const lastMsgSender = lastMsgObj?.from === currentUser?.id ? `${t('messages.you')} ` : (lastMsgObj?.from === 'system' ? 'Sistem: ' : (isProject && lastMsgObj ? `${getUser(lastMsgObj.from)?.name.split(' ')[0]}: ` : ''));

                                return (
                                    <div
                                        key={id}
                                        onClick={() => {
                                            if (isProject) {
                                                setSelectedProjectId(id);
                                                setSelectedUserId(null);
                                                markMessagesRead(null, id);
                                            } else {
                                                setSelectedUserId(id);
                                                setSelectedProjectId(null);
                                                markMessagesRead(id, null);
                                            }
                                        }}
                                        className={`px-5 py-3 flex items-center gap-4 cursor-pointer transition-colors ${isSelected
                                                ? 'bg-neutral-100 dark:bg-[#121212]'
                                                : 'hover:bg-neutral-50 dark:hover:bg-[#121212]'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${isProject ? item.project.grad : item.user.grad} p-[2px] shrink-0 shadow-sm border border-black/5 dark:border-white/5`}>
                                            <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center overflow-hidden">
                                                {isProject ? (
                                                    <Icon icon="mdi:rocket-launch-outline" className="text-2xl text-neutral-700 dark:text-neutral-300" />
                                                ) : (
                                                    item.user.avatar ? (
                                                        <img src={item.user.avatar} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        <div className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-white">
                                                            {initials(item.user.name)}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">{name}</h4>
                                            <p className="text-xs text-neutral-500 truncate mt-0.5">
                                                {lastMsgSender}{lastMsgText}
                                            </p>
                                        </div>
                                        {item.unreadCount > 0 ? (
                                            <span className="min-w-[20px] h-5 px-1.5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                                {item.unreadCount}
                                            </span>
                                        ) : (!lastMsgObj && !isProject && <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0"></div>)}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="p-10 text-center text-neutral-400 dark:text-neutral-600">
                                <p className="text-xs font-medium uppercase tracking-widest leading-loose">Söhbət tapılmadı</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                {(tab === 'personal' && selectedUserConvo) || (tab === 'projects' && selectedProjectConvo) ? (
                    <div className="flex-1 flex flex-col bg-white dark:bg-[#000] relative z-20">
                        {/* Header */}
                        <div className="h-16 border-b border-black/8 dark:border-white/10 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                {/* Back Button for Mobile */}
                                <button 
                                    onClick={() => { setSelectedUserId(null); setSelectedProjectId(null); }}
                                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-neutral-500"
                                >
                                    <Icon icon="mdi:chevron-left" className="text-2xl" />
                                </button>

                                {tab === 'personal' ? (
                                    <div
                                        className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity"
                                        onClick={() => onNavigate('profile', { userId: selectedUserConvo.user.id })}
                                    >
                                        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br ${selectedUserConvo.user.grad} flex items-center justify-center text-[10px] font-bold shadow-lg text-neutral-900 dark:text-white`}>
                                            {selectedUserConvo.user.avatar
                                                ? <img src={selectedUserConvo.user.avatar} className="w-full h-full object-cover rounded-full" />
                                                : initials(selectedUserConvo.user.name)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-none">{selectedUserConvo.user.name}</h4>
                                            <p className="text-[10px] text-neutral-500 mt-1 font-medium">{t('messages.active')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br ${selectedProjectConvo.project.grad} flex items-center justify-center shadow-lg text-neutral-900 dark:text-white`}>
                                            <Icon icon="mdi:rocket-launch-outline" className="text-sm" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-none line-clamp-1">{selectedProjectConvo.project.title}</h4>
                                            <p className="text-[10px] text-neutral-500 mt-1 font-medium flex items-center gap-1">
                                                <Icon icon="mdi:account-multiple" /> Komanda
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {tab === 'projects' && (
                                <button
                                    onClick={() => setShowManageTeam(true)}
                                    className="w-10 h-10 md:w-auto md:px-3 md:py-1.5 flex items-center justify-center md:gap-1.5 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-xl md:rounded-lg text-xs font-bold text-neutral-700 dark:text-neutral-300 transition-colors"
                                >
                                    <Icon icon="mdi:account-multiple-outline" className="text-lg md:text-sm" />
                                    <span className="hidden md:inline">İştirakçılar</span>
                                </button>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col scroll-smooth relative" ref={scrollRef}>
                            <div className="flex flex-col items-center mb-8 pt-4">
                                {tab === 'personal' ? (
                                    <>
                                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${selectedUserConvo.user.grad} p-1 mb-3`}>
                                            <div className="w-full h-full rounded-full bg-white dark:bg-black p-1">
                                                {selectedUserConvo.user.avatar
                                                    ? <img src={selectedUserConvo.user.avatar} className="w-full h-full object-cover rounded-full" />
                                                    : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-neutral-700 dark:text-white">{initials(selectedUserConvo.user.name)}</div>}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{selectedUserConvo.user.name}</h3>
                                        <p className="text-[11px] text-neutral-500 mt-1 tracking-wider uppercase font-bold">
                                            {translateField(selectedUserConvo.user.field, t)} · {selectedUserConvo.user.university}
                                        </p>
                                        <button
                                            onClick={() => onNavigate('profile', { userId: selectedUserConvo.user.id })}
                                            className="mt-4 px-4 py-1.5 bg-neutral-100 dark:bg-[rgba(255,255,255,0.05)] hover:bg-neutral-200 dark:hover:bg-[rgba(255,255,255,0.1)] text-neutral-700 dark:text-white text-xs font-bold rounded-lg transition-colors"
                                        >
                                            {t('messages.viewProfile')}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className={`w-20 h-20 rounded-[24px] bg-gradient-to-br ${selectedProjectConvo.project.grad} p-1 mb-3 shadow-lg`}>
                                            <div className="w-full h-full rounded-[20px] bg-white dark:bg-black flex items-center justify-center text-3xl text-neutral-800 dark:text-neutral-200">
                                                <Icon icon="mdi:rocket-launch-outline" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white text-center max-w-sm">{selectedProjectConvo.project.title}</h3>
                                        <p className="text-[11px] text-neutral-500 mt-2 text-center max-w-md bg-neutral-100 dark:bg-[rgba(255,255,255,0.05)] px-4 py-2 rounded-xl">
                                            Bu, layihənizin aktiv müraciətçiləri və rəhbəri üçün qapalı qrup çatıdır.
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="space-y-4 flex-1 flex flex-col justify-end pr-2">
                                {chatMsgs.map((m, i) => {
                                    const isSystem = m.from === 'system';
                                    const isMe = m.from === currentUser?.id;
                                    const sender = isSystem ? null : getUser(m.from);
                                    const sharedPost = m.postId ? DB.get('posts').find(p => p.id === m.postId) : null;
                                    const showSenderInfo = tab === 'projects' && !isMe && !isSystem && (i === 0 || chatMsgs[i - 1].from !== m.from);

                                    if (isSystem) {
                                        return (
                                            <div key={m.id || i} className="flex justify-center my-4">
                                                <span className="px-4 py-1.5 bg-neutral-100 dark:bg-[rgba(255,255,255,0.05)] text-neutral-500 dark:text-neutral-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                    {m.text}
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={m.id || i} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${showSenderInfo ? 'mt-6' : 'mt-1'}`}>
                                            {!isMe && (
                                                <div className="flex flex-col items-center justify-end w-7 h-7 mb-0.5 shrink-0">
                                                    {(showSenderInfo || i === chatMsgs.length - 1 || chatMsgs[i + 1]?.from !== m.from) ? (
                                                        <div
                                                            className="w-7 h-7 rounded-full overflow-hidden cursor-pointer active:scale-95 transition-transform"
                                                            onClick={() => sender && onNavigate('profile', { userId: sender.id })}
                                                        >
                                                            {sender?.avatar ? (
                                                                <img src={sender.avatar} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className={`w-full h-full bg-gradient-to-br ${sender?.grad || 'from-neutral-400 to-neutral-500'} flex items-center justify-center text-[9px] font-bold text-white`}>
                                                                    {initials(sender?.name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : <div className="w-7 h-7" />}
                                                </div>
                                            )}

                                            <div className={`flex flex-col max-w-[70%] group relative ${isMe ? 'items-end' : 'items-start'}`}>
                                                {showSenderInfo && (
                                                    <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 ml-1">{sender?.name}</span>
                                                )}

                                                {m.image ? (
                                                    <img
                                                        src={m.image}
                                                        className={`rounded-2xl border border-black/5 dark:border-white/5 opacity-90 hover:opacity-100 transition-opacity max-w-[260px] max-h-[260px] object-cover cursor-pointer shadow-sm ${isMe ? 'self-end rounded-br-sm' : 'self-start rounded-bl-sm'}`}
                                                        onClick={() => window.open(m.image, '_blank')}
                                                    />
                                                ) : (
                                                    <div className={`ig-bubble shadow-sm ${isMe ? 'ig-bubble-me rounded-br-sm' : 'ig-bubble-them rounded-bl-sm'}`}>
                                                        {m.text}
                                                    </div>
                                                )}

                                                <span className={`text-[9px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 ${isMe ? 'right-[105%]' : 'left-[105%]'} whitespace-nowrap`}>
                                                    {new Date(m.ts).toLocaleTimeString([], { timeStyle: 'short' })}
                                                </span>

                                                {/* Shared Post code would go here identically */}
                                                {sharedPost && (
                                                    <div
                                                        onClick={() => onNavigate('dashboard', { postId: sharedPost.id })}
                                                        className={`cursor-pointer overflow-hidden rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-[#121212] transition-all hover:border-black/15 dark:hover:border-white/20 hover:shadow-md active:scale-95 group/post mt-2 w-64 ${isMe ? 'self-end' : 'self-start'}`}
                                                    >
                                                        {/* Post preview simplified */}
                                                        <div className="p-3">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getUser(sharedPost.authorId)?.grad} flex items-center justify-center text-[6px] font-black text-white`}>
                                                                    {initials(getUser(sharedPost.authorId)?.name)}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300">{getUser(sharedPost.authorId)?.name}</span>
                                                            </div>
                                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">Pyləşməyə baxın: "{sharedPost.caption}"</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white dark:bg-[#000] border-t border-black/5 dark:border-white/5">
                            <div className="ig-input-pill group focus-within:ring-2 focus-within:ring-brand-500/20">
                                <button className="text-neutral-400 hover:text-brand-500 dark:text-neutral-500 dark:hover:text-brand-400 transition-colors" onClick={() => imageInputRef.current?.click()}>
                                    <Icon icon="mdi:image-outline" className="text-xl" />
                                </button>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSend}
                                />
                                <input
                                    className="flex-1 bg-transparent border-none text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 py-3 px-2 outline-none"
                                    placeholder={tab === 'projects' ? t('messages.messagePlaceholder') + ' (Qrup)' : t('messages.messagePlaceholder')}
                                    value={msgText}
                                    onChange={(e) => setMsgText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button
                                    onClick={handleSend}
                                    className={`transition-colors p-2 rounded-xl ${msgText.trim() ? 'text-white bg-brand-500 hover:bg-brand-600 scale-100' : 'text-neutral-300 dark:text-neutral-600 bg-transparent scale-90'}`}
                                    disabled={!msgText.trim()}
                                >
                                    <Icon icon="mdi:send" className="text-lg" />
                                </button>
                            </div>
                        </div>

                        {/* Manage Team Drawer */}
                        {showManageTeam && tab === 'projects' && selectedProjectConvo && (
                            <div className="absolute right-0 top-16 bottom-0 w-80 bg-white dark:bg-[#0a0a0a] border-l border-black/8 dark:border-white/5 shadow-2xl z-20 anim-up flex flex-col">
                                <div className="p-5 border-b border-black/8 dark:border-white/5 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                        <Icon icon="mdi:account-group" className="text-brand-500" /> Komanda ({selectedProjectConvo.project.applicants?.filter(a => (typeof a === 'object' ? a.status : 'pending') === 'accepted').length + 1})
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {selectedProjectConvo.project.authorId === currentUser?.id && (
                                            <button
                                                onClick={() => setShowAddMember(true)}
                                                className="px-2.5 py-1.5 flex items-center gap-1.5 bg-brand-500/10 hover:bg-brand-500 text-brand-500 hover:text-white rounded-lg text-xs font-bold transition-colors"
                                                title="Üzv Əlavə Et"
                                            >
                                                <Icon icon="mdi:account-plus-outline" className="text-sm" /> Üzv Əlavə Et
                                            </button>
                                        )}
                                        <button onClick={() => setShowManageTeam(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                            <Icon icon="mdi:close" className="text-xl" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {/* Author */}
                                    {(() => {
                                        const author = getUser(selectedProjectConvo.project.authorId);
                                        return author && (
                                            <div className="flex items-center justify-between p-3 rounded-xl border border-brand-500/20 bg-brand-500/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-brand-500/30">
                                                        {author.avatar ? <img src={author.avatar} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${author.grad} flex items-center justify-center text-[10px] font-bold text-white`}>{initials(author.name)}</div>}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white">{author.name}</h4>
                                                        <p className="text-[9px] font-bold text-brand-500 uppercase tracking-widest mt-0.5">Admin</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Applicants */}
                                    {selectedProjectConvo.project.applicants?.map(app => {
                                        const appStatus = typeof app === 'object' ? app.status : 'pending';
                                        if (appStatus !== 'accepted') return null;

                                        const appId = typeof app === 'object' ? app.id : app;
                                        const user = getUser(appId);
                                        if (!user) return null;

                                        return (
                                            <div key={appId} className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors group">
                                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('profile', { userId: appId })}>
                                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-black/5 dark:border-white/5">
                                                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${user.grad} flex items-center justify-center text-[10px] font-bold text-white`}>{initials(user.name)}</div>}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-brand-500 transition-colors">{user.name}</h4>
                                                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">{user.field}</p>
                                                    </div>
                                                </div>
                                                {selectedProjectConvo.project.authorId === currentUser?.id && (
                                                    <button
                                                        onClick={() => handleRemoveMember(appId)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Qrupdan çıxar"
                                                    >
                                                        <Icon icon="mdi:account-remove-outline" className="text-sm" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {selectedProjectConvo.project.authorId !== currentUser?.id && (
                                    <div className="p-4 border-t border-black/8 dark:border-white/5">
                                        <button
                                            onClick={handleLeaveGroup}
                                            className="w-full py-3 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-colors active:scale-95"
                                        >
                                            <Icon icon="mdi:exit-run" className="text-base" />
                                            Qrupdan Çıx
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="hidden md:flex flex-1 p-6">
                        <EmptyState 
                            icon={tab === 'projects' ? 'mdi:folder-account-outline' : 'mdi:chat-processing-outline'}
                            title={tab === 'projects' ? 'Layihə Qrupları' : t('messages.emptyTitle')}
                            description={tab === 'projects' ? 'Layihələrinizə müraciət edən və qəbul olunmuş komanda yoldaşlarınızla ortaq qrup çatları burada görünəcək.' : t('messages.emptyDesc')}
                            actionLabel={tab === 'personal' ? 'Kəşf Et' : 'Layihə Yarat'}
                            onAction={() => onNavigate('discover')}
                        />
                    </div>
                )}
            </div>
        </div>
        {showAddMember && selectedProjectConvo && (
            <AddMemberModal
                projectId={selectedProjectId}
                currentMembers={selectedProjectConvo.project.applicants || []}
                adminId={selectedProjectConvo.project.authorId}
                onAdd={handleAddMember}
                onClose={() => { setShowAddMember(false); setAddMemberError(''); }}
                error={addMemberError}
                onClearError={() => setAddMemberError('')}
            />
        )}
        </>
    );
}

