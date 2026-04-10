import React from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

export default function Landing({ onNavigate }) {
    const { t } = useTranslation();

    return (
        <div id="landingPage" className="bg-[#050505] min-h-screen bg-grid-pattern">
            <section className="relative pt-20 md:pt-28 pb-20 md:pb-32 overflow-hidden">
                <div className="absolute rounded-full blur-[80px] pointer-events-none w-72 h-72 bg-brand-500/10 top-20 -left-20"></div>
                <div className="absolute rounded-full blur-[80px] pointer-events-none w-96 h-96 bg-purple-500/5 bottom-0 right-0" style={{ animationDelay: '2s' }}></div>
                <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex mb-6 mt-8 md:mt-12">
                        <span className="badge flex items-center gap-2 border border-brand-500/30 text-brand-400 bg-brand-500/10 rounded-full px-4 py-1.5 text-xs font-medium">
                            <Icon icon="mdi:rocket-launch-outline" className="text-sm" />
                            {t('landing.badge')}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-5">
                        <span className="text-white">{t('landing.heroTitle1')}</span><br />
                        <span className="gradient-text">{t('landing.heroTitle2')}</span>
                    </h1>
                    <p className="text-base md:text-lg text-neutral-400 font-light leading-relaxed max-w-3xl mx-auto mb-10">
                        {t('landing.heroDesc')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 cursor-pointer">
                        <button onClick={() => onNavigate('register')} className="btn-secondary rounded-full flex items-center gap-2 px-8 py-3.5 text-sm font-semibold">
                            <Icon icon="mdi:account-plus-outline" className="text-lg" /> {t('landing.freeRegister')}
                        </button>
                        <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline rounded-full flex items-center gap-2 px-8 py-3.5 text-sm font-semibold bg-white/[0.02]">
                            <Icon icon="mdi:compass-outline" className="text-lg" /> {t('landing.exploreBtn')}
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-8 md:gap-4 max-w-2xl mx-auto mb-10">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">2.4K+</div>
                            <div className="text-xs md:text-sm text-neutral-500">{t('landing.users')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">180+</div>
                            <div className="text-xs md:text-sm text-neutral-500">{t('landing.projects')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">35+</div>
                            <div className="text-xs md:text-sm text-neutral-500">{t('landing.universities')}</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-24 relative">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <span className="badge mb-4 inline-flex gap-2 border border-brand-500/30 text-brand-400 bg-brand-500/10 rounded-full px-4 py-1.5 text-xs font-medium">
                            <Icon icon="mdi:star-four-points-outline" /> {t('nav.features')}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-white">{t('landing.whyLinkUpPrefix')} <span className="gradient-text">LinkUp</span>?</h2>
                        <p className="text-neutral-400 font-light max-w-xl mx-auto">{t('landing.notJustSocial')}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard icon="mdi:account-search-outline" color="brand"   title={t('landing.features.skillSearch')}    desc={t('landing.features.skillSearchDesc')} />
                        <FeatureCard icon="mdi:card-account-details-outline" color="purple" title={t('landing.features.profile')}   desc={t('landing.features.profileDesc')} />
                        <FeatureCard icon="mdi:message-text-outline" color="cyan"      title={t('landing.features.messaging')}      desc={t('landing.features.messagingDesc')} />
                        <FeatureCard icon="mdi:monitor-dashboard" color="emerald"      title={t('landing.features.projects')}       desc={t('landing.features.projectsDesc')} />
                        <FeatureCard icon="mdi:school-outline" color="amber"           title={t('landing.features.university')}     desc={t('landing.features.universityDesc')} />
                        <FeatureCard icon="mdi:shield-check-outline" color="rose"      title={t('landing.features.safe')}           desc={t('landing.features.safeDesc')} />
                    </div>
                </div>
            </section>

            <section id="how" className="py-24 relative">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <span className="badge mb-4 inline-flex gap-2 border border-brand-500/30 text-brand-400 bg-brand-500/10 rounded-full px-4 py-1.5 text-xs font-medium">
                            <Icon icon="mdi:lightning-bolt-outline" /> {t('nav.howItWorks')}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-white">{t('landing.howItWorksPrefix')} <span className="gradient-text">{t('landing.howItWorksSuffix')}</span>?</h2>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        <StepCard number="1" color="brand"   title={t('landing.steps.register')} desc={t('landing.steps.registerDesc')} />
                        <StepCard number="2" color="purple"  title={t('landing.steps.profile')}  desc={t('landing.steps.profileDesc')} />
                        <StepCard number="3" color="cyan"    title={t('landing.steps.discover')} desc={t('landing.steps.discoverDesc')} />
                        <StepCard number="4" color="emerald" title={t('landing.steps.connect')}  desc={t('landing.steps.connectDesc')} />
                        <StepCard number="5" color="amber"   title={t('landing.steps.create')}   desc={t('landing.steps.createDesc')} />
                    </div>
                </div>
            </section>

            <section className="py-20 relative">
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <div className="rounded-[2rem] p-12 text-center relative overflow-hidden bg-[#0A0A0A] border border-white/5 shadow-2xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight relative z-10">
                            {t('landing.readyJoin')} <span className="gradient-text">{t('landing.readyJoinHighlight')}</span>
                        </h2>
                        <p className="text-neutral-400 mb-8 max-w-md mx-auto relative z-10 font-light text-sm">
                            {t('landing.readyDesc')}
                        </p>
                        <button onClick={() => onNavigate('register')} className="btn-primary relative z-10 flex items-center justify-center gap-2 mx-auto px-8 py-3.5 rounded-full text-base font-semibold border-none cursor-pointer">
                            <Icon icon="mdi:account-plus" /> {t('landing.registerNow')}
                        </button>
                    </div>
                </div>
            </section>

            <footer className="border-t border-white/5 py-10 mt-10 relative z-10">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                            <Icon icon="mdi:link-variant" className="text-white text-sm" />
                        </div>
                        <span className="font-semibold text-sm text-white">LinkUp</span>
                    </div>
                    <p className="text-[10px] text-neutral-600 tracking-wide">{t('landing.footer')} 🇦🇿</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, color, title, desc }) {
    const colorStyles = {
        brand:   { bg: 'bg-brand-500/10',   border: 'border-brand-500/20',   text: 'text-brand-400' },
        purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400' },
        cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
        amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400' },
        rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-400' },
    };
    const style = colorStyles[color] || colorStyles.brand;

    return (
        <div className="glass-card rounded-2xl p-7 flex flex-col items-start bg-[#080808] border-white/[0.08] hover:border-white/20 transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center mb-5`}>
                <Icon icon={icon} className={`${style.text} text-2xl`} />
            </div>
            <h3 className="text-sm md:text-base font-semibold mb-2 text-white">{title}</h3>
            <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed">{desc}</p>
        </div>
    );
}

function StepCard({ number, color, title, desc }) {
    const colorStyles = {
        brand:   { bg: 'bg-brand-500/10',   text: 'text-brand-400',   border: 'border-brand-500/30' },
        purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/30' },
        cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/30' },
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
        amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30' },
    };
    const style = colorStyles[color] || colorStyles.brand;

    return (
        <div className="glass-card rounded-2xl w-40 p-6 flex flex-col items-center justify-center text-center bg-[#080808] border-white/[0.08] hover:border-white/20 transition-all shadow-xl">
            <div className={`w-10 h-10 rounded-full ${style.bg} border ${style.border} flex items-center justify-center mb-4`}>
                <span className={`${style.text} font-bold text-sm`}>{number}</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{desc}</p>
        </div>
    );
}
