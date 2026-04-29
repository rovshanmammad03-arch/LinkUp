import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { DB, initials } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import CustomSelect from '../common/CustomSelect';

const SUGGESTED_SKILLS = ['Python', 'JavaScript', 'React', 'Figma', 'UI/UX', 'Node.js', 'SMM', 'SEO', 'Flutter', 'Java', 'SQL', 'Photoshop'];
const LEVELS = ['Başlanğıc', 'Orta', 'Qabaqcıl'];

export default function OnboardingModal({ onDone }) {
    const { currentUser, setCurrentUser } = useAuth();
    const [step, setStep] = useState(0);
    const [avatar, setAvatar] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState([]);
    const [skillName, setSkillName] = useState('');
    const [skillLevel, setSkillLevel] = useState('Başlanğıc');
    const avatarRef = useRef();

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('Şəkil 2MB-dan böyük ola bilməz');
            return;
        }

        try {
            const filePath = `${currentUser.id}/avatar_${Date.now()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatar(publicUrl);
        } catch (err) {
            console.error('Onboarding avatar upload error:', err);
            // Fallback: base64
            const reader = new FileReader();
            reader.onload = (ev) => setAvatar(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const addSkill = (name = skillName) => {
        const n = name.trim();
        if (!n || skills.find(s => s.n === n)) return;
        setSkills([...skills, { n, l: skillLevel }]);
        setSkillName('');
    };

    const removeSkill = (name) => setSkills(skills.filter(s => s.n !== name));

    const handleDone = async () => {
        const updates = { avatar, bio, skills, onboardingDone: true };

        // Supabase profiles cədvəlini yenilə (avatar base64 olduğu üçün ayrıca saxlanır)
        try {
            await supabase
                .from('profiles')
                .update({ bio, skills, onboardingDone: true })
                .eq('id', currentUser.id);
        } catch (err) {
            console.error('Supabase onboarding update error:', err);
        }

        // localStorage-ı da sinxronlaşdır (avatar daxil)
        try {
            const users = DB.get('users');
            const updated = users.map(u =>
                u.id === currentUser.id ? { ...u, ...updates } : u
            );
            DB.set('users', updated);
        } catch (err) {
            console.error('localStorage onboarding update error:', err);
        }

        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        onDone();
    };

    const steps = [
        {
            icon: (
                <div
                    className="relative w-24 h-24 mx-auto cursor-pointer group"
                    onClick={() => avatarRef.current?.click()}
                >
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${currentUser?.grad} p-[3px]`}>
                        <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden">
                            {avatar
                                ? <img src={avatar} className="w-full h-full object-cover rounded-full" />
                                : <span className="text-2xl font-bold text-white">{initials(currentUser?.name)}</span>
                            }
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center border-2 border-[#111] group-hover:bg-brand-400 transition-colors">
                        <Icon icon="mdi:camera" className="text-white text-sm" />
                    </div>
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
            ),
            title: 'Profil şəklini yüklə',
            subtitle: 'Opsional — sonra da dəyişə bilərsən',
            content: (
                <div className="mt-5">
                    <label className="text-xs text-neutral-400 mb-1.5 block">Bio</label>
                    <textarea
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-brand-500/50 resize-none"
                        rows={4}
                        placeholder="Özünüz haqqında qısa məlumat yazın..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>
            ),
        },
        {
            icon: (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto text-3xl">
                    🛠️
                </div>
            ),
            title: 'Bacarıqlarını əlavə et',
            subtitle: 'Digərlərin səni tapa bilməsi üçün vacibdir',
            content: (
                <div className="mt-5 space-y-4">
                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-brand-500/50"
                            placeholder="Bacarıq adı"
                            value={skillName}
                            onChange={(e) => setSkillName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <CustomSelect
                            value={skillLevel}
                            onChange={(val) => setSkillLevel(val)}
                            options={LEVELS}
                            className="w-full bg-transparent text-sm text-white focus:outline-none"
                            containerClassName="w-32 shrink-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-brand-500/50 transition-colors"
                        />
                        <button
                            onClick={() => addSkill()}
                            className="w-10 h-10 bg-brand-500 hover:bg-brand-400 rounded-xl flex items-center justify-center transition-colors shrink-0"
                        >
                            <Icon icon="mdi:plus" className="text-white text-xl" />
                        </button>
                    </div>

                    {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {skills.map(s => (
                                <span key={s.n} className="flex items-center gap-1.5 bg-brand-500/20 text-brand-300 text-xs font-medium px-3 py-1.5 rounded-full border border-brand-500/30">
                                    {s.n} · {s.l}
                                    <button onClick={() => removeSkill(s.n)} className="hover:text-white transition-colors">
                                        <Icon icon="mdi:close" className="text-xs" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-2">Təklif olunan</p>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED_SKILLS.filter(s => !skills.find(sk => sk.n === s)).map(s => (
                                <button
                                    key={s}
                                    onClick={() => addSkill(s)}
                                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-neutral-300 hover:border-brand-500/50 hover:text-brand-300 transition-colors"
                                >
                                    + {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            icon: (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mx-auto text-3xl">
                    🚀
                </div>
            ),
            title: 'Hazırsan!',
            subtitle: 'Profilin tamamlandı. İndi bacarıqlı insanları tapa bilərsən.',
            content: (
                <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Icon icon="mdi:check-circle" className="text-green-400 text-xl" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Profil tamamlanıb</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {bio ? 'Bio, ' : ''}{skills.length > 0 ? `${skills.length} bacarıq` : 'Bacarıqlar'} əlavə edilib
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    const current = steps[step];
    const isLast = step === steps.length - 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl anim-up">

                {/* Steps indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === step ? 'w-8 bg-brand-500' : i < step ? 'w-4 bg-green-500' : 'w-4 bg-white/15'
                            }`}
                        />
                    ))}
                </div>

                {/* Icon */}
                <div className="mb-4">{current.icon}</div>

                {/* Title */}
                <div className="text-center mb-1">
                    <h2 className="text-xl font-bold text-white">{current.title}</h2>
                    <p className="text-sm text-neutral-400 mt-1">{current.subtitle}</p>
                </div>

                {/* Content */}
                {current.content}

                {/* Button */}
                <button
                    onClick={isLast ? handleDone : () => setStep(s => s + 1)}
                    className={`w-full mt-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        isLast
                            ? 'bg-gradient-to-r from-brand-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-brand-500/30'
                            : 'bg-white text-black hover:bg-neutral-100'
                    }`}
                >
                    {isLast ? <><Icon icon="mdi:rocket-launch-outline" /> Platformaya Başla</> : <>Davam Et <Icon icon="mdi:arrow-right" /></>}
                </button>

                {/* Skip */}
                {!isLast && (
                    <button
                        onClick={() => setStep(s => s + 1)}
                        className="w-full mt-3 text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-1"
                    >
                        Keç
                    </button>
                )}
            </div>
        </div>
    );
}
