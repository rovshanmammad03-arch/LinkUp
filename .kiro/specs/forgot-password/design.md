# Dizayn Sənədi: Forgot Password

## Overview

Bu sənəd LinkUp React tətbiqinin "Şifrəni Unutdum" (Forgot Password) funksiyasının texniki dizaynını müəyyən edir. Platforma real e-poçt infrastrukturuna malik olmadığından, şifrə sıfırlama prosesi tamamilə localStorage əsaslı simulyasiya ilə həyata keçirilir.

Axın üç mərhələdən ibarətdir:
1. **E-poçt mərhələsi** — istifadəçi qeydiyyatda istifadə etdiyi e-poçtu daxil edir
2. **Token mərhələsi** — sistem 6 rəqəmli kodu UI-da göstərir, istifadəçi onu daxil edir
3. **Yeni şifrə mərhələsi** — istifadəçi yeni şifrəsini təyin edir

Bütün UI mətnləri mövcud i18next infrastrukturu vasitəsilə 4 dildə (az, en, ru, tr) dəstəklənir. Naviqasiya mövcud `onNavigate` prop pattern-i ilə idarə olunur.

---

## Architecture

Mövcud arxitektura pattern-lərinə tam uyğun olaraq:

- **Yeni fayl:** `src/pages/ForgotPassword.jsx` — üç mərhələli axını idarə edən React komponenti
- **Genişləndirilmiş fayl:** `src/services/db.js` — üç yeni xalis funksiya əlavə edilir
- **Dəyişdirilmiş fayl:** `src/pages/Login.jsx` — "Şifrəni Unutdum" linki əlavə edilir
- **Dəyişdirilmiş fayl:** `src/App.jsx` — `forgot-password` marşrutu əlavə edilir
- **Dəyişdirilmiş fayllar:** `public/locales/{az,en,ru,tr}/translation.json` — `forgotPassword` açarları əlavə edilir

```mermaid
flowchart TD
    A[Login.jsx] -->|"Şifrəni Unutdum" klik| B[onNavigate('forgot-password')]
    B --> C[App.jsx router]
    C --> D[ForgotPassword.jsx]
    D --> E{step}
    E -->|1| F[E-poçt forması]
    E -->|2| G[Token forması]
    E -->|3| H[Yeni şifrə forması]
    F -->|submit| I[generateResetToken]
    I --> J[(localStorage\nlu_reset_token)]
    G -->|submit| K[verifyToken]
    K --> J
    H -->|submit| L[resetPassword]
    L --> M[(localStorage\nlu_users)]
    L -->|sil| J
    H -->|uğur| N[onNavigate('login')]
```

---

## Components and Interfaces

### `src/pages/ForgotPassword.jsx`

```jsx
export default function ForgotPassword({ onNavigate })
```

**Daxili state:**
| State dəyişəni | Tip | Təsvir |
|---|---|---|
| `step` | `1 \| 2 \| 3` | Cari mərhələ |
| `email` | `string` | Daxil edilmiş e-poçt |
| `token` | `string` | Daxil edilmiş token |
| `newPassword` | `string` | Yeni şifrə |
| `confirmPassword` | `string` | Şifrə təkrarı |
| `error` | `string` | Xəta mesajı |
| `loading` | `boolean` | Göndər düyməsi deaktiv vəziyyəti |
| `generatedCode` | `string` | Demo üçün göstəriləcək kod |

**Mərhələ keçidləri:**
- `step 1 → step 2`: `generateResetToken(email)` uğurlu olduqda
- `step 2 → step 3`: `verifyToken(email, token)` uğurlu olduqda
- `step 2 → step 1`: "Geri" düyməsi ilə
- `step 3 → login`: `resetPassword(email, newPassword)` uğurlu olduqdan 2 saniyə sonra

### `src/services/db.js` — Yeni funksiyalar

#### `generateResetToken(email)`

```js
/**
 * E-poçtu DB-də axtarır, tapılarsa 6 rəqəmli token generasiya edib
 * lu_reset_token açarı ilə saxlayır.
 * @param {string} email
 * @returns {{ success: boolean, token?: string, error?: string }}
 */
export function generateResetToken(email)
```

**Davranış:**
1. `DB.get('users')` ilə e-poçtu axtarır
2. Tapılmırsa `{ success: false, error: 'not_found' }` qaytarır
3. `Math.floor(100000 + Math.random() * 900000)` ilə token generasiya edir
4. `DB.setOne('reset_token', { email, token: String(token), expiresAt: Date.now() + 15 * 60 * 1000 })` ilə saxlayır
5. `{ success: true, token: String(token) }` qaytarır

> **Qeyd:** `lu_` prefiksi `DB.setOne` tərəfindən avtomatik əlavə edilir, buna görə açar `reset_token` kimi ötürülür.

#### `verifyToken(email, token)`

```js
/**
 * Daxil edilmiş tokeni DB-dəki token ilə müqayisə edir və müddətini yoxlayır.
 * @param {string} email
 * @param {string} token
 * @returns {{ success: boolean, error?: 'wrong_token' | 'expired' | 'not_found' }}
 */
export function verifyToken(email, token)
```

**Davranış:**
1. `DB.getOne('reset_token')` ilə token məlumatını oxuyur
2. Məlumat yoxdursa `{ success: false, error: 'not_found' }` qaytarır
3. `record.email !== email` olarsa `{ success: false, error: 'wrong_token' }` qaytarır
4. `Date.now() >= record.expiresAt` olarsa `{ success: false, error: 'expired' }` qaytarır
5. `record.token !== token` olarsa `{ success: false, error: 'wrong_token' }` qaytarır
6. Hamısı keçirsə `{ success: true }` qaytarır

#### `resetPassword(email, newPassword)`

```js
/**
 * İstifadəçinin şifrəsini yeniləyir və token məlumatını silir.
 * @param {string} email
 * @param {string} newPassword
 * @returns {{ success: boolean, error?: string }}
 */
export function resetPassword(email, newPassword)
```

**Davranış:**
1. `DB.get('users')` ilə istifadəçini tapır
2. Tapılmırsa `{ success: false, error: 'not_found' }` qaytarır
3. İstifadəçinin `password` sahəsini `newPassword` ilə yeniləyir
4. `DB.set('users', updatedUsers)` ilə saxlayır
5. `DB.setOne('reset_token', null)` ilə token məlumatını silir
6. `{ success: true }` qaytarır

### `src/pages/Login.jsx` — Dəyişiklik

Şifrə sahəsinin altına, submit düyməsinin yuxarısına "Şifrəni Unutdum" linki əlavə edilir:

```jsx
<button
  type="button"
  onClick={() => onNavigate('forgot-password')}
  className="text-xs text-brand-400 hover:text-brand-300 transition-colors text-right w-full"
>
  {t('forgotPassword.forgotLink')}
</button>
```

### `src/App.jsx` — Dəyişiklik

`renderPage()` switch-inə yeni case əlavə edilir:

```jsx
case 'forgot-password': return <ForgotPassword onNavigate={handleNavigate} />;
```

---

## Data Models

### Token Record (localStorage: `lu_reset_token`)

```ts
interface TokenRecord {
  email: string;       // İstifadəçinin e-poçtu
  token: string;       // 6 rəqəmli rəqəmsal string (məs. "483920")
  expiresAt: number;   // Unix timestamp (ms) — Date.now() + 15 * 60 * 1000
}
```

**Xüsusiyyətlər:**
- Yalnız bir aktiv token mövcud ola bilər (hər yeni generasiya əvvəlkini üzərindən yazır)
- Token string tipindədir (müqayisə zamanı tip uyğunsuzluğunun qarşısını almaq üçün)
- `lu_reset_token` açarı `DB.setOne('reset_token', ...)` çağırışı ilə idarə olunur

### User Record (localStorage: `lu_users`) — Mövcud struktur

```ts
interface User {
  id: string;
  name: string;
  email: string;
  password: string;  // ← Bu sahə resetPassword tərəfindən yenilənir
  // ... digər sahələr dəyişmir
}
```

### i18n Açarları (`forgotPassword` namespace)

```json
{
  "forgotPassword": {
    "forgotLink": "Şifrəni unutdum?",
    "title": "Şifrəni Sıfırla",
    "step1Title": "E-poçtunuzu daxil edin",
    "step1Desc": "Qeydiyyatda istifadə etdiyiniz e-poçtu daxil edin",
    "emailLabel": "E-poçt",
    "sendCodeBtn": "Kodu Göndər",
    "step2Title": "Kodu daxil edin",
    "step2Desc": "E-poçtunuza göndərilən 6 rəqəmli kodu daxil edin",
    "demoCodeMsg": "Demo üçün kodunuz: {{code}}",
    "tokenLabel": "Sıfırlama Kodu",
    "tokenPlaceholder": "123456",
    "verifyBtn": "Doğrula",
    "step3Title": "Yeni şifrə təyin edin",
    "step3Desc": "Hesabınız üçün yeni şifrə seçin",
    "newPasswordLabel": "Yeni Şifrə",
    "confirmPasswordLabel": "Şifrəni Təkrarla",
    "resetBtn": "Şifrəni Sıfırla",
    "successMsg": "Şifrəniz uğurla yeniləndi! Giriş səhifəsinə yönləndirilirsiniz...",
    "backToLogin": "Girişə Qayıt",
    "backToEmail": "E-poçtu dəyiş",
    "errors": {
      "emailNotFound": "Bu e-poçt qeydiyyatda yoxdur",
      "wrongToken": "Kod yanlışdır",
      "expiredToken": "Kodun müddəti bitib, yenidən cəhd edin",
      "passwordTooShort": "Şifrə minimum 8 simvol olmalıdır",
      "passwordMismatch": "Şifrələr uyğun gəlmir"
    }
  }
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Token Range Invariant

*For any* call to `generateResetToken` with a valid email, the generated token SHALL be an integer in the range [100000, 999999] (inclusive), ensuring it is always exactly 6 digits.

**Validates: Requirements 3.1**

---

### Property 2: Token Storage Round-Trip

*For any* valid email address that exists in the user DB, calling `generateResetToken(email)` and then reading `lu_reset_token` from localStorage SHALL produce a record where `record.email === email`, `record.token` is a 6-digit string, and `record.expiresAt` is approximately `Date.now() + 15 * 60 * 1000` (within a 1-second tolerance).

**Validates: Requirements 3.2**

---

### Property 3: Token Overwrite Idempotency

*For any* sequence of calls to `generateResetToken` (with any emails), after the final call, `DB.getOne('reset_token')` SHALL contain exactly one record corresponding to the most recent call — previous tokens are overwritten and do not persist.

**Validates: Requirements 3.3**

---

### Property 4: Token Verification Correctness

*For any* stored token record `{ email, token, expiresAt }`:
- If `verifyToken(email, token)` is called with the correct email and token AND `Date.now() < expiresAt`, it SHALL return `{ success: true }`
- If called with a different token value, it SHALL return `{ success: false, error: 'wrong_token' }`
- If called when `Date.now() >= expiresAt`, it SHALL return `{ success: false, error: 'expired' }`

**Validates: Requirements 4.3, 4.4**

---

### Property 5: Password Validation Correctness

*For any* pair of strings `(newPassword, confirmPassword)`:
- If `newPassword.length < 8`, validation SHALL reject with `passwordTooShort` error regardless of `confirmPassword`
- If `newPassword.length >= 8` AND `newPassword !== confirmPassword`, validation SHALL reject with `passwordMismatch` error
- If `newPassword.length >= 8` AND `newPassword === confirmPassword`, validation SHALL pass

**Validates: Requirements 5.2, 5.4**

---

### Property 6: Password Reset Round-Trip

*For any* user email that exists in the DB and any valid new password (length ≥ 8), calling `resetPassword(email, newPassword)` SHALL:
1. Update the user's `password` field in `lu_users` to `newPassword`
2. Set `lu_reset_token` to `null` (token is cleared)

Both conditions must hold simultaneously.

**Validates: Requirements 5.5, 5.6**

---

### Property 7: Back-to-Login Link Present on All Steps

*For any* step value in `{1, 2, 3}`, the rendered `ForgotPassword` component SHALL contain a "Girişə Qayıt" link that, when clicked, calls `onNavigate('login')`.

**Validates: Requirements 7.3, 7.4**

---

## Error Handling

| Ssenari | Xəta | UI Cavabı |
|---|---|---|
| E-poçt DB-də yoxdur | `not_found` | `errors.emailNotFound` mesajı göstərilir |
| Token uyğun gəlmir | `wrong_token` | `errors.wrongToken` mesajı göstərilir |
| Token müddəti bitib | `expired` | `errors.expiredToken` mesajı göstərilir |
| Şifrə < 8 simvol | client-side | `errors.passwordTooShort` mesajı göstərilir |
| Şifrələr uyğun gəlmir | client-side | `errors.passwordMismatch` mesajı göstərilir |
| Gözlənilməz xəta | generic | Ümumi xəta mesajı göstərilir |

**Ümumi prinsiplər:**
- Xəta mesajları i18n `t()` vasitəsilə göstərilir
- Xəta vəziyyəti yeni form göndərişi zamanı sıfırlanır
- `loading` state yalnız asinxron əməliyyat zamanı `true` olur (bu halda sinxron əməliyyatlar üçün `false` saxlanılır)
- E-poçt tapılmadıqda istifadəçiyə hesabın mövcud olub-olmadığı barədə məlumat verilmir (security best practice) — lakin bu demo tətbiq olduğundan sadə xəta mesajı istifadə edilir

---

## Testing Strategy

### Yanaşma

Layihə **Vitest** + **@testing-library/react** + **fast-check** istifadə edir (mövcud `package.json`-da var). Testlər `src/test/` qovluğunda yerləşdirilir.

**İkili yanaşma:**
- **Unit/example testlər:** Spesifik ssenariləri, UI vəziyyət keçidlərini və xəta hallarını yoxlayır
- **Property-based testlər:** Universal xassələri fast-check ilə 100+ iterasiyada yoxlayır

### Property-Based Test Faylı

**`src/test/forgotPassword.property.test.js`**

fast-check ilə aşağıdakı 7 xassə test edilir (hər biri minimum 100 iterasiya):

```
// Feature: forgot-password, Property 1: Token Range Invariant
// Feature: forgot-password, Property 2: Token Storage Round-Trip
// Feature: forgot-password, Property 3: Token Overwrite Idempotency
// Feature: forgot-password, Property 4: Token Verification Correctness
// Feature: forgot-password, Property 5: Password Validation Correctness
// Feature: forgot-password, Property 6: Password Reset Round-Trip
// Feature: forgot-password, Property 7: Back-to-Login Link Present on All Steps
```

**Arbitraries:**
- `emailArb`: `fc.emailAddress()` — valid email strings
- `tokenArb`: `fc.integer({ min: 100000, max: 999999 }).map(String)` — 6-digit token strings
- `passwordArb`: `fc.string({ minLength: 1, maxLength: 30 })` — arbitrary password strings
- `stepArb`: `fc.constantFrom(1, 2, 3)` — valid step values

### Unit/Example Test Faylı

**`src/test/ForgotPassword.test.jsx`**

Aşağıdakı ssenariləri əhatə edir:
- Login səhifəsindəki "Şifrəni Unutdum" linkinin mövcudluğu (1.1)
- Link klikdə `onNavigate('forgot-password')` çağırışı (1.2)
- İlk mərhələnin render edilməsi (2.1)
- E-poçt tapılmadıqda xəta mesajı (2.6)
- Demo kod mesajının göstərilməsi (3.4)
- Token mərhələsinin render edilməsi (4.1)
- Yanlış token xəta mesajı (4.5)
- Müddəti bitmiş token xəta mesajı (4.6)
- Uğurlu token doğrulamasından sonra step 3-ə keçid (4.7)
- Geri düyməsi ilə step 1-ə qayıdış (4.8)
- Yeni şifrə mərhələsinin render edilməsi (5.1)
- Uğurlu sıfırlamadan sonra uğur mesajı və yönləndirmə (5.7)
- `forgot-password` marşrutunun App-da işləməsi (7.2)

### i18n Smoke Testləri

Bütün 4 dil faylının `forgotPassword` açarını ehtiva etdiyini yoxlayan sadə import testləri.
