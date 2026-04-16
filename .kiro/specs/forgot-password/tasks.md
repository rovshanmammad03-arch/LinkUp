# İcra Planı: Forgot Password

## Tasks

- [x] 1. db.js-ə sıfırlama funksiyaları əlavə et
  - [x] 1.1 `generateResetToken(email)` funksiyasını yaz: e-poçtu DB-də axtar, 6 rəqəmli token generasiya et, `lu_reset_token`-da saxla, `{ success, token?, error? }` qaytar
  - [x] 1.2 `verifyToken(email, token)` funksiyasını yaz: `lu_reset_token`-u oxu, e-poçt/token uyğunluğunu və `expiresAt` müddətini yoxla, `{ success, error? }` qaytar
  - [x] 1.3 `resetPassword(email, newPassword)` funksiyasını yaz: istifadəçinin `password` sahəsini yenilə, `lu_reset_token`-u sil, `{ success, error? }` qaytar
  - **Fayl:** `src/services/db.js`

- [x] 2. ForgotPassword.jsx səhifə komponentini yarat
  - [x] 2.1 `src/pages/ForgotPassword.jsx` faylını yarat; `onNavigate` prop-unu qəbul edən, `step` (1|2|3), `email`, `token`, `newPassword`, `confirmPassword`, `error`, `loading`, `generatedCode` state-lərini idarə edən komponenti yaz
  - [x] 2.2 Step 1 — e-poçt formasını yaz: `type="email" required` input, göndər düyməsi (`loading` zamanı deaktiv), xəta mesajı sahəsi, "Girişə Qayıt" linki
  - [x] 2.3 Step 2 — token formasını yaz: demo kod mesajı (`demoCodeMsg`), 6 rəqəmli kod input-u, doğrula düyməsi, xəta mesajı sahəsi, "E-poçtu dəyiş" geri linki, "Girişə Qayıt" linki
  - [x] 2.4 Step 3 — yeni şifrə formasını yaz: yeni şifrə input-u, şifrə təkrarı input-u, sıfırla düyməsi, client-side validasiya (uzunluq ≥ 8, uyğunluq), xəta mesajı sahəsi, "Girişə Qayıt" linki
  - [x] 2.5 Uğurlu sıfırlamadan sonra uğur mesajı göstər və 2 saniyə sonra `onNavigate('login')` çağır
  - [x] 2.6 Bütün mətnləri `t('forgotPassword.*')` açarları ilə i18n-dən al
  - **Fayl:** `src/pages/ForgotPassword.jsx`

- [x] 3. Login.jsx-ə "Şifrəni Unutdum" linki əlavə et
  - [x] 3.1 Şifrə `<input>` sahəsinin altına, submit düyməsinin yuxarısına `t('forgotPassword.forgotLink')` mətnli düymə əlavə et; klikdə `onNavigate('forgot-password')` çağır; `text-brand-400 hover:text-brand-300` Tailwind sinifləri ilə stilizə et
  - **Fayl:** `src/pages/Login.jsx`

- [x] 4. App.jsx-ə `forgot-password` marşrutunu əlavə et
  - [x] 4.1 `ForgotPassword` komponentini import et
  - [x] 4.2 `renderPage()` switch-inə `case 'forgot-password': return <ForgotPassword onNavigate={handleNavigate} />;` əlavə et
  - **Fayl:** `src/App.jsx`

- [x] 5. i18n tərcümə açarlarını əlavə et
  - [x] 5.1 `public/locales/az/translation.json`-a `forgotPassword` obyektini əlavə et (Azərbaycan dilində)
  - [x] 5.2 `public/locales/en/translation.json`-a `forgotPassword` obyektini əlavə et (İngilis dilində)
  - [x] 5.3 `public/locales/ru/translation.json`-a `forgotPassword` obyektini əlavə et (Rus dilində)
  - [x] 5.4 `public/locales/tr/translation.json`-a `forgotPassword` obyektini əlavə et (Türk dilində)
  - **Fayllar:** `public/locales/*/translation.json`

- [x] 6. Property-based testlər yaz
  - [x] 6.1 `src/test/forgotPassword.property.test.js` faylını yarat; fast-check ilə Property 1 (token range invariant) testini yaz — `numRuns: 100`
  - [x] 6.2 Property 2 (token storage round-trip) testini yaz — `numRuns: 100`
  - [x] 6.3 Property 3 (token overwrite idempotency) testini yaz — `numRuns: 100`
  - [x] 6.4 Property 4 (token verification correctness — match + expiry) testini yaz — `numRuns: 100`
  - [x] 6.5 Property 5 (password validation correctness — length + match) testini yaz — `numRuns: 100`
  - [x] 6.6 Property 6 (password reset round-trip — DB updated + token cleared) testini yaz — `numRuns: 100`
  - [x] 6.7 Property 7 (back-to-login link present on all steps) testini yaz — `numRuns: 100`
  - [x] 6.8 `npx vitest --run src/test/forgotPassword.property.test.js` ilə bütün property testlərini işlət və keçdiyini təsdiq et
  - **Fayl:** `src/test/forgotPassword.property.test.js`

- [x] 7. Unit/example testlər yaz
  - [x] 7.1 `src/test/ForgotPassword.test.jsx` faylını yarat; Login-dəki "Şifrəni Unutdum" linkinin mövcudluğunu və klikdə `onNavigate('forgot-password')` çağırışını test et (Req 1.1, 1.2)
  - [x] 7.2 ForgotPassword step 1 render testini yaz (Req 2.1)
  - [x] 7.3 E-poçt tapılmadıqda xəta mesajı testini yaz (Req 2.6)
  - [x] 7.4 Demo kod mesajının göstərilməsi testini yaz (Req 3.4)
  - [x] 7.5 Step 2 render testini yaz (Req 4.1)
  - [x] 7.6 Yanlış token xəta mesajı testini yaz (Req 4.5)
  - [x] 7.7 Müddəti bitmiş token xəta mesajı testini yaz (Req 4.6)
  - [x] 7.8 Uğurlu token doğrulamasından sonra step 3-ə keçid testini yaz (Req 4.7)
  - [x] 7.9 "E-poçtu dəyiş" geri düyməsi ilə step 1-ə qayıdış testini yaz (Req 4.8)
  - [x] 7.10 Step 3 render testini yaz (Req 5.1)
  - [x] 7.11 Uğurlu sıfırlamadan sonra uğur mesajı və `onNavigate('login')` çağırışı testini yaz (Req 5.7)
  - [x] 7.12 `npx vitest --run src/test/ForgotPassword.test.jsx` ilə bütün unit testlərini işlət və keçdiyini təsdiq et
  - **Fayl:** `src/test/ForgotPassword.test.jsx`
