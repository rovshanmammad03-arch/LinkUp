// Feature: landing-page-redesign — Property-Based Tests
// Properties 7 & 8: i18n key completeness and existing key preservation

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

import azLocale from '../../public/locales/az/translation.json';
import enLocale from '../../public/locales/en/translation.json';
import ruLocale from '../../public/locales/ru/translation.json';
import trLocale from '../../public/locales/tr/translation.json';

const LOCALES = { az: azLocale, en: enLocale, ru: ruLocale, tr: trLocale };
const LOCALE_CODES = ['az', 'en', 'ru', 'tr'];

// ─── Helper: resolve a dot-separated key path in a nested object ──────────────
function resolve(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);
}

// ─── New keys added by the redesign ──────────────────────────────────────────
const NEW_LANDING_KEYS = [
  'landing.testimonialsTitle',
  'landing.testimonials.t1.name',
  'landing.testimonials.t1.role',
  'landing.testimonials.t1.quote',
  'landing.testimonials.t2.name',
  'landing.testimonials.t2.role',
  'landing.testimonials.t2.quote',
  'landing.testimonials.t3.name',
  'landing.testimonials.t3.role',
  'landing.testimonials.t3.quote',
  'landing.footerTagline',
  'landing.footerLinks',
  'landing.footerSocial',
  'landing.stepsTitle',
];

// ─── Pre-existing keys that must be preserved ────────────────────────────────
const EXISTING_LANDING_KEYS = [
  'landing.badge',
  'landing.heroTitle1',
  'landing.heroTitle2',
  'landing.heroDesc',
  'landing.freeRegister',
  'landing.exploreBtn',
  'landing.users',
  'landing.projects',
  'landing.universities',
  'landing.whyLinkUpPrefix',
  'landing.notJustSocial',
  'landing.howItWorksPrefix',
  'landing.howItWorksSuffix',
  'landing.readyJoin',
  'landing.readyJoinHighlight',
  'landing.readyDesc',
  'landing.registerNow',
  'landing.footer',
  'landing.features.skillSearch',
  'landing.features.skillSearchDesc',
  'landing.features.profile',
  'landing.features.profileDesc',
  'landing.features.messaging',
  'landing.features.messagingDesc',
  'landing.features.projects',
  'landing.features.projectsDesc',
  'landing.features.university',
  'landing.features.universityDesc',
  'landing.features.safe',
  'landing.features.safeDesc',
  'landing.steps.register',
  'landing.steps.registerDesc',
  'landing.steps.profile',
  'landing.steps.profileDesc',
  'landing.steps.discover',
  'landing.steps.discoverDesc',
  'landing.steps.connect',
  'landing.steps.connectDesc',
  'landing.steps.create',
  'landing.steps.createDesc',
];

// ─── Property 7: i18n key completeness ───────────────────────────────────────
describe('Landing Page — Property 7: i18n key completeness', () => {

  it('bütün yeni landing keyləri 4 dildə mövcuddur və boş deyil', () => {
    LOCALE_CODES.forEach(lang => {
      NEW_LANDING_KEYS.forEach(key => {
        const value = resolve(LOCALES[lang], key);
        expect(
          value,
          `[${lang}] "${key}" açarı tapılmadı və ya boşdur`
        ).toBeTruthy();
        expect(
          typeof value,
          `[${lang}] "${key}" string olmalıdır`
        ).toBe('string');
        expect(
          value.trim().length,
          `[${lang}] "${key}" boş string olmamalıdır`
        ).toBeGreaterThan(0);
      });
    });
  });

  // Property-based: istənilən locale kodu üçün bütün yeni keylər non-empty string qaytarır
  it('Property 7: istənilən locale üçün yeni keylər non-empty string qaytarır', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LOCALE_CODES),
        fc.constantFrom(...NEW_LANDING_KEYS),
        (lang, key) => {
          const value = resolve(LOCALES[lang], key);
          expect(typeof value).toBe('string');
          expect(value.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: NEW_LANDING_KEYS.length * LOCALE_CODES.length }
    );
  });

});

// ─── Property 8: existing key preservation ───────────────────────────────────
describe('Landing Page — Property 8: mövcud keylərin qorunması', () => {

  it('bütün köhnə landing keyləri hələ də 4 dildə mövcuddur', () => {
    LOCALE_CODES.forEach(lang => {
      EXISTING_LANDING_KEYS.forEach(key => {
        const value = resolve(LOCALES[lang], key);
        expect(
          value,
          `[${lang}] köhnə açar "${key}" silinib və ya boşdur`
        ).toBeTruthy();
        expect(
          typeof value,
          `[${lang}] köhnə açar "${key}" string olmalıdır`
        ).toBe('string');
        expect(
          value.trim().length,
          `[${lang}] köhnə açar "${key}" boş string olmamalıdır`
        ).toBeGreaterThan(0);
      });
    });
  });

  // Property-based: istənilən locale + köhnə key kombinasiyası non-empty string qaytarır
  it('Property 8: istənilən locale üçün köhnə keylər hələ də non-empty string qaytarır', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LOCALE_CODES),
        fc.constantFrom(...EXISTING_LANDING_KEYS),
        (lang, key) => {
          const value = resolve(LOCALES[lang], key);
          expect(typeof value).toBe('string');
          expect(value.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: EXISTING_LANDING_KEYS.length * LOCALE_CODES.length }
    );
  });

});
