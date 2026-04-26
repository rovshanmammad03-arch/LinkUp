import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

// ─── Testimonials data builder ────────────────────────────────────────────────
function buildTestimonials(t) {
  return [
    {
      name: t('landing.testimonials.t1.name'),
      role: t('landing.testimonials.t1.role'),
      quote: t('landing.testimonials.t1.quote'),
      avatarGradient: 'from-brand-500 to-purple-500',
      initials: 'AH',
      rating: 5,
    },
    {
      name: t('landing.testimonials.t2.name'),
      role: t('landing.testimonials.t2.role'),
      quote: t('landing.testimonials.t2.quote'),
      avatarGradient: 'from-cyan-500 to-emerald-500',
      initials: 'RƏ',
      rating: 5,
    },
    {
      name: t('landing.testimonials.t3.name'),
      role: t('landing.testimonials.t3.role'),
      quote: t('landing.testimonials.t3.quote'),
      avatarGradient: 'from-amber-500 to-rose-500',
      initials: 'NQ',
      rating: 5,
    },
  ];
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function Landing({ onNavigate }) {
  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate]');

    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div id="landingPage" className="bg-[#050505] min-h-screen bg-grid-pattern">
      <HeroSection onNavigate={onNavigate} scrollToSection={scrollToSection} />
      <StatsBar />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection onNavigate={onNavigate} />
      <Footer onNavigate={onNavigate} scrollToSection={scrollToSection} />
    </div>
  );
}

// ─── HeroSection ──────────────────────────────────────────────────────────────
function HeroSection({ onNavigate, scrollToSection }) {
  const { t } = useTranslation();

  return (
    <section className="relative pt-4 md:pt-6 pb-16 md:pb-24 overflow-hidden bg-[#050505] bg-grid-pattern">
      {/* Glow blobs */}
      <div className="animate-pulse-slow absolute rounded-full blur-[100px] pointer-events-none w-80 h-80 bg-indigo-500/10 top-10 -left-20" />
      <div className="animate-pulse-slow absolute rounded-full blur-[120px] pointer-events-none w-96 h-96 bg-purple-500/8 bottom-0 -right-20" style={{ animationDelay: '3s' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left: text + CTAs */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div data-animate className="inline-flex mb-6 mt-2 md:mt-4">
              <span className="badge flex items-center gap-2 border border-brand-500/30 text-brand-400 bg-brand-500/10 rounded-full px-4 py-1.5 text-xs font-medium">
                <Icon icon="mdi:rocket-launch-outline" className="text-sm" />
                {t('landing.badge')}
              </span>
            </div>

            {/* Headline */}
            <div data-animate data-animate-delay="1">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.2] sm:leading-[1.1] mb-5">
                <span className="text-white">{t('landing.heroTitle1')}</span>
                <br />
                <span className="gradient-text">{t('landing.heroTitle2')}</span>
              </h1>
            </div>

            {/* Subtext */}
            <div data-animate data-animate-delay="2">
              <p className="text-base md:text-lg text-neutral-400 font-light leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10">
                {t('landing.heroDesc')}
              </p>
            </div>

            {/* CTA buttons */}
            <div data-animate data-animate-delay="3" className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
              <button
                onClick={() => onNavigate('register')}
                className="btn-secondary rounded-full flex justify-center items-center gap-2 px-6 sm:px-8 py-3.5 text-sm font-semibold w-full sm:w-auto"
              >
                <Icon icon="mdi:account-plus-outline" className="text-lg shrink-0" />
                {t('landing.freeRegister')}
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="btn-outline rounded-full flex justify-center items-center gap-2 px-6 sm:px-8 py-3.5 text-sm font-semibold bg-white/[0.02] w-full sm:w-auto"
              >
                <Icon icon="mdi:compass-outline" className="text-lg shrink-0" />
                {t('landing.exploreBtn')}
              </button>
            </div>
          </div>

          {/* Right: floating app-preview mockup (desktop only) */}
          <div className="hidden lg:flex flex-shrink-0 items-center justify-center">
            <div className="glass-card bg-[#080808] rounded-2xl p-6 w-72 shadow-2xl border border-white/[0.08]">
              {/* Mini profile header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  RƏ
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">Rauf Əliyev</div>
                  <div className="text-neutral-400 text-xs">Design</div>
                </div>
              </div>

              {/* Skill badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['Figma', 'UI/UX', 'Branding'].map(skill => (
                  <span key={skill} className="text-[11px] px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-medium">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                <div className="text-center">
                  <div className="text-white text-sm font-bold">248</div>
                  <div className="text-neutral-500 text-[10px]">{t('profile.followers')}</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-sm font-bold">12</div>
                  <div className="text-neutral-500 text-[10px]">{t('profile.projects')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── StatsBar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const { t } = useTranslation();

  return (
    <div className="border-y border-white/5 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-animate className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text-animated mb-1">2.4K+</div>
            <div className="text-xs md:text-sm text-neutral-500">{t('landing.users')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text-animated mb-1">180+</div>
            <div className="text-xs md:text-sm text-neutral-500">{t('landing.projects')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text-animated mb-1">35+</div>
            <div className="text-xs md:text-sm text-neutral-500">{t('landing.universities')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FeatureCard ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, color, title, desc }) {
  const colorMap = {
    brand:   { bg: 'bg-brand-500/10',   border: 'border-brand-500/20',   text: 'text-brand-400' },
    purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400' },
    cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400' },
    rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-400' },
  };
  const style = colorMap[color] || colorMap.brand;

  return (
    <div className="glass-card rounded-2xl p-7 flex flex-col items-start bg-[#080808] border-white/[0.08] hover:-translate-y-1 hover:border-white/20 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center mb-5 hover:scale-110 transition-transform duration-300`}>
        <Icon icon={icon} className={`${style.text} text-2xl`} />
      </div>
      <h3 className="text-sm md:text-base font-semibold mb-2 text-white">{title}</h3>
      <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── FeaturesSection ──────────────────────────────────────────────────────────
function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-20 sm:py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="badge mb-4 inline-flex gap-2 border border-brand-500/30 text-brand-400 bg-brand-500/10 rounded-full px-4 py-1.5 text-xs font-medium">
            <Icon icon="mdi:star-four-points-outline" />
            {t('nav.features')}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-white">
            {t('landing.whyLinkUpPrefix')} <span className="gradient-text">LinkUp</span>?
          </h2>
          <p className="text-neutral-400 font-light max-w-xl mx-auto">{t('landing.notJustSocial')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div data-animate data-animate-delay="1">
            <FeatureCard icon="mdi:account-search-outline"      color="brand"   title={t('landing.features.skillSearch')}  desc={t('landing.features.skillSearchDesc')} />
          </div>
          <div data-animate data-animate-delay="2">
            <FeatureCard icon="mdi:card-account-details-outline" color="purple"  title={t('landing.features.profile')}      desc={t('landing.features.profileDesc')} />
          </div>
          <div data-animate data-animate-delay="3">
            <FeatureCard icon="mdi:message-text-outline"         color="cyan"    title={t('landing.features.messaging')}    desc={t('landing.features.messagingDesc')} />
          </div>
          <div data-animate data-animate-delay="4">
            <FeatureCard icon="mdi:monitor-dashboard"            color="emerald" title={t('landing.features.projects')}     desc={t('landing.features.projectsDesc')} />
          </div>
          <div data-animate data-animate-delay="5">
            <FeatureCard icon="mdi:school-outline"               color="amber"   title={t('landing.features.university')}   desc={t('landing.features.universityDesc')} />
          </div>
          <div data-animate data-animate-delay="6">
            <FeatureCard icon="mdi:shield-check-outline"         color="rose"    title={t('landing.features.safe')}         desc={t('landing.features.safeDesc')} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── StepNode ─────────────────────────────────────────────────────────────────
function StepNode({ number, color, title, desc, isLast }) {
  const colorMap = {
    brand:   { bg: 'bg-brand-500/10',   text: 'text-brand-400',   border: 'border-brand-500/30' },
    purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/30' },
    cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/30' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30' },
  };
  const style = colorMap[color] || colorMap.brand;

  return (
    <>
      {/* Desktop node */}
      <div className="hidden md:flex flex-col items-center text-center w-32">
        <div className={`w-12 h-12 rounded-full ${style.bg} border ${style.border} flex items-center justify-center mb-3 flex-shrink-0`}>
          <span className={`${style.text} font-bold text-sm`}>{number}</span>
        </div>
        <div className="text-white text-sm font-semibold mb-1">{title}</div>
        <div className="text-neutral-500 text-[11px] uppercase tracking-widest">{desc}</div>
      </div>
      {isLast === false && <div className="timeline-connector hidden md:block" />}

      {/* Mobile node */}
      <div className="flex md:hidden items-center gap-4">
        <div className={`w-10 h-10 rounded-full ${style.bg} border ${style.border} flex items-center justify-center flex-shrink-0`}>
          <span className={`${style.text} font-bold text-sm`}>{number}</span>
        </div>
        <div>
          <div className="text-white text-sm font-semibold">{title}</div>
          <div className="text-neutral-500 text-xs">{desc}</div>
        </div>
      </div>
    </>
  );
}

// ─── HowItWorksSection ────────────────────────────────────────────────────────
function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    { number: '1', color: 'brand',   title: t('landing.steps.register'), desc: t('landing.steps.registerDesc') },
    { number: '2', color: 'purple',  title: t('landing.steps.profile'),  desc: t('landing.steps.profileDesc') },
    { number: '3', color: 'cyan',    title: t('landing.steps.discover'), desc: t('landing.steps.discoverDesc') },
    { number: '4', color: 'emerald', title: t('landing.steps.connect'),  desc: t('landing.steps.connectDesc') },
    { number: '5', color: 'amber',   title: t('landing.steps.create'),   desc: t('landing.steps.createDesc') },
  ];

  return (
    <section id="how" className="py-20 sm:py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="badge mb-4 inline-flex gap-2 border border-brand-500/30 text-brand-400 bg-brand-500/10 rounded-full px-4 py-1.5 text-xs font-medium">
            <Icon icon="mdi:lightning-bolt-outline" />
            {t('nav.howItWorks')}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-white">
            {t('landing.howItWorksPrefix')} <span className="gradient-text">{t('landing.howItWorksSuffix')}</span>?
          </h2>
        </div>

        {/* Desktop: horizontal timeline */}
        <div data-animate className="hidden md:flex items-center justify-center gap-0">
          {steps.map((step, i) => (
            <StepNode
              key={step.number}
              number={step.number}
              color={step.color}
              title={step.title}
              desc={step.desc}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

        {/* Mobile: vertical stack */}
        <div data-animate className="flex md:hidden flex-col gap-6">
          {steps.map((step, i) => (
            <StepNode
              key={step.number}
              number={step.number}
              color={step.color}
              title={step.title}
              desc={step.desc}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TestimonialCard ──────────────────────────────────────────────────────────
function TestimonialCard({ name, role, quote, avatarGradient, initials, rating }) {
  return (
    <div className="glass-card rounded-2xl p-6 bg-[#080808] border-white/[0.08] flex flex-col gap-4">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {initials}
        </div>
        <div>
          <div className="text-white text-sm font-semibold">{name}</div>
          <div className="text-neutral-500 text-xs">{role}</div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: rating }).map((_, i) => (
          <Icon key={i} icon="mdi:star" className="text-amber-400 text-sm" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-neutral-300 text-sm leading-relaxed">{quote}</p>
    </div>
  );
}

// ─── TestimonialsSection ──────────────────────────────────────────────────────
function TestimonialsSection() {
  const { t } = useTranslation();
  const testimonials = buildTestimonials(t);

  return (
    <section id="testimonials" className="py-20 sm:py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            {t('landing.testimonialsTitle')}
          </h2>
        </div>

        {/* Responsive grid for all screen sizes */}
        <div data-animate className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((item, i) => (
            <TestimonialCard key={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTASection ───────────────────────────────────────────────────────────────
function CTASection({ onNavigate }) {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div data-animate className="rounded-[2rem] p-6 sm:p-12 text-center relative overflow-hidden bg-[#0A0A0A] border border-white/5 shadow-2xl">
          {/* Centered radial glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-[60px] pointer-events-none" />

          {/* Decorative floating dots */}
          <div className="animate-float absolute top-8 left-12 w-2 h-2 rounded-full bg-brand-500/40" style={{ animationDelay: '0s' }} />
          <div className="animate-float absolute top-16 right-16 w-1.5 h-1.5 rounded-full bg-purple-500/40" style={{ animationDelay: '1.5s' }} />
          <div className="animate-float absolute bottom-10 left-1/3 w-2 h-2 rounded-full bg-cyan-500/30" style={{ animationDelay: '3s' }} />

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight relative z-10">
            {t('landing.readyJoin')} <span className="gradient-text">{t('landing.readyJoinHighlight')}</span>
          </h2>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto relative z-10 font-light text-sm">
            {t('landing.readyDesc')}
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="btn-primary relative z-10 flex items-center justify-center gap-2 mx-auto px-6 sm:px-8 py-3.5 rounded-full text-sm sm:text-base font-semibold border-none cursor-pointer w-full sm:w-auto"
          >
            <Icon icon="mdi:account-plus" className="shrink-0" />
            {t('landing.registerNow')}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onNavigate, scrollToSection }) {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/5 py-12 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Three-column desktop layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Left: logo + tagline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                <Icon icon="mdi:link-variant" className="text-white text-base" />
              </div>
              <span className="font-semibold text-white">LinkUp</span>
            </div>
            <p className="text-neutral-500 text-sm font-light">{t('landing.footerTagline')}</p>
          </div>

          {/* Center: quick links */}
          <div className="flex flex-col gap-3">
            <div className="text-white text-sm font-semibold mb-1">{t('landing.footerLinks')}</div>
            <button
              onClick={() => scrollToSection('features')}
              className="text-neutral-500 text-sm hover:text-white transition-colors text-left"
            >
              {t('nav.features')}
            </button>
            <button
              onClick={() => scrollToSection('how')}
              className="text-neutral-500 text-sm hover:text-white transition-colors text-left"
            >
              {t('nav.howItWorks')}
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="text-neutral-500 text-sm hover:text-white transition-colors text-left"
            >
              {t('nav.register')}
            </button>
          </div>

          {/* Right: social icons */}
          <div className="flex flex-col gap-3">
            <div className="text-white text-sm font-semibold mb-1">{t('landing.footerSocial')}</div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-all"
              >
                <Icon icon="mdi:github" className="text-lg" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-all"
              >
                <Icon icon="mdi:linkedin" className="text-lg" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-all"
              >
                <Icon icon="mdi:instagram" className="text-lg" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex items-center justify-center">
          <p className="text-[11px] text-neutral-600 tracking-wide">{t('landing.footer')} 🇦🇿</p>
        </div>
      </div>
    </footer>
  );
}
