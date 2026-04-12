# Tələblər Sənədi

## Giriş

Bu xüsusiyyət, layihə qruplarının adminlərinə (layihənin `authorId`-si olan istifadəçilərə) mövcud platformu istifadəçilərini birbaşa qrup söhbətinə əlavə etmə imkanı verir. Hal-hazırda admin yalnız üzvləri qrupdan çıxara bilir; bu funksiya isə əks istiqamətdə — əlavə etmə — imkanını təmin edir. İstifadəçi axtarışı, seçimi və əlavə edilməsi prosesi Messages.jsx səhifəsindəki "İştirakçılar" paneli üzərindən həyata keçirilir.

## Lüğət

- **Admin**: Layihənin sahibi — `project.authorId` ilə cari istifadəçi `id`-si eyni olan şəxs.
- **Member**: `project.applicants` massivindəki `{ id, status: 'accepted' }` formatında qeyd edilmiş istifadəçi.
- **Candidate**: Platformda qeydiyyatdan keçmiş, lakin hələ həmin layihənin üzvü olmayan istifadəçi.
- **AddMemberModal**: Admin tərəfindən açılan, istifadəçi axtarışı və seçimini təmin edən modal komponent.
- **ManageTeam Panel**: Messages.jsx-də "İştirakçılar" düyməsinə basıldıqda açılan yan panel.
- **System**: Mesajlaşma və layihə məlumatlarını idarə edən tətbiq məntiqi.
- **DB**: `localStorage`-a əsaslanan məlumat saxlama xidməti (`src/services/db.js`).

---

## Tələblər

### Tələb 1: Admin üçün "Üzv Əlavə Et" düyməsi

**İstifadəçi hekayəsi:** Admin olaraq, qrup idarəetmə panelindən birbaşa yeni üzv əlavə edə bilmək istəyirəm ki, komandamı genişləndirə bilim.

#### Qəbul Meyarları

1. WHILE cari istifadəçi seçilmiş layihənin admini olduqda, THE ManageTeam Panel SHALL "Üzv Əlavə Et" düyməsini göstərsin.
2. WHEN admin "Üzv Əlavə Et" düyməsinə kliklədiyi zaman, THE System SHALL AddMemberModal-ı açsın.
3. WHILE cari istifadəçi seçilmiş layihənin admini olmadıqda, THE ManageTeam Panel SHALL "Üzv Əlavə Et" düyməsini gizlətsin.

---

### Tələb 2: İstifadəçi axtarışı

**İstifadəçi hekayəsi:** Admin olaraq, əlavə etmək istədiyim istifadəçini ada görə axtara bilmək istəyirəm ki, düzgün şəxsi tez tapım.

#### Qəbul Meyarları

1. THE AddMemberModal SHALL bir mətn axtarış sahəsi göstərsin.
2. WHEN admin axtarış sahəsinə mətn daxil etdiyi zaman, THE AddMemberModal SHALL `DB.get('users')` siyahısını istifadəçi adına görə filtrləsin.
3. THE AddMemberModal SHALL yalnız hazırda həmin layihənin aktiv üzvü (`status: 'accepted'`) olmayan istifadəçiləri nəticə siyahısında göstərsin.
4. THE AddMemberModal SHALL layihənin özünün adminini nəticə siyahısından çıxarsın.
5. IF axtarış nəticəsi boş olduqda, THEN THE AddMemberModal SHALL "İstifadəçi tapılmadı" mesajını göstərsin.

---

### Tələb 3: İstifadəçi seçimi və əlavə edilməsi

**İstifadəçi hekayəsi:** Admin olaraq, axtarış nəticəsindən istifadəçini seçib qrupa əlavə edə bilmək istəyirəm ki, komanda üzvlüyünü tez idarə edim.

#### Qəbul Meyarları

1. WHEN admin nəticə siyahısından bir istifadəçini seçdiyi zaman, THE System SHALL həmin istifadəçini `{ id, status: 'accepted' }` formatında `project.applicants` massivinə əlavə etsin.
2. WHEN istifadəçi uğurla əlavə edildikdə, THE System SHALL qrup söhbətinə `"{İstifadəçi adı} qrupa əlavə edildi."` məzmunlu sistem mesajı əlavə etsin.
3. WHEN istifadəçi uğurla əlavə edildikdə, THE AddMemberModal SHALL avtomatik olaraq bağlansın.
4. WHEN istifadəçi uğurla əlavə edildikdə, THE ManageTeam Panel SHALL üzv siyahısını dərhal yeniləsin.
5. WHEN istifadəçi uğurla əlavə edildikdə, THE System SHALL əlavə edilən istifadəçiyə bildiriş göndərsin.

---

### Tələb 4: Xəta hallarının idarə edilməsi

**İstifadəçi hekayəsi:** Admin olaraq, əlavə etmə prosesindəki xətalar haqqında məlumatlandırılmaq istəyirəm ki, nə baş verdiyini anlayım.

#### Qəbul Meyarları

1. IF seçilmiş istifadəçi artıq layihənin aktiv üzvüdürsə, THEN THE System SHALL həmin istifadəçini yenidən əlavə etməsin və "Bu istifadəçi artıq qrupun üzvüdür." mesajını göstərsin.
2. IF seçilmiş layihə DB-də tapılmırsa, THEN THE System SHALL əlavə etmə əməliyyatını dayandırsın.
3. WHEN AddMemberModal açıq olduqda admin "Ləğv et" düyməsinə və ya modal xaricinə kliklədiyi zaman, THE AddMemberModal SHALL heç bir dəyişiklik etmədən bağlansın.
