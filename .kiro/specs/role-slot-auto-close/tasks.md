# İcra Planı: Role Slot Auto-Close

## Xülasə

Bu plan `role-slot-auto-close` xüsusiyyətini addım-addım həyata keçirir. Əvvəlcə bütün biznes məntiqini ehtiva edən `roleSlotUtils.js` köməkçi modulu yaradılır, sonra `NewProject.jsx`, `Discover.jsx` və `ProjectApplicantsModal.jsx` komponentləri ardıcıl olaraq yenilənir. Hər addım əvvəlki addım üzərində qurulur və sonda bütün hissələr bir-birinə bağlanır.

## Tapşırıqlar

- [x] 1. `roleSlotUtils.js` köməkçi modulunu yarat
  - `src/services/roleSlotUtils.js` faylını yarat
  - `createRoleSlot(category, count)` funksiyasını yaz: `uid()` ilə unikal `id`, verilmiş `category` və `count`, `filledCount: 0`, `status: 'open'` olan obyekt qaytarsın
  - `validateRoleSlotCategory(category)` funksiyasını yaz: boş string və yalnız boşluqlardan ibarət dəyərləri rədd etsin, `{ valid: boolean, error?: string }` qaytarsın
  - `getOpenSlots(roleSlots)` funksiyasını yaz: yalnız `status: 'open'` olan yuvaları qaytarsın
  - `allSlotsClosed(roleSlots)` funksiyasını yaz: massiv boş deyilsə və hamısı `'closed'`-dursa `true` qaytarsın
  - `acceptApplicantWithSlot(roleSlots, roleSlotId)` funksiyasını yaz: `roleSlotId` null deyilsə uyğun yuvanın `filledCount`-unu artırsın, `filledCount === count` olduqda `status`-u `'closed'`-a çevirsin; `{ updatedSlots, slotClosed, closedSlotCategory }` qaytarsın
  - `normalizeRoleSlots(project)` funksiyasını yaz: `project.roleSlots` mövcud deyilsə boş massiv qaytarsın
  - Bütün funksiyaları `export` et
  - _Tələblər: 1.5, 1.6, 2.1, 2.3, 3.1, 3.2, 3.5, 6.1_

- [ ]* 1.1 `roleSlotUtils.js` üçün unit testlər yaz
  - `src/test/roleSlotUtils.test.js` faylını yarat
  - `createRoleSlot()`: düzgün struktur, `filledCount: 0`, `status: 'open'` default dəyərləri
  - `validateRoleSlotCategory()`: boş string, yalnız boşluqlar, etibarlı ad
  - `getOpenSlots()`: qarışıq status massivi, boş massiv
  - `allSlotsClosed()`: hamısı bağlı, biri açıq, boş massiv
  - `acceptApplicantWithSlot()`: normal qəbul (filledCount artımı), son qəbul (avtomatik bağlanma), `null` roleSlot (heç nə dəyişmir)
  - `normalizeRoleSlots()`: `roleSlots` olmayan layihə, mövcud `roleSlots`
  - _Tələblər: 1.5, 1.6, 2.1, 2.3, 3.1, 3.2, 3.5, 6.1_

- [ ]* 1.2 `roleSlotUtils.js` üçün property-based testlər yaz
  - `src/test/roleSlotUtils.property.test.js` faylını yarat; `fast-check` istifadə et
  - **Xüsusiyyət 1: Rol Yuvası Silmə İnvariantı** — hər hansı massiv və etibarlı indeks üçün silmədən sonra uzunluq 1 azalır, silinmiş yuva massivdə olmur — _Tələb 1.4_
  - **Xüsusiyyət 2: Yeni Rol Yuvasının Strukturu** — hər hansı etibarlı kateqoriya adı və say (1-10) üçün `createRoleSlot()` `filledCount: 0` və `status: 'open'` qaytarır — _Tələb 1.5_
  - **Xüsusiyyət 3: Boş Kateqoriya Adının Rədd Edilməsi** — hər hansı boş/yalnız boşluq kateqoriya adı üçün `validateRoleSlotCategory()` etibarsız qaytarır — _Tələb 1.6_
  - **Xüsusiyyət 4: Açıq Yuvalar Filtrasiyası** — hər hansı qarışıq massiv üçün `getOpenSlots()` yalnız `status: 'open'` olanları qaytarır — _Tələblər 2.1, 4.5_
  - **Xüsusiyyət 6: Bütün Yuvalar Bağlı Olduqda Bloklanma** — hamısı `'closed'` olan massiv üçün `allSlotsClosed()` `true` qaytarır — _Tələb 2.3_
  - **Xüsusiyyət 8: Qəbul Zamanı filledCount Artımı** — hər hansı yuva üçün qəbuldan sonra `filledCount` dəqiq 1 artır — _Tələb 3.1_
  - **Xüsusiyyət 9: Yuvanın Avtomatik Bağlanması** — `filledCount` `count`-a bərabər olduqda `status` `'closed'`-a dəyişir — _Tələblər 3.1, 3.2_
  - **Xüsusiyyət 10: Köhnə Format Müraciətlərinin Uyğunluğu** — `roleSlot: null` ilə qəbulda heç bir yuvanın `filledCount`-u dəyişmir — _Tələblər 3.5, 6.2_
  - **Xüsusiyyət 11: Köhnə Layihələrin Normallaşdırılması** — `roleSlots` sahəsi olmayan layihə üçün `normalizeRoleSlots()` boş massiv qaytarır, xəta vermir — _Tələb 6.1_
  - Hər test üçün minimum 100 iterasiya (`numRuns: 100`)
  - Hər testin başında `// Feature: role-slot-auto-close, Property N: ...` şəklində şərh yaz

- [x] 2. `NewProject.jsx`-ə rol yuvası idarəetmə interfeysi əlavə et
  - `roleSlots` state-ini əlavə et: `useState([])`; redaktə rejimində mövcud `roleSlots`-u yüklə
  - `handleAddSlot()` funksiyasını yaz: `validateRoleSlotCategory()` ilə kateqoriya adını yoxla, xəta varsa göstər; 10 yuva limitini yoxla; `createRoleSlot()` ilə yeni yuva yarat və state-ə əlavə et
  - `handleRemoveSlot(id)` funksiyasını yaz: həmin `id`-li yuvası `roleSlots` state-indən çıxar
  - Addım 2-nin UI-ına rol yuvası bölməsi əlavə et: kateqoriya adı input, say seçici (1-10 arası `<select>` və ya `<input type="number">`), "Əlavə et" düyməsi, mövcud yuvalar siyahısı (hər yuva üçün kateqoriya adı, say, silmə düyməsi)
  - 10 yuva limitinə çatıldıqda "Əlavə et" düyməsini deaktiv et və xəbərdarlıq göstər
  - `handleCreate()` funksiyasında `roleSlots` massivini yeni/redaktə edilən layihə obyektinə əlavə et
  - _Tələblər: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ]* 2.1 `NewProject` komponent testlərini yaz
  - `src/test/NewProject.roleSlots.test.jsx` faylını yarat
  - Rol yuvası əlavə etmə: düzgün kateqoriya adı ilə yuva əlavə edilir
  - Boş kateqoriya adı ilə əlavə etmə cəhdi: xəta mesajı göstərilir, yuva əlavə edilmir
  - 10 yuva limitinə çatıldıqda "Əlavə et" düyməsi deaktiv olur
  - Yuva silmə: həmin yuva siyahıdan çıxır
  - `handleCreate` çağırıldıqda `roleSlots` layihə obyektinə daxil edilir
  - _Tələblər: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 3. Checkpoint — Əsas testlər keçir
  - Bütün testlər keçir, suallar yaranarsa istifadəçiyə müraciət et.

- [x] 4. `Discover.jsx`-ə rol yuvası görünüşü və müraciət məntiqi əlavə et
  - `roleSlotUtils.js`-dən `getOpenSlots`, `allSlotsClosed`, `normalizeRoleSlots` funksiyalarını import et
  - `applySlotModal` state-ini əlavə et: `useState(null)` — `{ projectId, openSlots }` saxlayır
  - Layihə kartında `roleSlots` bölməsi əlavə et: `normalizeRoleSlots(p)` ilə yuvalar alınsın; boş deyilsə hər yuva üçün kateqoriya adı, `filledCount/count`, status badge göstərilsin (`status: 'open'` → yaşıl "Açıq", `status: 'closed'` → qırmızı "Dolu"); `roleSlots` boşdursa bölmə gizlədilsin
  - `handleApply()` funksiyasını yenilə: `roleSlots` varsa `applySlotModal`-ı aç; `allSlotsClosed()` `true` qaytarırsa müraciət düyməsini deaktiv et; `roleSlots` boşdursa köhnə davranışı qoru (rol seçimi olmadan müraciət)
  - Rol seçim modalını/dropdown-unu yarat: yalnız `getOpenSlots()` ilə açıq yuvalar göstərilsin; istifadəçi yuva seçdikdə `applicants` massivinə `{ id: currentUser.id, status: 'pending', roleSlot: seçilmişYuvaId }` əlavə edilsin
  - Bütün yuvalar bağlıdırsa müraciət düyməsinin mətni "Bütün yerlər doludur" olsun
  - Artıq müraciət etmiş istifadəçi üçün mövcud "Artıq müraciət etmisiniz" toast davranışını qoru
  - **Xüsusiyyət 5: Müraciətin Rol Yuvası ilə Əlavə Edilməsi** — müraciət sonrası `applicants`-dakı yeni giriş seçilmiş `roleSlot` ID-sini ehtiva edir — _Tələb 2.2_
  - **Xüsusiyyət 7: Müraciətin Təkrarlanmaması** — ikinci müraciət cəhdi `applicants`-a dublikat əlavə etmir — _Tələb 2.4_
  - _Tələblər: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5, 6.1_

- [ ]* 4.1 `Discover` komponent testlərini yaz
  - `src/test/Discover.roleSlots.test.jsx` faylını yarat
  - `roleSlots` olan layihə kartında yuva bölməsinin göstərilməsi
  - `roleSlots` boş olan layihə kartında yuva bölməsinin gizlədilməsi
  - Bütün yuvalar bağlı olduqda müraciət düyməsinin deaktiv olması
  - Rol seçim interfeysi: yalnız açıq yuvalar göstərilir
  - Müraciət sonrası `applicants`-a `roleSlot` ID-si ilə giriş əlavə edilir
  - _Tələblər: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. `ProjectApplicantsModal.jsx`-ə rol yuvası məntiqi əlavə et
  - `roleSlotUtils.js`-dən `acceptApplicantWithSlot`, `normalizeRoleSlots` funksiyalarını import et
  - Modalın yuxarı hissəsinə rol yuvası xülasəsi əlavə et: `normalizeRoleSlots(project)` ilə yuvalar alınsın; hər yuva üçün `category: filledCount/count` və status badge göstərilsin; `roleSlots` boşdursa bu bölmə gizlədilsin
  - Hər müraciət kartına rol kateqoriyası adını əlavə et: `applicant.roleSlot` ID-si ilə uyğun yuvanı tap, kateqoriya adını göstər; `roleSlot` null/boşdursa "Ümumi müraciət" etiketini göstər
  - `handleAccept()` funksiyasını yenilə: `acceptApplicantWithSlot(normalizeRoleSlots(project), applicant.roleSlot)` çağır; `updatedSlots`-u layihəyə yaz; `slotClosed === true` olduqda toast bildirişi göstər (`"${closedSlotCategory} yuvası dolduruldu"` formatında); yenilənmiş layihəni DB-yə yaz və `onProjectUpdated` callback-ini çağır
  - Bağlı yuvaya (`status: 'closed'`) aid gözləyən müraciətlər üçün "Qəbul et" düyməsini deaktiv et
  - `roleSlot: null` olan köhnə format müraciətlər üçün yalnız `status: 'accepted'`-ə çevir, yuva sayacına toxunma
  - **Xüsusiyyət 12: roleSlots-un DB-də Saxlanması (Round-Trip)** — yenilənmiş layihə DB-yə yazılıb oxunduqda `roleSlots` massivi dəqiq eyni məlumatları ehtiva edir — _Tələb 6.3_
  - _Tələblər: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 6.2, 6.3_

- [ ]* 5.1 `ProjectApplicantsModal` komponent testlərini yaz
  - `src/test/ProjectApplicantsModal.roleSlots.test.jsx` faylını yarat
  - Rol kateqoriyası adının hər müraciət kartında göstərilməsi
  - `roleSlot: null` olan müraciətin yanında "Ümumi müraciət" etiketinin göstərilməsi
  - Bağlı yuvaya aid gözləyən müraciət üçün "Qəbul et" düyməsinin deaktiv olması
  - Qəbul zamanı `acceptApplicantWithSlot()` çağırılması və `filledCount` artımı
  - Yuva bağlandıqda toast bildirişinin göstərilməsi
  - `onProjectUpdated` callback-inin yenilənmiş layihə ilə çağırılması
  - _Tələblər: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4_

- [ ]* 5.2 `roleSlots` DB round-trip property testini yaz
  - `roleSlotUtils.property.test.js` faylına əlavə et (və ya ayrı fayl)
  - **Xüsusiyyət 12: roleSlots-un DB-də Saxlanması** — hər hansı `roleSlots` massivi olan layihə üçün DB-yə yazıb oxuduqdan sonra massiv dəqiq eyni məlumatları ehtiva edir — _Tələb 6.3_

- [x] 6. Son Checkpoint — Bütün testlər keçir
  - Bütün testlər keçir, suallar yaranarsa istifadəçiyə müraciət et.

## Qeydlər

- `*` ilə işarələnmiş tapşırıqlar könüllüdür və sürətli MVP üçün keçilə bilər
- Hər tapşırıq izlənə bilmə üçün müvafiq tələblərə istinad edir
- Property testlər universal düzgünlük xüsusiyyətlərini, unit testlər isə xüsusi nümunə və sərhəd hallarını yoxlayır
- `roleSlotUtils.js` saf funksiyalar toplusudur — UI komponentlərindən asılılığı yoxdur
- Köhnə layihə və müraciət formatları bütün komponentlərdə `normalizeRoleSlots()` və `roleSlot: null` yoxlaması ilə idarə edilir
