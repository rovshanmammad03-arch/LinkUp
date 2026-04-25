# Implementation Plan: Landing Page Redesign

## Overview

Incrementally build the redesigned landing page by first laying the CSS foundation, then adding i18n keys, then constructing each section of `Landing.jsx` from bottom up, and finally wiring everything together with the scroll animation system and property-based tests.

## Tasks

- [x] 1. Add CSS animation utilities to `src/index.css`
  - Append the `[data-animate]` / `[data-animate].is-visible` scroll animation base styles (opacity 0 → 1, translateY 20px → 0, 0.6s ease-out transition)
  - Append staggered delay attribute classes `[data-animate-delay="1"]` through `[data-animate-delay="5"]` (0.1s–0.5s)
  - Append `@keyframes pulse-slow` and `.animate-pulse-slow` utility (6s ease-in-out infinite, opacity 0.6↔1, scale 1↔1.08)
  - Append `@keyframes float` and `.animate-float` utility (4s ease-in-out infinite, translateY 0↔-12px)
  - Append `@keyframes shimmer` and `.gradient-text-animated` utility (200% background-size, 4s linear infinite)
  - Append `.timeline-connector` class (flex: 1, height 1px, dashed gradient border, margin-top -20px)
  - Do NOT add any new `@import` statements
  - _Requirements: 9.6, 9.7, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2. Add new i18n translation keys to all four locale files
  - [x] 2.1 Add new keys to `public/locales/en/translation.json`
    - Add under `landing`: `testimonialsTitle`, `testimonials.t1.name/role/quote`, `testimonials.t2.name/role/quote`, `testimonials.t3.name/role/quote`, `footerTagline`, `footerLinks`, `footerSocial`, `stepsTitle`
    - Preserve all existing `landing.*` keys without modification
    - English testimonial names: "Ayten Hasanova", "Rauf Aliyev", "Nigar Guliyeva"; roles: CS at BDU, Design at ADA, Marketing at UNEC
    - _Requirements: 11.2, 11.3, 11.4_

  - [x] 2.2 Add new keys to `public/locales/az/translation.json`
    - Same key set as 2.1, translated into Azerbaijani
    - Azerbaijani testimonial names: "Aytən Həsənova", "Rauf Əliyev", "Nigar Quliyeva"
    - _Requirements: 11.2, 11.3, 11.4_

  - [x] 2.3 Add new keys to `public/locales/ru/translation.json`
    - Same key set as 2.1, translated into Russian
    - _Requirements: 11.2, 11.3, 11.4_

  - [x] 2.4 Add new keys to `public/locales/tr/translation.json`
    - Same key set as 2.1, translated into Turkish
    - _Requirements: 11.2, 11.3, 11.4_

- [x] 3. Checkpoint — Verify CSS and i18n foundation
  - Ensure all four locale files contain the 14 new keys and no existing keys are missing
  - Ensure `src/index.css` compiles without errors (run `npm run build` or `npm run lint`)
  - Ask the user if any questions arise before proceeding to component work

- [-] 4. Implement sub-components: `FeatureCard`, `StepNode`, `TestimonialCard`
  - [x] 4.1 Rewrite `FeatureCard` with hover lift and icon scale
    - Keep existing color map (`brand`, `purple`, `cyan`, `emerald`, `amber`, `rose`)
    - Add `hover:-translate-y-1` and `hover:border-white/20` to card; add `hover:scale-110` to icon container
    - Fall back to `brand` variant for any unrecognized `color` prop value
    - Accept `data-animate` and `data-animate-delay` as passthrough props
    - _Requirements: 4.3, 4.4, 4.5, 4.6_

  - [x] 4.2 Implement `StepNode` sub-component (replaces `StepCard`)
    - Props: `number`, `color`, `title`, `desc`, `isLast`
    - Render numbered circle, title, description
    - Render `.timeline-connector` element only when `isLast === false`
    - _Requirements: 5.3, 5.4_

  - [x] 4.3 Implement `TestimonialCard` sub-component
    - Props: `name`, `role`, `quote`, `avatarGradient`, `initials`, `rating`
    - Render gradient avatar circle with initials, name, role, exactly `rating` amber star icons, quote text
    - _Requirements: 6.3, 6.4, 6.5_

  - [-] 4.4 Write property test for `FeatureCard` color variant safety (Property 4)
    - **Property 4: Color variant safety** — for any string `color` prop, `FeatureCard` never throws and always resolves to a valid className string
    - **Validates: Requirements 4.3, 4.4**
    - Add to `src/test/landing.property.test.js`

  - [~] 4.5 Write property test for `TestimonialCard` star rating accuracy (Property 6)
    - **Property 6: Star rating accuracy** — for any integer `rating` in [1, 5], `TestimonialCard` renders exactly `rating` star elements
    - **Validates: Requirements 6.3**
    - Add to `src/test/landing.property.test.js`

- [x] 5. Implement `HeroSection` and `StatsBar`
  - [x] 5.1 Implement `HeroSection` component
    - Badge pill, two-line H1 (white + `gradient-text`), subtext, two CTA buttons
    - "Sign Up Free" button calls `onNavigate('register')`
    - "Explore Platform" button calls `scrollToSection('features')`
    - Two radial glow blobs with `animate-pulse-slow` class
    - Floating app-preview mockup card (glass-card, Tailwind-only, no images): mini profile card with gradient avatar, name, skill badge pills
    - Wrap headline, subtext, and buttons in `data-animate` elements with staggered `data-animate-delay` values
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 1.5, 1.6_

  - [x] 5.2 Implement `StatsBar` component
    - Three metrics in a row: `2.4K+`, `180+`, `35+` with `gradient-text` on numbers
    - Labels use existing `landing.users`, `landing.projects`, `landing.universities` i18n keys
    - Top and bottom border with `border-white/5`
    - Three-column grid on mobile (`grid-cols-3`)
    - Wrap in `data-animate`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Implement `FeaturesSection` and `HowItWorksSection`
  - [x] 6.1 Implement `FeaturesSection`
    - Section badge + heading using `landing.whyLinkUpPrefix` + "LinkUp"
    - Six `FeatureCard` instances with correct icon/color/title/desc props and staggered `data-animate-delay` values
    - `lg:grid-cols-3 md:grid-cols-2` grid layout
    - Section has `id="features"` scroll target
    - _Requirements: 4.1, 4.2, 4.7, 4.8_

  - [x] 6.2 Implement `HowItWorksSection` with horizontal timeline
    - Section badge + heading using `landing.howItWorksPrefix` + `landing.howItWorksSuffix`
    - Five `StepNode` instances (numbers 1–5, colors: brand/purple/cyan/emerald/amber)
    - Pass `isLast={true}` only to step 5; all others get `isLast={false}`
    - Desktop: horizontal flex layout with `.timeline-connector` lines between nodes
    - Mobile: vertical stacked layout (flex-col)
    - Section has `id="how"` scroll target
    - Wrap nodes in `data-animate` with staggered delays
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 7. Implement `TestimonialsSection`, `CTASection`, and `Footer`
  - [x] 7.1 Implement `TestimonialsSection`
    - Section heading using `landing.testimonialsTitle` i18n key
    - `buildTestimonials(t)` helper returns array of 3 objects with `nameKey`, `roleKey`, `quoteKey`, `avatarGradient`, `initials`, `rating: 5`
    - Three `TestimonialCard` instances rendered from the array
    - `lg:grid-cols-3` grid; mobile: `overflow-x-auto` with `snap-x snap-mandatory` horizontal scroll
    - Section has `id="testimonials"` scroll target
    - Wrap cards in `data-animate` with staggered delays
    - _Requirements: 6.1, 6.2, 6.6, 6.7_

  - [x] 7.2 Implement `CTASection`
    - Rounded card (`rounded-[2rem]`, `bg-[#0A0A0A]`, `border border-white/5`)
    - Centered radial glow behind heading
    - Heading: `landing.readyJoin` + `gradient-text` span for `landing.readyJoinHighlight`
    - Subtext + `btn-primary` "Register Now" button calling `onNavigate('register')`
    - Three decorative dot elements with `animate-float` class (staggered `animation-delay` inline styles)
    - Wrap in `data-animate`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 7.3 Implement enriched `Footer`
    - Three-column desktop layout (`lg:grid-cols-3`), stacked on mobile
    - Left: logo icon + "LinkUp" wordmark + `landing.footerTagline` tagline
    - Center: column heading `landing.footerLinks` + quick links (Features → scroll `#features`, How It Works → scroll `#how`, Sign Up → `onNavigate('register')`)
    - Right: column heading `landing.footerSocial` + GitHub/LinkedIn/Instagram icon buttons with `target="_blank" rel="noopener noreferrer"`
    - Bottom bar: `landing.footer` copyright text + 🇦🇿 flag
    - `border-t border-white/5` separator
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. Wire everything together in `Landing.jsx` with IntersectionObserver
  - [x] 8.1 Rewrite `Landing.jsx` root component
    - Import and render all seven sections in order: `HeroSection`, `StatsBar`, `FeaturesSection`, `HowItWorksSection`, `TestimonialsSection`, `CTASection`, `Footer`
    - Pass `onNavigate` to `HeroSection` and `CTASection`
    - Implement `scrollToSection(id)` helper (null-guarded `getElementById` + `scrollIntoView`)
    - Pass `scrollToSection` to `HeroSection` and `Footer` for smooth scroll links
    - Remove all hardcoded English strings; use `useTranslation` for every text node
    - Zero imports from `react-router-dom`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 11.1, 12.1, 12.3, 12.4_

  - [x] 8.2 Add `useEffect` IntersectionObserver scroll animation system
    - Inside `useEffect`, query all `[data-animate]` elements
    - Create `IntersectionObserver` with `threshold: 0.15, rootMargin: '0px 0px -50px 0px'`
    - Callback: add `is-visible` class and call `observer.unobserve(entry.target)` for each intersecting entry
    - Feature-detect `IntersectionObserver`; if absent, immediately add `is-visible` to all `[data-animate]` elements
    - Return cleanup function that calls `observer.disconnect()`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 9. Checkpoint — Full integration review
  - Ensure all seven sections render correctly and scroll targets (`#features`, `#how`, `#testimonials`) are present
  - Ensure CTA buttons call `onNavigate('register')` and scroll buttons call `scrollToSection`
  - Ensure `animate-pulse-slow`, `animate-float`, `timeline-connector`, `data-animate` classes are applied correctly
  - Ensure Footer social links have `target="_blank" rel="noopener noreferrer"`
  - Ask the user if any questions arise before writing property tests

- [x] 10. Write property-based tests in `src/test/landing.property.test.js`
  - [x] 10.1 Write property test for i18n key completeness (Property 7)
    - **Property 7: i18n key completeness** — for each of the four locale codes (`az`, `en`, `ru`, `tr`), every required `landing.*` key resolves to a non-empty string
    - Load each locale JSON directly; assert all 14 new keys plus all pre-existing `landing.*` keys are present and non-empty
    - **Validates: Requirements 11.3**

  - [x] 10.2 Write property test for existing key preservation (Property 8)
    - **Property 8: Existing key preservation** — every `landing.*` key that existed before the redesign still exists with a non-empty value in all four locale files after the update
    - Use a hardcoded list of pre-redesign keys as the baseline; assert each is still present and non-empty
    - **Validates: Requirements 11.4**

- [x] 11. Final checkpoint — Ensure all tests pass
  - Run `npm test` (or `npm run test`) and confirm all tests in `src/test/landing.property.test.js` pass
  - Ensure no regressions in existing test files
  - Ask the user if any questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests in tasks 4.4, 4.5, 10.1, and 10.2 correspond to Properties 4, 6, 7, and 8 from the design document
- Properties 1 (navigation integrity), 2 (scroll safety), 3 (animation idempotency), and 5 (FeatureCard rendering completeness) are covered by the implementation constraints in tasks 8.1 and 8.2 rather than separate property tests, as they involve DOM/browser behavior better validated through integration tests
- All locale file changes are additive only — no existing keys are removed or renamed
- The `buildTestimonials(t)` helper should live inside `Landing.jsx` (not exported) since it is only used there
- The floating app-preview card in the Hero is purely decorative — no images, no external assets
