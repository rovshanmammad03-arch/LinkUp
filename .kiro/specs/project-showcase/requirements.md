# Tələblər Sənədi

## Giriş

Bu sənəd **Project Showcase** xüsusiyyətinin tələblərini müəyyən edir. Platforma üzərindəki tamamlanmış layihələrin iştirakçıları öz profillərinə həmin layihəyə aid nümunə materiallar (showcase) əlavə edə bilməlidir — canlı linklər, skrinşotlar, portfolio materialları kimi. Məqsəd istifadəçilərə Behance, Dribbble, LinkedIn kimi platformalarda olduğu kimi "biz bunu bacardıq" deyə bilmək imkanı vermək və tamamladıqları layihələri öz profillərinə əlavə etməkdir.

---

## Lüğət

- **Sistem**: Project Showcase xüsusiyyətini ehtiva edən platforma
- **İstifadəçi**: Platformada qeydiyyatdan keçmiş şəxs
- **Layihə**: Platformada yaradılmış, üzvlər toplayan və tamamlana bilən iş birliyi vahidi (`projects` localStorage açarında saxlanılır)
- **Tamamlanmış Layihə**: `status` sahəsi `'completed'` olan layihə
- **İştirakçı**: Layihənin `applicants` massivindəki qəbul edilmiş üzv (`status: 'accepted'`) və ya layihənin müəllifi (`authorId`)
- **Showcase Elementi**: İştirakçının tamamlanmış layihəyə əlavə etdiyi portfolio materialı — canlı link, şəkil/skrinşot və ya qısa açıqlama
- **Showcase_Sistemi**: Showcase elementlərinin yaradılması, saxlanması və göstərilməsindən məsul olan sistem komponenti
- **Profil_Səhifəsi**: İstifadəçinin öz məlumatlarını, postlarını və layihələrini göstərdiyi səhifə (`Profile.jsx`)
- **Layihə_Kartı**: Profil səhifəsindəki "Layihələr" tabında hər layihəni təmsil edən UI komponenti

---

## Tələblər

### Tələb 1: Showcase Elementi Əlavə Etmək

**İstifadəçi Hekayəsi:** Bir iştirakçı kimi mən tamamlanmış layihəyə showcase elementi əlavə etmək istəyirəm ki, öz profilimə həmin layihədəki işimi nümayiş etdirə bilim.

#### Qəbul Meyarları

1. WHEN istifadəçi öz profilindəki tamamlanmış bir layihənin kartına baxarkən "Showcase Əlavə Et" düyməsinə basanda, THE Showcase_Sistemi SHALL showcase elementi yaratmaq üçün modal/forma açsın.
2. THE Showcase_Sistemi SHALL showcase formasında aşağıdakı sahələri təqdim etsin: canlı link (URL, könüllü), şəkil/skrinşot yükləmə (könüllü, maksimum 2MB), qısa açıqlama (könüllü, maksimum 300 simvol).
3. WHEN istifadəçi showcase formasını ən azı bir sahəni doldurub təqdim edəndə, THE Showcase_Sistemi SHALL elementi `showcases` localStorage açarında saxlasın.
4. IF istifadəçi showcase formasını heç bir sahəni doldurmadan təqdim etməyə çalışarsa, THEN THE Showcase_Sistemi SHALL formanı saxlamadan xəta mesajı göstərsin.
5. IF daxil edilmiş URL etibarsız formatdadırsa (http/https ilə başlamırsa), THEN THE Showcase_Sistemi SHALL istifadəçini etibarlı URL formatı barədə xəbərdar etsin.
6. IF yüklənən şəkil 2MB-dan böyükdürsə, THEN THE Showcase_Sistemi SHALL faylı rədd edib istifadəçiyə ölçü limitini bildirsin.

---

### Tələb 2: Showcase Əlavə Etmə Hüququ

**İstifadəçi Hekayəsi:** Bir platforma istifadəçisi kimi mən yalnız iştirak etdiyim tamamlanmış layihələrə showcase əlavə edə bilmək istəyirəm ki, sistem bütövlüyü qorunsun.

#### Qəbul Meyarları

1. WHILE layihənin statusu `'active'`-dirsə, THE Showcase_Sistemi SHALL həmin layihə üçün showcase əlavə etmə seçimini gizlətsin.
2. WHEN istifadəçi tamamlanmış bir layihəyə baxanda, THE Showcase_Sistemi SHALL yalnız həmin layihənin iştirakçısı (müəllif və ya qəbul edilmiş üzv) olan istifadəçilərə "Showcase Əlavə Et" düyməsini göstərsin.
3. IF istifadəçi tamamlanmış layihənin iştirakçısı deyilsə, THEN THE Showcase_Sistemi SHALL həmin layihə üçün showcase əlavə etmə imkanını təqdim etməsin.
4. THE Showcase_Sistemi SHALL hər iştirakçının eyni layihəyə birdən çox showcase elementi əlavə etməsinə icazə versin.

---

### Tələb 3: Showcase Elementlərinin Profildə Göstərilməsi

**İstifadəçi Hekayəsi:** Bir profil ziyarətçisi kimi mən istifadəçinin tamamladığı layihələrə aid showcase materiallarını görmək istəyirəm ki, onun işini qiymətləndirə bilim.

#### Qəbul Meyarları

1. WHEN istifadəçi profil səhifəsindəki "Layihələr" tabına keçəndə, THE Profil_Səhifəsi SHALL tamamlanmış layihə kartlarında mövcud showcase elementlərini göstərsin.
2. THE Profil_Səhifəsi SHALL hər showcase elementini aşağıdakı məlumatlarla göstərsin: şəkil (varsa), canlı link (varsa), qısa açıqlama (varsa) və əlavə edilmə tarixi.
3. WHEN showcase elementinin canlı linkinə basılanda, THE Profil_Səhifəsi SHALL linki yeni brauzer tabında açsın.
4. WHILE layihənin heç bir showcase elementi yoxdursa, THE Profil_Səhifəsi SHALL tamamlanmış layihə kartında "Hələ showcase yoxdur" mesajını göstərsin (yalnız layihənin öz sahibinə).
5. THE Profil_Səhifəsi SHALL showcase elementlərini əlavə edilmə tarixinə görə azalan sırada göstərsin (ən yeni birinci).

---

### Tələb 4: Showcase Elementini Silmək

**İstifadəçi Hekayəsi:** Bir iştirakçı kimi mən öz əlavə etdiyim showcase elementini silmək istəyirəm ki, köhnəlmiş və ya yanlış materialları profilimden çıxara bilim.

#### Qəbul Meyarları

1. WHEN istifadəçi öz profilindəki showcase elementinə baxanda, THE Showcase_Sistemi SHALL yalnız həmin elementi əlavə edən istifadəçiyə silmə seçimini göstərsin.
2. WHEN istifadəçi showcase elementini silmək istəyəndə, THE Showcase_Sistemi SHALL silmə əməliyyatından əvvəl təsdiq modalı göstərsin.
3. WHEN istifadəçi silməni təsdiq edəndə, THE Showcase_Sistemi SHALL elementi `showcases` localStorage açarından silsin və profil görünüşünü dərhal yeniləsin.
4. IF istifadəçi silmə əməliyyatını ləğv edərsə, THEN THE Showcase_Sistemi SHALL heç bir dəyişiklik etmədən modalı bağlasın.

---

### Tələb 5: Showcase Məlumatlarının Saxlanması

**İstifadəçi Hekayəsi:** Bir sistem kimi mən showcase məlumatlarını etibarlı şəkildə saxlamaq istəyirəm ki, istifadəçilər öz materiallarına həmişə müraciət edə bilsin.

#### Qəbul Meyarları

1. THE Showcase_Sistemi SHALL hər showcase elementini aşağıdakı sahələrlə saxlasın: `id` (unikal identifikator), `projectId` (layihə identifikatoru), `userId` (əlavə edən istifadəçi identifikatoru), `liveUrl` (könüllü), `image` (base64, könüllü), `description` (könüllü), `createdAt` (Unix timestamp).
2. THE Showcase_Sistemi SHALL bütün showcase elementlərini `showcases` adlı localStorage açarında massiv kimi saxlasın.
3. WHEN yeni showcase elementi saxlanılanda, THE Showcase_Sistemi SHALL `uid()` funksiyasından istifadə edərək unikal `id` generasiya etsin.
4. THE Showcase_Sistemi SHALL mövcud `DB.get()` və `DB.set()` funksiyalarından istifadə edərək localStorage əməliyyatlarını həyata keçirsin.

---

### Tələb 6: Başqasının Profilindəki Showcase-lərin Görüntülənməsi

**İstifadəçi Hekayəsi:** Bir platforma istifadəçisi kimi mən başqa bir istifadəçinin profilini ziyarət edərkən onun tamamladığı layihələrə aid showcase materiallarını görmək istəyirəm ki, onun bacarıqlarını qiymətləndirə bilim.

#### Qəbul Meyarları

1. WHEN istifadəçi başqa bir istifadəçinin profil səhifəsini ziyarət edəndə, THE Profil_Səhifəsi SHALL həmin istifadəçinin tamamlanmış layihə kartlarında showcase elementlərini göstərsin.
2. WHILE istifadəçi başqasının profilini ziyarət edirsə, THE Profil_Səhifəsi SHALL showcase elementlərini yalnız oxuma rejimində göstərsin (əlavə etmə və silmə düymələri olmadan).
3. THE Profil_Səhifəsi SHALL showcase elementlərini olan tamamlanmış layihə kartlarını showcase elementlərini olmayan kartlardan vizual olaraq fərqləndirsin.
