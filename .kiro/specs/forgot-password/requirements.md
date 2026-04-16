# Tələblər Sənədi

## Giriş

Bu sənəd LinkUp platformasının Login səhifəsinə əlavə ediləcək "Şifrəni Unutdum" (Forgot Password) funksiyasının tələblərini müəyyən edir. Platforma real e-poçt infrastrukturuna malik olmadığından, şifrə sıfırlama prosesi simulyasiya edilir: istifadəçi e-poçtunu daxil edir, sistem localStorage-da saxlanılan istifadəçiləri yoxlayır, uğurlu halda 6 rəqəmli sıfırlama kodu generasiya edib localStorage-da saxlayır, istifadəçi kodu daxil edir, doğrulandıqdan sonra yeni şifrə təyin edir. Bütün UI mətnləri mövcud i18next infrastrukturu vasitəsilə 4 dildə (az, en, ru, tr) dəstəklənir.

## Lüğət

- **ForgotPassword_UI**: "Şifrəni Unutdum" axınını idarə edən React komponenti (`src/pages/ForgotPassword.jsx`)
- **Reset_Service**: Sıfırlama tokenini generasiya edən, saxlayan və doğrulayan məntiq (`src/services/db.js` daxilindəki funksiyalar)
- **Token**: 6 rəqəmli rəqəmsal sıfırlama kodu (məs. `"483920"`)
- **Token_Record**: localStorage-da saxlanılan token məlumatı: `{ email, token, expiresAt }` strukturu
- **DB**: Mövcud `src/services/db.js` faylındakı localStorage əsaslı verilənlər bazası xidməti
- **AuthContext**: Mövcud `src/context/AuthContext.jsx` faylındakı autentifikasiya konteksti
- **i18n**: Mövcud `i18next` beynəlxalqlaşdırma infrastrukturu
- **Login_Page**: Mövcud `src/pages/Login.jsx` faylı

---

## Tələblər

### Tələb 1: Login Səhifəsindən Keçid

**İstifadəçi Hekayəsi:** İstifadəçi kimi, şifrəmi unutduğumda Login səhifəsindən "Şifrəni Unutdum" axınına keçmək istəyirəm ki, şifrəmi sıfırlaya bilim.

#### Qəbul Meyarları

1. THE Login_Page SHALL "Şifrəni Unutdum" linkini şifrə sahəsinin altında göstərməlidir.
2. WHEN istifadəçi "Şifrəni Unutdum" linkinə klikləyir, THE Login_Page SHALL `onNavigate('forgot-password')` çağırmalıdır.
3. THE Login_Page SHALL "Şifrəni Unutdum" linkini mövcud dizayn sisteminə (Tailwind CSS, `text-brand-400` rəng sinfi) uyğun şəkildə göstərməlidir.

---

### Tələb 2: E-poçt Daxiletmə Mərhələsi

**İstifadəçi Hekayəsi:** İstifadəçi kimi, qeydiyyatda istifadə etdiyim e-poçtu daxil etmək istəyirəm ki, sıfırlama prosesini başlada bilim.

#### Qəbul Meyarları

1. THE ForgotPassword_UI SHALL e-poçt daxiletmə forması olan birinci mərhələni göstərməlidir.
2. WHEN istifadəçi formu boş e-poçtla göndərir, THE ForgotPassword_UI SHALL HTML5 `required` atributu vasitəsilə göndərişi bloklamalıdır.
3. WHEN istifadəçi düzgün formatda olmayan e-poçt daxil edir, THE ForgotPassword_UI SHALL HTML5 `type="email"` atributu vasitəsilə göndərişi bloklamalıdır.
4. WHEN istifadəçi düzgün formatda e-poçtu göndərir, THE ForgotPassword_UI SHALL Reset_Service-i çağırmalıdır.
5. WHEN Reset_Service e-poçtu DB-də tapır, THE ForgotPassword_UI SHALL token daxiletmə mərhələsinə keçməlidir.
6. IF Reset_Service e-poçtu DB-də tapmırsa, THEN THE ForgotPassword_UI SHALL "Bu e-poçt qeydiyyatda yoxdur" xəta mesajını göstərməlidir.
7. WHILE e-poçt göndərişi emal edilir, THE ForgotPassword_UI SHALL göndər düyməsini deaktiv etməlidir.

---

### Tələb 3: Token Generasiyası və Saxlanması

**İstifadəçi Hekayəsi:** İstifadəçi kimi, unikal sıfırlama kodu almaq istəyirəm ki, şifrə dəyişikliyini yalnız mən edə bilim.

#### Qəbul Meyarları

1. WHEN Reset_Service token generasiya edir, THE Reset_Service SHALL `Math.floor(100000 + Math.random() * 900000)` formulası ilə 6 rəqəmli rəqəmsal token yaratmalıdır.
2. WHEN Reset_Service token generasiya edir, THE Reset_Service SHALL token məlumatını `{ email, token, expiresAt: Date.now() + 15 * 60 * 1000 }` strukturunda `lu_reset_token` açarı ilə DB-də saxlamalıdır.
3. THE Reset_Service SHALL hər yeni token generasiyasında əvvəlki tokeni üzərindən yazmalıdır (yalnız bir aktiv token mövcud olmalıdır).
4. WHEN token generasiya edilir, THE ForgotPassword_UI SHALL istifadəçiyə simulyasiya mesajı göstərməlidir (məs. "Sıfırlama kodu e-poçtunuza göndərildi. Demo üçün: [KOD]").

---

### Tələb 4: Token Daxiletmə və Doğrulama Mərhələsi

**İstifadəçi Hekayəsi:** İstifadəçi kimi, aldığım sıfırlama kodunu daxil etmək istəyirəm ki, şəxsiyyətimi təsdiqləyim.

#### Qəbul Meyarları

1. THE ForgotPassword_UI SHALL token daxiletmə forması olan ikinci mərhələni göstərməlidir.
2. WHEN istifadəçi 6 rəqəmli kodu daxil edib göndərir, THE ForgotPassword_UI SHALL Reset_Service-in `verifyToken(email, token)` funksiyasını çağırmalıdır.
3. WHEN Reset_Service tokeni yoxlayır, THE Reset_Service SHALL daxil edilmiş tokenin DB-dəki token ilə uyğunluğunu yoxlamalıdır.
4. WHEN Reset_Service tokeni yoxlayır, THE Reset_Service SHALL `Date.now() < expiresAt` şərtini yoxlamalıdır.
5. IF daxil edilmiş token DB-dəki token ilə uyğun gəlmirsə, THEN THE ForgotPassword_UI SHALL "Kod yanlışdır" xəta mesajını göstərməlidir.
6. IF tokenin müddəti bitibsə (`Date.now() >= expiresAt`), THEN THE ForgotPassword_UI SHALL "Kodun müddəti bitib, yenidən cəhd edin" xəta mesajını göstərməlidir.
7. WHEN token uğurla doğrulanır, THE ForgotPassword_UI SHALL yeni şifrə təyin etmə mərhələsinə keçməlidir.
8. THE ForgotPassword_UI SHALL istifadəçiyə e-poçt daxiletmə mərhələsinə qayıtmaq imkanı verməlidir.

---

### Tələb 5: Yeni Şifrə Təyin Etmə Mərhələsi

**İstifadəçi Hekayəsi:** İstifadəçi kimi, yeni şifrəmi təyin etmək istəyirəm ki, hesabıma yenidən daxil ola bilim.

#### Qəbul Meyarları

1. THE ForgotPassword_UI SHALL yeni şifrə və şifrə təkrarı sahələri olan üçüncü mərhələni göstərməlidir.
2. WHEN istifadəçi yeni şifrəni göndərir, THE ForgotPassword_UI SHALL şifrənin minimum 8 simvol uzunluğunda olduğunu yoxlamalıdır.
3. IF yeni şifrə 8 simvoldan qısadırsa, THEN THE ForgotPassword_UI SHALL "Şifrə minimum 8 simvol olmalıdır" xəta mesajını göstərməlidir.
4. IF yeni şifrə ilə şifrə təkrarı uyğun gəlmirsə, THEN THE ForgotPassword_UI SHALL "Şifrələr uyğun gəlmir" xəta mesajını göstərməlidir.
5. WHEN şifrə validasiyası uğurlu olur, THE Reset_Service SHALL DB-dəki müvafiq istifadəçinin `password` sahəsini yeni şifrə ilə yeniləməlidir.
6. WHEN şifrə uğurla yenilənir, THE Reset_Service SHALL `lu_reset_token` açarını DB-dən silməlidir.
7. WHEN şifrə uğurla yenilənir, THE ForgotPassword_UI SHALL uğur mesajı göstərməli və 2 saniyə sonra `onNavigate('login')` çağırmalıdır.

---

### Tələb 6: Çoxdilli Dəstək

**İstifadəçi Hekayəsi:** İstifadəçi kimi, platformanın seçdiyim dildə "Şifrəni Unutdum" axınını göstərməsini istəyirəm ki, interfeysi rahat başa düşüm.

#### Qəbul Meyarları

1. THE ForgotPassword_UI SHALL bütün UI mətnlərini i18n `t()` funksiyası vasitəsilə göstərməlidir.
2. THE i18n SHALL `forgotPassword` açarı altında bütün lazımi tərcümə açarlarını az, en, ru, tr dillərinin `translation.json` fayllarında saxlamalıdır.
3. WHEN istifadəçi dili dəyişir, THE ForgotPassword_UI SHALL bütün mətnləri yeni dildə dərhal göstərməlidir.

---

### Tələb 7: Naviqasiya və Marşrutlaşdırma

**İstifadəçi Hekayəsi:** İstifadəçi kimi, "Şifrəni Unutdum" axınına daxil ola bilmək və axından çıxa bilmək istəyirəm ki, naviqasiya rahat olsun.

#### Qəbul Meyarları

1. THE ForgotPassword_UI SHALL `src/pages/ForgotPassword.jsx` faylında `onNavigate` prop-unu qəbul edən ayrıca səhifə komponenti kimi yaradılmalıdır.
2. THE App_Router SHALL `forgot-password` marşrutunu `ForgotPassword` komponentinə yönləndirməlidir.
3. THE ForgotPassword_UI SHALL hər mərhələdə "Girişə Qayıt" linki göstərməlidir ki, istifadəçi axını istənilən vaxt tərk edə bilsin.
4. WHEN istifadəçi "Girişə Qayıt" linkinə klikləyir, THE ForgotPassword_UI SHALL `onNavigate('login')` çağırmalıdır.
