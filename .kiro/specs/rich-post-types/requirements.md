# Requirements Document

## Introduction

LinkUp platformasında mövcud post paylaşım sistemi adi sosial şəbəkələrdən fərqlənmir — istifadəçi mətn + şəkil paylaşır, vəssalam. Bu xüsusiyyət, platformanı peşəkar sahə insanları üçün fərqləndirəcək **zəngin post tipləri** əlavə edir: Kod, Dizayn, Layihə və "Öyrəndim" formatları. Hər tip öz xüsusi sahələrinə, feed-də fərqli görünüşünə və strukturuna malikdir. Məqsəd: LinkedIn-dən (çox formal), Instagram-dan (çox vizual) və GitHub-dan (çox texniki) fərqlənən, sahə insanları üçün xüsusi bir platforma yaratmaq.

## Glossary

- **Post_Creator**: `NewPostModal.jsx` — istifadəçinin yeni post yaratdığı interfeys komponenti
- **Post_Card**: `PostCard.jsx` — feed-də hər bir postu göstərən kart komponenti
- **Feed**: `Dashboard.jsx` — bütün postların sıralandığı ana səhifə axını
- **Rich_Post**: Tip-spesifik əlavə sahələrə malik olan strukturlaşdırılmış post
- **Post_Type**: Postun kateqoriyası — `code`, `design`, `project`, `learned`
- **Code_Block**: Syntax highlighting ilə göstərilən kod parçası
- **DB**: `src/services/db.js` — localStorage əsaslı məlumat saxlama xidməti
- **Type_Badge**: Feed-də post tipini göstərən rəngli etiket
- **Type_Form**: Seçilmiş post tipinə uyğun əlavə sahələr formu

---

## Requirements

### Requirement 1: Post Tipi Seçimi

**User Story:** Bir proqramçı, dizayner və ya tələbə olaraq, post yaradarkən məzmunuma uyğun bir tip seçmək istəyirəm ki, paylaşımım daha strukturlu və mənalı olsun.

#### Acceptance Criteria

1. THE Post_Creator SHALL dört post tipi təqdim etsin: `code`, `design`, `project`, `learned`
2. WHEN istifadəçi bir post tipi seçdikdə, THE Post_Creator SHALL həmin tipə uyğun əlavə sahə formu (Type_Form) göstərsin
3. WHEN istifadəçi post tipini dəyişdikdə, THE Post_Creator SHALL əvvəlki tipə aid sahələri sıfırlasın
4. THE Post_Creator SHALL seçilmiş tipi vizual olaraq (rəng, ikon, border) vurğulasın
5. IF istifadəçi heç bir tip seçmədən paylaşmağa cəhd etsə, THEN THE Post_Creator SHALL `learned` tipini default olaraq tətbiq etsin

---

### Requirement 2: Kod Post Tipi

**User Story:** Bir proqramçı olaraq, kod parçalarımı syntax highlighting ilə paylaşmaq istəyirəm ki, digər istifadəçilər kodu oxunaqlı şəkildə görsün.

#### Acceptance Criteria

1. WHEN istifadəçi `code` tipini seçdikdə, THE Post_Creator SHALL aşağıdakı sahələri göstərsin: proqramlaşdırma dili seçimi (dropdown), kod redaktoru (textarea)
2. THE Post_Creator SHALL ən azı bu dilləri dəstəkləsin: JavaScript, TypeScript, Python, Dart, Java, C++, HTML, CSS, SQL, Bash
3. WHEN istifadəçi kod daxil etdikdə, THE Post_Creator SHALL kod redaktorunu monospacefont ilə göstərsin
4. WHEN `code` tipi olan post feed-də göstərildikdə, THE Post_Card SHALL kod məzmununu syntax-highlighted blok kimi render etsin
5. THE Post_Card SHALL kod blokunda seçilmiş proqramlaşdırma dilini etiket kimi göstərsin
6. THE Post_Card SHALL kod blokunda "Kopyala" düyməsi təqdim etsin
7. WHEN istifadəçi "Kopyala" düyməsinə klikdikdə, THE Post_Card SHALL kod məzmununu clipboard-a kopyalasın və vizual təsdiq göstərsin
8. IF kod sahəsi boşdursa, THEN THE Post_Creator SHALL paylaşım düyməsini deaktiv etsin

---

### Requirement 3: Dizayn Post Tipi

**User Story:** Bir UI/UX dizayneri olaraq, dizayn işlərimi istifadə etdiyim alətlər və şəkil/link ilə birlikdə paylaşmaq istəyirəm ki, işim kontekstli görünsün.

#### Acceptance Criteria

1. WHEN istifadəçi `design` tipini seçdikdə, THE Post_Creator SHALL aşağıdakı sahələri göstərsin: şəkil yükləmə/URL, dizayn linki (Figma, Behance, Dribbble və s.), istifadə edilən alətlər (çoxlu seçim)
2. THE Post_Creator SHALL ən azı bu alətləri seçim kimi təqdim etsin: Figma, Adobe XD, Sketch, Illustrator, Photoshop, Canva, Framer, Webflow
3. WHEN `design` tipi olan post feed-də göstərildikdə, THE Post_Card SHALL şəkli tam genişlikdə göstərsin
4. WHEN `design` tipi olan post feed-də göstərildikdə, THE Post_Card SHALL seçilmiş alətləri kiçik etiketlər kimi göstərsin
5. WHERE dizayn linki daxil edilibsə, THE Post_Card SHALL "Dizayna Bax" düyməsi göstərsin
6. IF həm şəkil, həm də dizayn linki boşdursa, THEN THE Post_Creator SHALL paylaşım düyməsini deaktiv etsin

---

### Requirement 4: Layihə Post Tipi

**User Story:** Bir developer olaraq, üzərində işlədiyim layihəni texnologiyalar, GitHub linki və canlı demo ilə paylaşmaq istəyirəm ki, digərləri layihəmi tam anlasın.

#### Acceptance Criteria

1. WHEN istifadəçi `project` tipini seçdikdə, THE Post_Creator SHALL aşağıdakı sahələri göstərsin: layihə adı, qısa təsvir, texnologiyalar (tag input), GitHub linki, canlı demo linki
2. THE Post_Creator SHALL texnologiyaları vergüllə ayrılmış tag kimi daxil etməyə imkan versin
3. WHEN `project` tipi olan post feed-də göstərildikdə, THE Post_Card SHALL layihə adını başlıq kimi, texnologiyaları rəngli tag-lar kimi göstərsin
4. WHERE GitHub linki daxil edilibsə, THE Post_Card SHALL GitHub ikonlu link düyməsi göstərsin
5. WHERE canlı demo linki daxil edilibsə, THE Post_Card SHALL "Canlı Demo" düyməsi göstərsin
6. IF layihə adı boşdursa, THEN THE Post_Creator SHALL paylaşım düyməsini deaktiv etsin

---

### Requirement 5: "Öyrəndim" Post Tipi

**User Story:** Bir tələbə və ya özünü inkişaf etdirən biri olaraq, öyrəndiyim bir şeyi mövzu, səviyyə və qeydlərlə paylaşmaq istəyirəm ki, öyrənmə prosesim görünsün.

#### Acceptance Criteria

1. WHEN istifadəçi `learned` tipini seçdikdə, THE Post_Creator SHALL aşağıdakı sahələri göstərsin: mövzu adı, səviyyə seçimi (Başlanğıc / Orta / Qabaqcıl), qeydlər (textarea), mənbə linki (istəyə görə)
2. THE Post_Creator SHALL səviyyəni üç seçim kimi təqdim etsin: `beginner`, `intermediate`, `advanced`
3. WHEN `learned` tipi olan post feed-də göstərildikdə, THE Post_Card SHALL mövzu adını başlıq kimi, səviyyəni rəngli badge kimi göstərsin
4. THE Post_Card SHALL `beginner` üçün yaşıl, `intermediate` üçün sarı, `advanced` üçün qırmızı rəng istifadə etsin
5. WHERE mənbə linki daxil edilibsə, THE Post_Card SHALL "Mənbəyə Bax" düyməsi göstərsin
6. IF mövzu adı boşdursa, THEN THE Post_Creator SHALL paylaşım düyməsini deaktiv etsin

---

### Requirement 6: Feed-də Fərqli Görünüş

**User Story:** Bir istifadəçi olaraq, feed-də hər post tipini bir baxışda tanımaq istəyirəm ki, məni maraqlandıran məzmuna tez çatım.

#### Acceptance Criteria

1. THE Post_Card SHALL hər post tipi üçün fərqli rəng sxemi istifadə etsin: `code` → cyan, `design` → pink, `project` → green, `learned` → amber
2. THE Post_Card SHALL hər postun yuxarı hissəsində Type_Badge göstərsin
3. WHEN `code` tipi olan post göstərildikdə, THE Post_Card SHALL adi mətn bloku əvəzinə kod bloku render etsin
4. WHEN `project` tipi olan post göstərildikdə, THE Post_Card SHALL texnologiya tag-larını ayrıca bölmə kimi göstərsin
5. WHEN `learned` tipi olan post göstərildikdə, THE Post_Card SHALL səviyyə badge-ini başlığın yanında göstərsin
6. THE Post_Card SHALL tip-spesifik aksiya düymələrini (kopyala, linklər) yalnız həmin tipə aid postlarda göstərsin

---

### Requirement 7: Məlumat Strukturu Uyğunluğu

**User Story:** Bir developer olaraq, yeni post tiplərinin mövcud DB strukturu ilə uyğun olmasını istəyirəm ki, köhnə postlar sınmasın.

#### Acceptance Criteria

1. THE DB SHALL hər Rich_Post üçün `type`, `caption`, `metadata` sahələrini saxlasın; burada `metadata` tip-spesifik əlavə məlumatları ehtiva edir
2. WHEN köhnə post (metadata sahəsi olmayan) feed-də göstərildikdə, THE Post_Card SHALL onu `other` tipi kimi render etsin
3. THE Post_Creator SHALL yeni post yaradarkən `metadata` obyektini tip-spesifik sahələrlə dolduraraq DB-yə saxlasın
4. IF `metadata` sahəsi mövcud deyilsə, THEN THE Post_Card SHALL default görünüşü tətbiq etsin və xəta verməsin
5. THE DB SHALL mövcud `likes`, `comments`, `createdAt`, `authorId` sahələrini dəyişdirməsin

---

### Requirement 8: Çoxdilli Dəstək

**User Story:** Azərbaycan, Rus və İngilis dillərindən istifadə edən istifadəçilər olaraq, yeni post tipi interfeyslərini öz dillərimizdə görmək istəyirik.

#### Acceptance Criteria

1. THE Post_Creator SHALL bütün yeni UI mətnlərini (`i18n`) açarları vasitəsilə göstərsin
2. THE Post_Card SHALL tip etiketlərini, düymə mətnlərini və badge-ləri aktiv dildə göstərsin
3. THE Post_Creator SHALL `az`, `en`, `ru`, `tr` dillərinin hər biri üçün tərcümə açarları təmin etsin
4. WHEN dil dəyişdirildikdə, THE Post_Creator SHALL bütün sahə etiketlərini yeni dildə göstərsin
