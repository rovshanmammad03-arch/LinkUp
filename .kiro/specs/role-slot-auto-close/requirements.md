# Tələblər Sənədi

## Giriş

Bu xüsusiyyət layihə paylaşımı zamanı müəyyən edilmiş rol yuvalarının (role slots) avtomatik bağlanmasını təmin edir. Layihə sahibi layihəyə neçə nəfər və hansı peşə sahəsindən iştirakçı lazım olduğunu qeyd edir. Hər hansı bir kateqoriya üzrə iştirakçı qəbul edildikdə, həmin kateqoriya avtomatik olaraq bağlanır — yəni o kateqoriya üçün artıq yeni müraciətlər qəbul edilmir. Bu vəziyyət bütün istifadəçilərə görünür ki, artıq dolu olan yerə müraciət etməsinlər.

## Lüğət

- **Layihə (Project)**: İstifadəçilərin yaratdığı, iştirakçı axtarılan əməkdaşlıq teklifi. `projects` kolleksiyasında saxlanılır.
- **Rol Yuvası (Role Slot)**: Layihədə tələb olunan müəyyən bir peşə kateqoriyası üzrə bir yer (məs. "Qrafik Dizayner", "Frontend Developer"). Hər yuva bir kateqoriya adı və tələb olunan say saxlayır.
- **Müraciət (Applicant)**: Layihəyə qoşulmaq istəyən istifadəçi. `applicants` massivindəki `{id, status, roleSlot}` obyekti ilə təmsil olunur.
- **Yuva Statusu (Slot Status)**: Rol yuvasının cari vəziyyəti — `open` (açıq) və ya `closed` (bağlı).
- **Layihə Sahibi (Project Owner)**: Layihəni yaradan istifadəçi (`authorId`).
- **Kəşf Səhifəsi (Discover Page)**: İstifadəçilərin layihələri gördüyü `Discover.jsx` səhifəsi.
- **Müraciətçilər Modalı (Applicants Modal)**: Layihə sahibinin müraciətləri idarə etdiyi `ProjectApplicantsModal.jsx` komponenti.
- **DB**: `localStorage`-əsaslı məlumat saxlama xidməti (`services/db.js`).

---

## Tələblər

### Tələb 1: Layihəyə Rol Yuvalarının Əlavə Edilməsi

**İstifadəçi Hekayəsi:** Layihə sahibi kimi, layihə yaradarkən hansı peşə kateqoriyasından neçə nəfər lazım olduğunu qeyd etmək istəyirəm ki, müraciətçilər hansı yerlərin açıq olduğunu bilsinlər.

#### Qəbul Meyarları

1. THE `NewProject` SHALL layihə yaradılması formasının 2-ci addımında rol yuvası əlavə etmək üçün interfeys təqdim etsin.
2. WHEN layihə sahibi rol yuvası əlavə edərkən, THE `NewProject` SHALL kateqoriya adı (mətn sahəsi) və say (1–10 arası tam ədəd) daxil etməyə imkan versin.
3. THE `NewProject` SHALL eyni layihəyə maksimum 10 rol yuvası əlavə etməyə imkan versin.
4. WHEN layihə sahibi mövcud rol yuvasını silmək istədikdə, THE `NewProject` SHALL həmin yuvası siyahıdan çıxarsın.
5. THE `NewProject` SHALL hər rol yuvasını `{id, category, count, filledCount: 0, status: 'open'}` formatında `roleSlots` massivində saxlasın.
6. IF layihə sahibi kateqoriya adını boş saxlayaraq yuva əlavə etməyə çalışarsa, THEN THE `NewProject` SHALL həmin yuvası saxlamadan xəta mesajı göstərsin.

---

### Tələb 2: Müraciət Zamanı Rol Yuvası Seçimi

**İstifadəçi Hekayəsi:** Müraciətçi kimi, layihəyə müraciət edərkən hansı rol üçün müraciət etdiyimi seçmək istəyirəm ki, layihə sahibi müraciətimi düzgün qiymətləndirsin.

#### Qəbul Meyarları

1. WHEN istifadəçi layihəyə müraciət etmək istədikdə, THE `Discover` SHALL yalnız `status: 'open'` olan rol yuvalarını seçim siyahısında göstərsin.
2. WHEN istifadəçi müraciət etdikdə, THE `Discover` SHALL seçilmiş rol yuvasının `id`-sini müraciətin `roleSlot` sahəsinə yazıb `applicants` massivinə əlavə etsin.
3. IF layihənin bütün rol yuvaları `status: 'closed'` vəziyyətindədirsə, THEN THE `Discover` SHALL müraciət düyməsini deaktiv edib "Bütün yerlər doludur" mesajı göstərsin.
4. IF istifadəçi artıq həmin layihəyə müraciət etmişsə, THEN THE `Discover` SHALL ikinci müraciəti qəbul etməsin və "Artıq müraciət etmisiniz" mesajı göstərsin.
5. WHERE layihənin `roleSlots` massivi boşdursa, THE `Discover` SHALL köhnə davranışı qoruyaraq rol seçimi olmadan müraciəti qəbul etsin.

---

### Tələb 3: Müraciətin Qəbulu Zamanı Rol Yuvasının Avtomatik Bağlanması

**İstifadəçi Hekayəsi:** Layihə sahibi kimi, bir kateqoriya üzrə lazımi sayda iştirakçı qəbul etdikdə həmin kateqoriyanın avtomatik bağlanmasını istəyirəm ki, artıq dolu olan yerə yeni müraciətlər gəlməsin.

#### Qəbul Meyarları

1. WHEN layihə sahibi müraciəti qəbul etdikdə, THE `ProjectApplicantsModal` SHALL həmin müraciətin `roleSlot` sahəsinə uyğun rol yuvasının `filledCount` dəyərini 1 artırsın.
2. WHEN `filledCount` dəyəri `count` dəyərinə bərabər olduqda, THE `ProjectApplicantsModal` SHALL həmin rol yuvasının `status`-unu `'open'`-dən `'closed'`-a dəyişsin.
3. THE `ProjectApplicantsModal` SHALL yenilənmiş layihəni DB-yə yazıb `onProjectUpdated` callback-ini çağırsın.
4. WHEN rol yuvası `'closed'` vəziyyətinə keçdikdə, THE `ProjectApplicantsModal` SHALL layihə sahibinə "Qrafik Dizayner yuvası dolduruldu" formatında bildiriş göstərsin.
5. IF müraciətin `roleSlot` sahəsi boşdursa (köhnə format), THEN THE `ProjectApplicantsModal` SHALL yuva sayacını dəyişmədən yalnız müraciətin statusunu `'accepted'`-ə çevirsin.

---

### Tələb 4: Rol Yuvası Statusunun Kəşf Səhifəsində Görünməsi

**İstifadəçi Hekayəsi:** Müraciətçi kimi, layihə kartında hansı rol yuvalarının açıq, hansılarının bağlı olduğunu görmək istəyirəm ki, artıq dolu olan yerə vaxt itirmədən müraciət etməyim.

#### Qəbul Meyarları

1. THE `Discover` SHALL layihə kartında hər rol yuvasını kateqoriya adı, dolu/ümumi say (`filledCount/count`) və status badge-i ilə göstərsin.
2. WHILE rol yuvasının statusu `'open'`-dirsə, THE `Discover` SHALL həmin yuvası yaşıl rəngli "Açıq" badge-i ilə göstərsin.
3. WHILE rol yuvasının statusu `'closed'`-dirsə, THE `Discover` SHALL həmin yuvası qırmızı rəngli "Dolu" badge-i ilə göstərsin və həmin yuva üçün müraciəti mümkünsüz etsin.
4. WHERE layihənin `roleSlots` massivi boşdursa, THE `Discover` SHALL rol yuvası bölməsini göstərməsin.
5. THE `Discover` SHALL `status: 'closed'` olan rol yuvalarını müraciət seçim siyahısından çıxarsın.

---

### Tələb 5: Rol Yuvası Statusunun Müraciətçilər Modalında Görünməsi

**İstifadəçi Hekayəsi:** Layihə sahibi kimi, müraciətçilər modalında hər müraciətin hansı rol üçün olduğunu görmək istəyirəm ki, qərarlarımı daha asan verə bilim.

#### Qəbul Meyarları

1. THE `ProjectApplicantsModal` SHALL hər müraciətin yanında müraciətin aid olduğu rol kateqoriyasının adını göstərsin.
2. THE `ProjectApplicantsModal` SHALL modalın yuxarı hissəsində hər rol yuvasının cari doluluq vəziyyətini (`filledCount/count`) xülasə şəklində göstərsin.
3. WHILE rol yuvası `'closed'` vəziyyətindədirsə, THE `ProjectApplicantsModal` SHALL həmin yuvaya aid gözləyən müraciətlər üçün "Qəbul et" düyməsini deaktiv etsin.
4. IF müraciətin `roleSlot` sahəsi boşdursa, THE `ProjectApplicantsModal` SHALL həmin müraciətin yanında "Ümumi müraciət" etiketini göstərsin.

---

### Tələb 6: Məlumat Uyğunluğu (Geriyə Dönük)

**İstifadəçi Hekayəsi:** Sistem administratoru kimi, mövcud layihə məlumatlarının yeni `roleSlots` strukturu ilə uyğun işləməsini istəyirəm ki, köhnə layihələr pozulmasın.

#### Qəbul Meyarları

1. WHEN `roleSlots` sahəsi olmayan köhnə layihə yüklənərkən, THE `Discover` SHALL `roleSlots`-u boş massiv kimi qəbul edib xəta vermədən işləsin.
2. WHEN `roleSlot` sahəsi olmayan köhnə müraciət emal edilərkən, THE `ProjectApplicantsModal` SHALL həmin müraciəti `roleSlot: null` kimi qəbul edib mövcud qəbul/rədd məntiqi ilə işləsin.
3. THE `DB` SHALL `roleSlots` massivini `projects` kolleksiyasının bir hissəsi kimi `localStorage`-da saxlasın.
