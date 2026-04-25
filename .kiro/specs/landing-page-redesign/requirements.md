# Requirements Document

## Introduction

This document defines the requirements for the LinkUp landing page redesign. The redesign elevates the existing `src/pages/Landing.jsx` from a functional but minimal page to a premium, animated, multi-section experience targeting Azerbaijani university students. The page must communicate trust, value, and momentum while remaining fully within the existing tech stack (React + Vite, Tailwind CSS v4, `@iconify/react`, `react-i18next`) and the custom `onNavigate` routing system.

The redesigned page introduces seven distinct sections — Hero, StatsBar, Features, HowItWorks, Testimonials, CTA, and Footer — with a CSS-only scroll animation system, enriched i18n coverage across all four locales, and no new external dependencies.

---

## Glossary

- **Landing**: The `Landing.jsx` React component rendered by `App.jsx` when no user is authenticated.
- **HeroSection**: The full-viewport opening section containing the headline, subtext, and primary CTAs.
- **StatsBar**: The horizontal strip of three key platform metrics displayed below the Hero.
- **FeaturesSection**: The six-card grid section explaining platform capabilities.
- **HowItWorksSection**: The five-step visual timeline section explaining the user journey.
- **TestimonialsSection**: The three-card social proof section with mock testimonials.
- **CTASection**: The final conversion section with a prominent registration call-to-action.
- **Footer**: The bottom section containing logo, navigation links, social links, and copyright.
- **FeatureCard**: A sub-component rendering a single feature with icon, title, and description.
- **StepNode**: A sub-component rendering a single step in the HowItWorks timeline.
- **TestimonialCard**: A sub-component rendering a single testimonial with avatar, name, role, stars, and quote.
- **IntersectionObserver**: The browser Web API used to trigger scroll-based entrance animations.
- **data-animate**: The HTML attribute applied to elements that should animate on scroll entry.
- **is-visible**: The CSS class added by the IntersectionObserver callback to trigger entrance animations.
- **onNavigate**: The routing function prop passed from `App.jsx` to `Landing`, used for all in-app navigation.
- **i18n**: Internationalization system powered by `react-i18next` with locale files for `az`, `en`, `ru`, `tr`.
- **Locale**: One of the four supported language files: Azerbaijani (`az`), English (`en`), Russian (`ru`), Turkish (`tr`).
- **CTA**: Call-to-action — a button or link prompting the user to register.
- **gradient-text**: The existing CSS utility class applying an indigo-to-purple-to-cyan gradient to text.
- **glass-card**: The existing CSS utility class applying a frosted-glass card style.

---

## Requirements

### Requirement 1: Page Structure and Section Rendering

**User Story:** As a prospective user visiting the landing page, I want to see a complete, well-structured page with all content sections, so that I can understand the platform's value and decide to register.

#### Acceptance Criteria

1. WHEN the Landing component renders, THE Landing SHALL display all seven sections in the following order: HeroSection, StatsBar, FeaturesSection, HowItWorksSection, TestimonialsSection, CTASection, Footer.
2. THE FeaturesSection SHALL be reachable via a scroll target with `id="features"`.
3. THE HowItWorksSection SHALL be reachable via a scroll target with `id="how"`.
4. THE TestimonialsSection SHALL be reachable via a scroll target with `id="testimonials"`.
5. WHEN the "Explore Platform" button in the HeroSection is clicked, THE Landing SHALL scroll the viewport to the element with `id="features"` using smooth scroll behavior.
6. IF the scroll target element does not exist in the DOM, THEN THE Landing SHALL take no action and SHALL NOT throw an error.

---

### Requirement 2: Hero Section

**User Story:** As a prospective user, I want to see a compelling hero section with a clear headline and registration CTAs, so that I immediately understand what LinkUp offers and can sign up.

#### Acceptance Criteria

1. THE HeroSection SHALL display a badge pill, a two-line headline, a subtext paragraph, and two CTA buttons ("Sign Up Free" and "Explore Platform").
2. WHEN the "Sign Up Free" button in the HeroSection is clicked, THE Landing SHALL call `onNavigate` with `'register'` as the first argument.
3. THE HeroSection SHALL display two decorative radial glow blobs using the `animate-pulse-slow` CSS animation class.
4. THE HeroSection headline SHALL render the first line in plain white text and the second line using the `gradient-text` CSS class.
5. THE HeroSection SHALL use the `bg-grid-pattern` CSS class on its background container.

---

### Requirement 3: Stats Bar

**User Story:** As a prospective user, I want to see key platform metrics immediately below the hero, so that I can quickly gauge the platform's scale and credibility.

#### Acceptance Criteria

1. THE StatsBar SHALL display exactly three metrics: active user count (2.4K+), project count (180+), and university count (35+).
2. THE StatsBar SHALL render each metric number using the `gradient-text` CSS class and each label using the existing `landing.users`, `landing.projects`, and `landing.universities` i18n keys.
3. THE StatsBar SHALL be visually separated from adjacent sections using top and bottom border styling (`border-white/5`).
4. WHILE the viewport width is below 768px, THE StatsBar SHALL arrange the three metrics in a three-column grid layout.

---

### Requirement 4: Features Section

**User Story:** As a prospective user, I want to see a clear overview of platform features, so that I can understand what makes LinkUp valuable before registering.

#### Acceptance Criteria

1. THE FeaturesSection SHALL render exactly six FeatureCard components, one for each feature: Skill-Based Search, Profile & Portfolio, Direct Communication, Project Listings, University Independent, and Safe Platform.
2. THE FeaturesSection SHALL display a section badge and a heading using the `landing.whyLinkUpPrefix` i18n key followed by the brand name "LinkUp".
3. WHEN a valid `color` prop from the set `{brand, purple, cyan, emerald, amber, rose}` is provided to FeatureCard, THE FeatureCard SHALL apply the corresponding background, border, and text color CSS classes to the icon container.
4. IF an unrecognized `color` prop is passed to FeatureCard, THEN THE FeatureCard SHALL fall back to the `brand` color variant and SHALL NOT throw an error.
5. THE FeatureCard SHALL render the provided `icon`, `title`, and `desc` prop values in the card body.
6. WHEN a FeatureCard is hovered, THE FeatureCard SHALL apply a brightened border style (`hover:border-white/20`) and an upward lift transform (`hover:-translate-y-1`).
7. WHILE the viewport width is 1024px or above, THE FeaturesSection SHALL arrange FeatureCards in a three-column grid layout.
8. WHILE the viewport width is between 768px and 1023px, THE FeaturesSection SHALL arrange FeatureCards in a two-column grid layout.

---

### Requirement 5: How It Works Section

**User Story:** As a prospective user, I want to see a clear step-by-step explanation of how to get started, so that I understand the onboarding process and feel confident signing up.

#### Acceptance Criteria

1. THE HowItWorksSection SHALL render exactly five StepNode components numbered 1 through 5, representing: Register, Create Profile, Discover, Connect, and Create Together.
2. THE HowItWorksSection SHALL display a section badge and a heading using the `landing.howItWorksPrefix` and `landing.howItWorksSuffix` i18n keys.
3. WHEN `isLast` is `false` on a StepNode, THE StepNode SHALL render a connector line element between itself and the next step.
4. WHEN `isLast` is `true` on a StepNode, THE StepNode SHALL NOT render a connector line element.
5. WHILE the viewport width is 1024px or above, THE HowItWorksSection SHALL display the five steps in a horizontal layout with connector lines between them.
6. WHILE the viewport width is below 768px, THE HowItWorksSection SHALL display the five steps in a vertical stacked layout.

---

### Requirement 6: Testimonials Section

**User Story:** As a prospective user, I want to read testimonials from other students, so that I can trust the platform and feel motivated to join.

#### Acceptance Criteria

1. THE TestimonialsSection SHALL render exactly three TestimonialCard components using mock data for three fictional Azerbaijani university students.
2. THE TestimonialsSection SHALL display a section heading using the `landing.testimonialsTitle` i18n key.
3. WHEN a `rating` integer between 1 and 5 is provided to TestimonialCard, THE TestimonialCard SHALL render exactly `rating` filled star icon elements.
4. THE TestimonialCard SHALL display the avatar as a gradient circle containing the `initials` prop value, the `name`, the `role`, the star rating, and the `quote` text.
5. THE TestimonialCard SHALL apply the `avatarGradient` Tailwind gradient classes to the avatar circle element.
6. WHILE the viewport width is below 768px, THE TestimonialsSection SHALL support horizontal scrolling with snap behavior for the card row.
7. WHILE the viewport width is 1024px or above, THE TestimonialsSection SHALL arrange the three cards in a three-column grid layout.

---

### Requirement 7: CTA Section

**User Story:** As a prospective user who has scrolled through the page, I want to see a final compelling call-to-action, so that I am prompted to register at the end of my browsing session.

#### Acceptance Criteria

1. THE CTASection SHALL display a large heading using the `landing.readyJoin` and `landing.readyJoinHighlight` i18n keys, a subtext paragraph, and a single registration button.
2. WHEN the "Register Now" button in the CTASection is clicked, THE Landing SHALL call `onNavigate` with `'register'` as the first argument.
3. THE CTASection SHALL render a centered radial glow element behind the heading text.
4. THE CTASection SHALL render decorative floating dot elements using the `animate-float` CSS animation class.
5. THE CTASection container SHALL use a rounded card style (`rounded-[2rem]`) with `bg-[#0A0A0A]` background and `border border-white/5` border.

---

### Requirement 8: Footer

**User Story:** As a user at the bottom of the landing page, I want to see a complete footer with navigation links and social links, so that I can easily navigate or follow LinkUp on social media.

#### Acceptance Criteria

1. THE Footer SHALL display the LinkUp logo with icon, a tagline using the `landing.footerTagline` i18n key, quick navigation links (Features, How It Works, Sign Up), social icon links, and a copyright bar using the `landing.footer` i18n key.
2. THE Footer SHALL render all external social links (GitHub, LinkedIn, Instagram) with `target="_blank"` and `rel="noopener noreferrer"` attributes.
3. WHILE the viewport width is 1024px or above, THE Footer SHALL arrange its content in a three-column layout (logo/tagline, quick links, social links).
4. WHILE the viewport width is below 768px, THE Footer SHALL stack its content vertically.
5. THE Footer SHALL be visually separated from the CTASection using a top border (`border-t border-white/5`).

---

### Requirement 9: Scroll Animation System

**User Story:** As a user scrolling through the landing page, I want to see smooth entrance animations as sections come into view, so that the page feels polished and engaging.

#### Acceptance Criteria

1. WHEN the Landing component mounts, THE Landing SHALL initialize an IntersectionObserver that observes all elements with the `data-animate` attribute.
2. WHEN an observed element enters the viewport, THE IntersectionObserver callback SHALL add the `is-visible` CSS class to that element.
3. WHEN the `is-visible` class has been added to an element, THE IntersectionObserver SHALL call `unobserve` on that element so the animation triggers exactly once.
4. WHEN the Landing component unmounts, THE Landing SHALL disconnect the IntersectionObserver to prevent memory leaks.
5. IF the browser does not support IntersectionObserver, THEN THE Landing SHALL immediately add the `is-visible` class to all `data-animate` elements so content remains visible.
6. THE CSS for `[data-animate]` elements SHALL set initial state to `opacity: 0` and `transform: translateY(20px)`, and the `[data-animate].is-visible` state SHALL set `opacity: 1` and `transform: translateY(0)`.
7. THE CSS SHALL provide staggered animation delay classes (`data-animate-delay` attribute values 1–5) with delays of 0.1s through 0.5s respectively.

---

### Requirement 10: CSS Animation Utilities

**User Story:** As a developer implementing the redesign, I want all animations to be CSS-only utilities added to `src/index.css`, so that the bundle remains lean with no additional JavaScript animation libraries.

#### Acceptance Criteria

1. THE `src/index.css` file SHALL define a `pulse-slow` keyframe animation and an `animate-pulse-slow` utility class for the hero background glow blobs, cycling between 60% and 100% opacity over 6 seconds.
2. THE `src/index.css` file SHALL define a `float` keyframe animation and an `animate-float` utility class for the CTA section decorative dots, translating vertically by 12px over 4 seconds.
3. THE `src/index.css` file SHALL define a `shimmer` keyframe animation and a `gradient-text-animated` utility class for animated gradient text on stats numbers.
4. THE `src/index.css` file SHALL define a `timeline-connector` CSS class for the HowItWorks horizontal connector line using a dashed gradient border.
5. THE `src/index.css` file SHALL NOT introduce any new external CSS dependencies or `@import` statements beyond those already present.

---

### Requirement 11: Internationalization

**User Story:** As a user browsing the landing page in any of the four supported languages (Azerbaijani, English, Russian, Turkish), I want to see all content correctly translated, so that the page is accessible to the full target audience.

#### Acceptance Criteria

1. THE Landing component SHALL use the `useTranslation` hook for all rendered text and SHALL NOT contain hardcoded English strings in JSX output.
2. THE locale files for all four languages (`az`, `en`, `ru`, `tr`) SHALL contain the following new translation keys under the `landing` namespace: `testimonialsTitle`, `testimonials.t1.name`, `testimonials.t1.role`, `testimonials.t1.quote`, `testimonials.t2.name`, `testimonials.t2.role`, `testimonials.t2.quote`, `testimonials.t3.name`, `testimonials.t3.role`, `testimonials.t3.quote`, `footerTagline`, `footerLinks`, `footerSocial`, `stepsTitle`.
3. FOR ALL four locale codes, every required `landing.*` translation key SHALL resolve to a non-empty string.
4. THE existing `landing.*` translation keys SHALL be preserved without modification; only additive changes SHALL be made to locale files.
5. IF a translation key is missing from a locale file, THEN THE Landing component SHALL display the key string as a fallback (via `react-i18next` default behavior) without throwing an error.

---

### Requirement 12: Navigation Architecture

**User Story:** As a developer maintaining the codebase, I want the landing page to use only the `onNavigate` prop for all navigation, so that the routing system remains consistent and no React Router dependency is introduced.

#### Acceptance Criteria

1. THE Landing component SHALL accept an `onNavigate` prop with the signature `(route: string, params?: object, clearHistory?: boolean) => void`.
2. WHEN any CTA button on the landing page is clicked, THE Landing SHALL call `onNavigate` with `'register'` as the route argument and SHALL NOT pass `null` or `undefined` as the route.
3. THE Landing component SHALL contain zero imports from `react-router-dom`.
4. THE Landing component SHALL use the `onNavigate` prop exclusively for all programmatic navigation actions.
