# Dizayn Sənədi: Role Slot Auto-Close

## Xülasə

Bu sənəd `role-slot-auto-close` xüsusiyyətinin texniki dizaynını əhatə edir. Xüsusiyyət layihə paylaşımı zamanı müəyyən edilmiş rol yuvalarının (role slots) avtomatik bağlanmasını təmin edir: layihə sahibi hər peşə kateqoriyası üçün neçə nəfər lazım olduğunu qeyd edir, müraciətçi qəbul edildikdə həmin kateqoriyanın sayacı artır, say dolduqda yuva avtomatik `'closed'` vəziyyətinə keçir və bütün istifadəçilərə bu vəziyyət görünür.

---

## Arxitektura

Layihə `localStorage`-əsaslı, React SPA arxitekturasına malikdir. Backend yoxdur — bütün məlumatlar `services/db.js` vasitəsilə `localStorage`-da saxlanılır.

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                             │
│                                                             │
│  NewProject.jsx          Discover.jsx                       │
│  (Rol yuvası yaratma)    (Kart görünüşü + müraciət)         │
│                                                             │
│                  ProjectApplicantsModal.jsx                 │
│                  (Müraciət qəbul/rədd + auto-close)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Business Logic                           │
│                                                             │
│  roleSlotUtils.js  (yeni köməkçi modul)                     │
│  - createRoleSlot()                                         │
│  - validateRoleSlot()                                       │
│  - getOpenSlots()                                           │
│  - acceptApplicantWithSlot()                                │
│  - allSlotsClosed()                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Data Layer                               │
│                                                             │
│  services/db.js  (mövcud DB xidməti)                        │
│  localStorage: lu_projects                                  │
└─────────────────────────────────────────────────────────────┘
```

**Əsas dizayn qərarı:** Bütün rol yuvası məntiqi `src/services/roleSlotUtils.js` adlı ayrı bir köməkçi modulda cəmləşdirilir. Bu, UI komponentlərini sadə saxlayır, məntiqi test edilə bilən funksiyalara çevirir və gələcəkdə backend inteqrasiyasını asanlaşdırır.

---

## Komponentlər və İnterfeyslər

### 1. `src/services/roleSlotUtils.js` (Yeni Modul)

Bütün rol yuvası biznes məntiqini ehtiva edən saf funksiyalar toplusu.

```js
/**
 * Yeni rol yuvası obyekti yaradır.
 * @param {string} category - Kateqoriya adı
 * @param {number} count - Tələb olunan say (1-10)
 * @returns {{ id, category, count, filledCount, status }}
 */
export function createRoleSlot(category, count)

/**
 * Rol yuvasının kateqoriya adını yoxlayır.
 * @param {string} category
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRoleSlotCategory(category)

/**
 * Layihənin açıq rol yuvalarını qaytarır.
 * @param {Array} roleSlots
 * @returns {Array} - yalnız status: 'open' olan yuvalar
 */
export function getOpenSlots(roleSlots)

/**
 * Bütün rol yuvalarının bağlı olub-olmadığını yoxlayır.
 * @param {Array} roleSlots
 * @returns {boolean}
 */
export function allSlotsClosed(roleSlots)

/**
 * Müraciəti qəbul edərkən rol yuvasını yeniləyir.
 * filledCount artırır, lazım gəldikdə status-u 'closed'-a çevirir.
 * @param {Array} roleSlots - layihənin roleSlots massivi
 * @param {string|null} roleSlotId - müraciətin roleSlot sahəsi
 * @returns {{ updatedSlots: Array, slotClosed: boolean, closedSlotCategory: string|null }}
 */
export function acceptApplicantWithSlot(roleSlots, roleSlotId)

/**
 * Layihənin roleSlots sahəsini normallaşdırır (köhnə layihələr üçün).
 * @param {object} project
 * @returns {Array} - roleSlots massivi (boş massiv əgər yoxdursa)
 */
export function normalizeRoleSlots(project)
```

### 2. `src/pages/NewProject.jsx` (Dəyişiklik)

**Addım 2-yə əlavə ediləcək:**
- Rol yuvası siyahısı (state: `roleSlots`)
- "Yuva əlavə et" düyməsi
- Hər yuva üçün: kateqoriya adı input, say seçici (1-10), silmə düyməsi
- Maksimum 10 yuva məhdudiyyəti
- Boş kateqoriya adı validasiyası

**`handleCreate` funksiyasına əlavə:**
```js
roleSlots: roleSlots  // { id, category, count, filledCount: 0, status: 'open' }[]
```

### 3. `src/pages/Discover.jsx` (Dəyişiklik)

**Layihə kartına əlavə ediləcək:**
- `roleSlots` bölməsi: hər yuva üçün kateqoriya adı, `filledCount/count`, status badge
- Boş `roleSlots` halında bölmə gizlədilir

**`handleApply` funksiyasına dəyişiklik:**
- `roleSlots` varsa: rol seçim modalı/dropdown göstərilir
- Seçilmiş `roleSlotId` müraciətin `roleSlot` sahəsinə yazılır
- Bütün yuvalar bağlıdırsa: düymə deaktiv edilir

**Yeni state:**
```js
const [applySlotModal, setApplySlotModal] = useState(null); // { projectId, openSlots }
```

### 4. `src/components/discover/ProjectApplicantsModal.jsx` (Dəyişiklik)

**Modalın yuxarı hissəsinə əlavə:**
- Rol yuvası xülasəsi: hər yuva üçün `category: filledCount/count` + status badge

**Hər müraciət kartına əlavə:**
- Müraciətin aid olduğu rol kateqoriyasının adı
- `roleSlot: null` halında "Ümumi müraciət" etiketi

**`handleAccept` funksiyasına dəyişiklik:**
- `acceptApplicantWithSlot()` köməkçi funksiyasını çağırır
- Yuva bağlandıqda toast bildirişi göstərir
- Bağlı yuvaya aid gözləyən müraciətlər üçün "Qəbul et" düyməsi deaktiv edilir

---

## Məlumat Modelləri

### RoleSlot Obyekti

```js
{
  id: string,          // uid() ilə yaradılmış unikal ID
  category: string,    // Kateqoriya adı, məs. "Qrafik Dizayner"
  count: number,       // Tələb olunan ümumi say (1-10)
  filledCount: number, // Qəbul edilmiş iştirakçı sayı (0-dan başlayır)
  status: 'open' | 'closed'  // 'open': müraciət qəbul edilir, 'closed': dolu
}
```

### Yenilənmiş Project Obyekti

```js
{
  id: string,
  title: string,
  desc: string,
  authorId: string,
  skills: string[],
  roleSlots: RoleSlot[],  // YENİ SAHƏ (köhnə layihələrdə mövcud olmaya bilər)
  applicants: Applicant[],
  status: 'active' | 'closed' | 'completed',
  // ... digər mövcud sahələr
}
```

### Yenilənmiş Applicant Obyekti

```js
{
  id: string,           // İstifadəçi ID-si
  status: 'pending' | 'accepted' | 'rejected',
  roleSlot: string | null  // YENİ SAHƏ: RoleSlot.id və ya null (köhnə format)
}
```

### Geriyə Dönük Uyğunluq

- `project.roleSlots` mövcud deyilsə → `[]` kimi qəbul edilir
- `applicant.roleSlot` mövcud deyilsə → `null` kimi qəbul edilir, yuva sayacı dəyişdirilmir

---

## Düzgünlük Xüsusiyyətləri

*Xüsusiyyət (property) — sistemin bütün etibarlı icraları boyunca doğru olmalı olan bir xarakteristika və ya davranışdır. Xüsusiyyətlər insan tərəfindən oxunan spesifikasiyalar ilə maşın tərəfindən yoxlanıla bilən düzgünlük zəmanətləri arasında körpü rolunu oynayır.*

### Xüsusiyyət 1: Rol Yuvası Silmə İnvariantı

*Hər hansı bir* rol yuvası siyahısı və etibarlı indeks üçün, həmin indeksdəki yuvası sildikdən sonra siyahının uzunluğu 1 azalmalı və silinmiş yuva siyahıda olmamalıdır.

**Yoxlayır: Tələb 1.4**

---

### Xüsusiyyət 2: Yeni Rol Yuvasının Strukturu

*Hər hansı bir* etibarlı kateqoriya adı və say (1-10) üçün, `createRoleSlot()` funksiyası `filledCount: 0` və `status: 'open'` olan düzgün strukturlu yuva qaytarmalıdır.

**Yoxlayır: Tələb 1.5**

---

### Xüsusiyyət 3: Boş Kateqoriya Adının Rədd Edilməsi

*Hər hansı bir* yalnız boşluqlardan ibarət (və ya tamamilə boş) kateqoriya adı üçün, `validateRoleSlotCategory()` funksiyası həmin adı etibarsız kimi qəbul etməlidir.

**Yoxlayır: Tələb 1.6**

---

### Xüsusiyyət 4: Açıq Yuvalar Filtrasiyası

*Hər hansı bir* açıq və bağlı yuvalar qarışığından ibarət layihə üçün, `getOpenSlots()` funksiyası yalnız `status: 'open'` olan yuvaları qaytarmalıdır.

**Yoxlayır: Tələblər 2.1, 4.5**

---

### Xüsusiyyət 5: Müraciətin Rol Yuvası ilə Əlavə Edilməsi

*Hər hansı bir* istifadəçi və açıq rol yuvası üçün, müraciət etdikdən sonra `applicants` massivindəki yeni giriş seçilmiş `roleSlot` ID-sini ehtiva etməlidir.

**Yoxlayır: Tələb 2.2**

---

### Xüsusiyyət 6: Bütün Yuvalar Bağlı Olduqda Müraciətin Bloklanması

*Hər hansı bir* bütün rol yuvaları `status: 'closed'` olan layihə üçün, `allSlotsClosed()` funksiyası `true` qaytarmalıdır.

**Yoxlayır: Tələb 2.3**

---

### Xüsusiyyət 7: Müraciətin Təkrarlanmaması (İdempotentlik)

*Hər hansı bir* artıq müraciət etmiş istifadəçi üçün, ikinci müraciət cəhdi `applicants` massivinə dublikat giriş əlavə etməməlidir.

**Yoxlayır: Tələb 2.4**

---

### Xüsusiyyət 8: Qəbul Zamanı filledCount Artımı

*Hər hansı bir* `filledCount` dəyəri olan rol yuvası üçün, həmin yuvaya aid müraciəti qəbul etdikdən sonra `filledCount` dəqiq 1 artmalıdır.

**Yoxlayır: Tələb 3.1**

---

### Xüsusiyyət 9: Yuvanın Avtomatik Bağlanması

*Hər hansı bir* `count` dəyəri olan rol yuvası üçün, `filledCount` dəyəri `count`-a bərabər olduqda yuvanın `status`-u `'closed'`-a dəyişməlidir.

**Qeyd:** Xüsusiyyət 8 ilə birlikdə: `filledCount` artımı və avtomatik bağlanma eyni `acceptApplicantWithSlot()` funksiyasında baş verir. Bu iki xüsusiyyət birlikdə tam davranışı əhatə edir.

**Yoxlayır: Tələblər 3.1, 3.2**

---

### Xüsusiyyət 10: Köhnə Format Müraciətlərinin Uyğunluğu

*Hər hansı bir* `roleSlot: null` olan müraciəti qəbul etdikdə, heç bir rol yuvasının `filledCount` dəyəri dəyişməməlidir.

**Yoxlayır: Tələblər 3.5, 6.2**

---

### Xüsusiyyət 11: Köhnə Layihələrin Normallaşdırılması

*Hər hansı bir* `roleSlots` sahəsi olmayan layihə üçün, `normalizeRoleSlots()` funksiyası boş massiv qaytarmalı və xəta verməməlidir.

**Yoxlayır: Tələb 6.1**

---

### Xüsusiyyət 12: roleSlots-un DB-də Saxlanması (Round-Trip)

*Hər hansı bir* `roleSlots` massivi olan layihə üçün, DB-yə yazıb oxuduqdan sonra `roleSlots` massivi dəqiq eyni məlumatları ehtiva etməlidir.

**Yoxlayır: Tələb 6.3**

---

## Xəta İdarəetməsi

| Ssenari | Davranış |
|---|---|
| Boş kateqoriya adı ilə yuva əlavə etmə | Validasiya xətası göstərilir, yuva saxlanılmır |
| 10-dan çox yuva əlavə etmə cəhdi | "Qəbul et" düyməsi deaktiv edilir, xəbərdarlıq göstərilir |
| Bütün yuvalar bağlı olan layihəyə müraciət | Müraciət düyməsi deaktiv, "Bütün yerlər doludur" mesajı |
| Artıq müraciət etmiş istifadəçinin yenidən müraciəti | Toast bildirişi: "Artıq müraciət etmisiniz", əlavə edilmir |
| `roleSlots` sahəsi olmayan köhnə layihə | `[]` kimi qəbul edilir, xəta verilmir |
| `roleSlot: null` olan köhnə müraciətin qəbulu | Yalnız müraciət statusu dəyişir, yuva sayacı toxunulmaz qalır |
| Bağlı yuvaya aid gözləyən müraciətin qəbul cəhdi | "Qəbul et" düyməsi deaktiv edilir |

---

## Test Strategiyası

### Yanaşma

Bu xüsusiyyət üçün ikili test yanaşması tətbiq edilir:

- **Unit testlər**: `roleSlotUtils.js` funksiyaları üçün xüsusi nümunələr, sərhəd halları və xəta şərtləri
- **Property-based testlər**: Universal xüsusiyyətlər üçün `fast-check` kitabxanası ilə (artıq `devDependencies`-də mövcuddur)

### Property-Based Test Konfiqurasiyası

- Kitabxana: `fast-check` (v4.6.0, artıq quraşdırılıb)
- Test runner: `vitest` (mövcud konfiqurasiya)
- Minimum 100 iterasiya hər property testi üçün
- Hər test dizayn sənədindəki xüsusiyyətə istinad edir

**Etiket formatı:** `// Feature: role-slot-auto-close, Property {N}: {xüsusiyyət mətni}`

### Test Faylları

```
src/test/
  roleSlotUtils.test.js          # Unit testlər (roleSlotUtils.js funksiyaları)
  roleSlotUtils.property.test.js # Property-based testlər (fast-check)
  roleSlotAutoClose.test.jsx     # Komponent inteqrasiya testləri
```

### Unit Test Əhatəsi

`roleSlotUtils.js` üçün:
- `createRoleSlot()`: düzgün struktur, default dəyərlər
- `validateRoleSlotCategory()`: boş string, yalnız boşluqlar, etibarlı ad
- `getOpenSlots()`: qarışıq status massivi, boş massiv
- `allSlotsClosed()`: hamısı bağlı, biri açıq, boş massiv
- `acceptApplicantWithSlot()`: normal qəbul, son qəbul (bağlanma), null roleSlot
- `normalizeRoleSlots()`: roleSlots olmayan layihə, mövcud roleSlots

### Property-Based Test Əhatəsi

Yuxarıdakı 12 xüsusiyyətin hər biri üçün ayrı property testi:

```js
// Nümunə: Xüsusiyyət 9 — Avtomatik Bağlanma
// Feature: role-slot-auto-close, Property 9: Yuvanın Avtomatik Bağlanması
fc.assert(fc.property(
  fc.integer({ min: 1, max: 10 }),  // count
  (count) => {
    const slot = createRoleSlot('Test', count);
    // count-1 dəfə qəbul et
    let slots = [slot];
    for (let i = 0; i < count - 1; i++) {
      const result = acceptApplicantWithSlot(slots, slot.id);
      slots = result.updatedSlots;
    }
    // Son qəbul
    const final = acceptApplicantWithSlot(slots, slot.id);
    return final.slotClosed === true &&
           final.updatedSlots[0].status === 'closed';
  }
), { numRuns: 100 });
```

### Komponent Testləri

`ProjectApplicantsModal` üçün:
- Rol kateqoriyası adının göstərilməsi
- Bağlı yuvaya aid "Qəbul et" düyməsinin deaktiv olması
- Toast bildirişinin göstərilməsi
- `onProjectUpdated` callback-inin çağırılması

`Discover` üçün:
- Rol yuvası bölməsinin göstərilməsi/gizlədilməsi
- Bütün yuvalar bağlı olduqda müraciət düyməsinin deaktiv olması
- Rol seçim interfeysi

`NewProject` üçün:
- Rol yuvası əlavə etmə/silmə
- 10 yuva məhdudiyyəti
- Boş kateqoriya validasiyası
