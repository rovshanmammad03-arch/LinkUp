# İcra Planı: Project Showcase

## İcmal

Bu plan `showcaseService.js` servis modulunun, `ShowcaseModal`, `ShowcaseList`, `ShowcaseItem` komponentlərinin yazılmasını və `Profile.jsx`-ə inteqrasiyasını əhatə edir. Hər addım əvvəlki addım üzərində qurulur; son addımda bütün hissələr bir-birinə bağlanır.

## Tapşırıqlar

- [x] 1. `showcaseService.js` servis modulunu yarat
  - `src/services/showcaseService.js` faylını yarat
  - `getAll()` — `DB.get('showcases')` vasitəsilə bütün showcase-ləri qaytarır
  - `getByProject(projectId)` — müəyyən layihəyə aid showcase-ləri `createdAt` azalan sırada qaytarır
  - `add(data)` — `uid()` ilə `id` generasiya edib, `createdAt: Date.now()` əlavə edib `DB.set('showcases', ...)` ilə saxlayır; yeni elementi qaytarır
  - `remove(showcaseId)` — showcase-i massivdən çıxarıb `DB.set` edir; `true` qaytarır
  - `isParticipant(userId, project)` — `authorId === userId` və ya `applicants` massivindəki `status: 'accepted'` üzvü yoxlayır; `project.applicants` `undefined` olarsa boş massiv kimi qəbul edir
  - `isValidUrl(url)` — `http://` və ya `https://` ilə başlayan URL-lər üçün `true`, digərləri üçün `false` qaytarır
  - `isValidFileSize(sizeInBytes)` — `sizeInBytes <= 2 * 1024 * 1024` şərtini yoxlayır
  - _Tələblər: 1.3, 1.5, 1.6, 2.2, 2.3, 2.4, 3.5, 4.3, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 1.1 Xüsusiyyət 2 üçün property testi yaz: URL Validasiyası
    - **Xüsusiyyət 2: URL Validasiyası**
    - `http://` və ya `https://` ilə başlamayan istənilən string üçün `isValidUrl()` `false` qaytarmalıdır; başlayanlar üçün `true`
    - `src/test/projectShowcase.property.test.js` faylında `fc.string()` arbitrarisi ilə test yaz
    - **Yoxlayır: Tələb 1.5**

  - [ ]* 1.2 Xüsusiyyət 3 üçün property testi yaz: Fayl Ölçüsü Validasiyası
    - **Xüsusiyyət 3: Fayl Ölçüsü Validasiyası**
    - 2MB-dan böyük ölçülər rədd edilməli, kiçik və ya bərabər ölçülər qəbul edilməlidir
    - `fc.integer({ min: 0, max: 10 * 1024 * 1024 })` arbitrarisi ilə test yaz
    - **Yoxlayır: Tələb 1.6**

  - [ ]* 1.3 Xüsusiyyət 4 üçün property testi yaz: İştirakçılıq Hüququ
    - **Xüsusiyyət 4: İştirakçılıq Hüququ**
    - Yalnız `authorId` olan və ya `status: 'accepted'` üzvü olan istifadəçilər üçün `true` qaytarmalıdır
    - `fc.record(...)` ilə müxtəlif istifadəçi/layihə cütləri generasiya et
    - **Yoxlayır: Tələb 2.2, Tələb 2.3**

- [x] 2. `ShowcaseItem.jsx` komponentini yarat
  - `src/components/profile/ShowcaseItem.jsx` faylını yarat
  - Props: `showcase`, `canDelete`, `onDelete`
  - `showcase.image` varsa `<img>` elementi göstər, yoxsa göstərmə
  - `showcase.liveUrl` varsa `target="_blank" rel="noopener noreferrer"` ilə link göstər, yoxsa göstərmə
  - `showcase.description` varsa mətn göstər, yoxsa göstərmə
  - `showcase.createdAt` dəyərini oxunaqlı tarix formatında göstər
  - `canDelete` `true` olduqda silmə düyməsi göstər; `onDelete` callback-ini çağır
  - Mövcud dizayn sistemi (Tailwind CSS, `@iconify/react`) ilə uyğun stil tətbiq et
  - _Tələblər: 3.2, 3.3, 4.1_

  - [ ]* 2.1 Xüsusiyyət 8 üçün property testi yaz: Showcase Render Tamlığı
    - **Xüsusiyyət 8: Showcase Render Tamlığı**
    - Mövcud sahələr DOM-da göstərilməli, `null` olanlar göstərilməməlidir
    - `fc.record({ liveUrl: fc.option(fc.webUrl()), image: fc.option(fc.string()), description: fc.option(fc.string()) })` ilə test yaz
    - **Yoxlayır: Tələb 3.2**

- [x] 3. `ShowcaseList.jsx` komponentini yarat
  - `src/components/profile/ShowcaseList.jsx` faylını yarat
  - Props: `showcases`, `currentUserId`, `isOwnProfile`, `onDelete`
  - `showcases` massivi boşdursa və `isOwnProfile` `true`-dursa "Hələ showcase yoxdur" mesajı göstər
  - `showcases` massivi boşdursa və `isOwnProfile` `false`-dursa heç nə göstərmə
  - Hər showcase üçün `ShowcaseItem` render et
  - `canDelete` prop-unu `showcase.userId === currentUserId` şərti ilə hesabla
  - _Tələblər: 3.1, 3.4, 4.1, 6.1, 6.2_

  - [ ]* 3.1 `ShowcaseList` üçün unit testlər yaz
    - Boş siyahı + `isOwnProfile=true` → "Hələ showcase yoxdur" mesajı görünür
    - Boş siyahı + `isOwnProfile=false` → mesaj görünmür
    - Başqa istifadəçinin showcase-inin silmə düyməsi görünmür
    - _Tələblər: 3.4, 6.2_

- [x] 4. `ShowcaseModal.jsx` komponentini yarat
  - `src/components/profile/ShowcaseModal.jsx` faylını yarat
  - Props: `projectId`, `onClose`, `onSaved`
  - Daxili state: `liveUrl`, `description`, `imageBase64`, `errors`, `loading`
  - Forma sahələri: canlı link (URL, könüllü), şəkil yükləmə (könüllü, maks. 2MB), qısa açıqlama (könüllü, maks. 300 simvol)
  - Açıqlama sahəsinin altında simvol sayacı göstər; 300 simvola çatdıqda qırmızıya dön
  - Şəkil seçildikdə `isValidFileSize()` ilə yoxla; 2MB-dan böyükdürsə faylı rədd et və xəta mesajı göstər
  - Forma göndərildikdə: bütün sahələr boşdursa "Ən azı bir sahəni doldurun" xətası göstər
  - URL daxil edilibsə `isValidUrl()` ilə yoxla; etibarsızsa "URL http:// və ya https:// ilə başlamalıdır" xətası göstər
  - Validasiya keçirsə `showcaseService.add()` çağır, `onSaved(showcase)` callback-ini çağır
  - Modal bağlamaq üçün `onClose` callback-ini çağır; `useScrollLock` hook-unu tətbiq et
  - Mövcud `ConfirmModal` dizayn sistemi ilə uyğun stil tətbiq et
  - _Tələblər: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 4.1 `ShowcaseModal` üçün unit testlər yaz
    - Modal render olduqda 3 sahənin mövcudluğunu yoxla (Tələb 1.2)
    - Boş forma göndərildikdə xəta mesajının göründüyünü yoxla (Tələb 1.4)
    - _Tələblər: 1.2, 1.4_

- [x] 5. Checkpoint — Servis və komponent testlərini yoxla
  - Bütün testlərin keçdiyini yoxla, suallar yaranarsa istifadəçiyə müraciət et.

- [x] 6. `Profile.jsx`-ə showcase state-i və handler-ları əlavə et
  - `Profile.jsx`-ə `showcases` state-i əlavə et: `useState([])`
  - `showcaseModal` state-i əlavə et: `useState(null)` — hansı layihə üçün modal açıqdır
  - `showcaseToDeleteId` state-i əlavə et: `useState(null)` — silmə təsdiqi üçün
  - Mövcud `useEffect` daxilindəki layihə yükləmə hissəsinə `showcaseService.getByProject()` ilə showcase yükləmə əlavə et
  - `handleAddShowcase(showcase)` handler-i yaz — yeni showcase-i `showcases` state-inə əlavə edir
  - `handleDeleteShowcase(id)` handler-i yaz — `showcaseService.remove(id)` çağırır, state-i yeniləyir
  - `useScrollLock` hook-una `!!showcaseModal || !!showcaseToDeleteId` şərtini əlavə et
  - _Tələblər: 1.1, 3.1, 4.2, 4.3, 4.4, 5.4_

- [x] 7. `Profile.jsx`-ə showcase UI-ını inteqrasiya et
  - `projects` tabındakı hər layihə kartına aşağıdakıları əlavə et:
    - `p.status === 'completed'` olduqda `ShowcaseList` komponentini render et
    - `p.status === 'completed'` və `showcaseService.isParticipant(currentUser?.id, p)` şərti doğruysa "Showcase Əlavə Et" düyməsi göstər
    - `p.status === 'active'` olduqda showcase UI-ını gizlət (Tələb 2.1)
    - İştirakçı deyilsə "Showcase Əlavə Et" düyməsini göstərmə (Tələb 2.3)
  - `ShowcaseModal` komponentini `showcaseModal !== null` olduqda render et
  - Silmə təsdiqi üçün `ConfirmModal` komponentini `showcaseToDeleteId !== null` olduqda render et
  - `ShowcaseList`-ə `isOwnProfile` prop-unu ötür
  - _Tələblər: 2.1, 2.2, 2.3, 3.1, 3.4, 4.2, 4.4, 6.1, 6.2, 6.3_

  - [ ]* 7.1 `Profile.jsx` inteqrasiyası üçün unit testlər yaz
    - Canlı linkin `target="_blank"` atributunu yoxla (Tələb 3.3)
    - Silmə düyməsinə basıldıqda `ConfirmModal`-ın açıldığını yoxla (Tələb 4.2)
    - Silmə ləğv edildikdə localStorage-ın dəyişmədiyini yoxla (Tələb 4.4)
    - Başqa istifadəçinin profilindəki showcase-lərin oxuma rejimində göstərildiyini yoxla (Tələb 6.1, 6.2)
    - _Tələblər: 3.3, 4.2, 4.4, 6.1, 6.2_

- [x] 8. Property testlərini tamamla
  - [ ]* 8.1 Xüsusiyyət 1 üçün property testi yaz: Showcase Saxlama Round-Trip
    - **Xüsusiyyət 1: Showcase Saxlama Round-Trip**
    - Etibarlı showcase input kombinasiyası əlavə edildikdən sonra `DB.get('showcases')` həmin elementi `projectId`, `userId`, `createdAt` sahələri ilə qaytarmalıdır
    - `fc.record({ projectId: fc.string(), userId: fc.string(), liveUrl: fc.option(fc.webUrl()), description: fc.option(fc.string()) })` ilə test yaz
    - **Yoxlayır: Tələb 1.3, Tələb 5.1, Tələb 5.2, Tələb 5.3**

  - [ ]* 8.2 Xüsusiyyət 5 üçün property testi yaz: Çoxlu Showcase Əlavə Etmə İnvariantı
    - **Xüsusiyyət 5: Çoxlu Showcase Əlavə Etmə İnvariantı**
    - Eyni layihəyə N showcase əlavə edildikdə `DB.get('showcases')` həmin layihəyə aid N elementi qaytarmalıdır
    - `fc.integer({ min: 1, max: 10 })` ilə N dəyəri generasiya et
    - **Yoxlayır: Tələb 2.4**

  - [ ]* 8.3 Xüsusiyyət 6 üçün property testi yaz: Showcase Sıralama İnvariantı
    - **Xüsusiyyət 6: Showcase Sıralama İnvariantı**
    - `getByProject()` funksiyasının qaytardığı siyahıda hər element özündən sonrakıdan daha böyük və ya bərabər `createdAt` dəyərinə malik olmalıdır
    - `fc.array(fc.integer({ min: 0 }))` ilə müxtəlif `createdAt` dəyərləri generasiya et
    - **Yoxlayır: Tələb 3.5**

  - [ ]* 8.4 Xüsusiyyət 7 üçün property testi yaz: Showcase Silmə Round-Trip
    - **Xüsusiyyət 7: Showcase Silmə Round-Trip**
    - Əlavə edildikdən sonra silinən showcase `DB.get('showcases')`-də artıq olmamalıdır
    - `fc.record(...)` ilə showcase generasiya et, əlavə et, sil, yoxla
    - **Yoxlayır: Tələb 4.3**

- [x] 9. Son Checkpoint — Bütün testlər keçir
  - Bütün testlərin keçdiyini yoxla, suallar yaranarsa istifadəçiyə müraciət et.

## Qeydlər

- `*` ilə işarələnmiş tapşırıqlar könüllüdür və sürətli MVP üçün keçilə bilər
- Hər tapşırıq izlənə bilmək üçün müvafiq tələblərə istinad edir
- Property testləri universal düzgünlük xüsusiyyətlərini yoxlayır; unit testlər isə konkret nümunələri və kenar halları əhatə edir
- Bütün property testləri `src/test/projectShowcase.property.test.js` faylında, unit testlər isə `src/test/projectShowcase.test.jsx` faylında yazılır
- Test teq formatı: `// Feature: project-showcase, Property N: [Xüsusiyyət Adı]`
- Minimum iterasiya: hər xüsusiyyət üçün **100** (`{ numRuns: 100 }`)
