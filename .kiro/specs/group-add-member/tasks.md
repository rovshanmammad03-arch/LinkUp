# Tasks

## Task List

- [x] 1. `AddMemberModal` komponentini yarat
  - [x] 1.1 `src/components/messages/AddMemberModal.jsx` faylını yarat
  - [x] 1.2 Props: `projectId`, `currentMembers`, `adminId`, `onAdd`, `onClose`
  - [x] 1.3 Daxili `search` state-i əlavə et
  - [x] 1.4 `DB.get('users')` ilə namizəd filtrasiya məntiqini yaz (admin və aktiv üzvləri çıxar, ada görə filtrə)
  - [x] 1.5 Axtarış sahəsi, namizəd siyahısı və "İstifadəçi tapılmadı" mesajını render et
  - [x] 1.6 "Ləğv et" düyməsi və modal xarici klik ilə `onClose` çağır

- [x] 2. `Messages.jsx`-ə `handleAddMember` funksiyasını əlavə et
  - [x] 2.1 `showAddMember` state-ini əlavə et (`useState(false)`)
  - [x] 2.2 `handleAddMember(userId)` funksiyasını yaz: layihəni tap, artıq üzv olub-olmadığını yoxla, `applicants`-a `{ id, status: 'accepted' }` əlavə et
  - [x] 2.3 Sistem mesajı yaz: `"{İstifadəçi adı} qrupa əlavə edildi."`
  - [x] 2.4 `addNotification` ilə əlavə edilən istifadəçiyə bildiriş göndər
  - [x] 2.5 `setShowAddMember(false)` və `refreshConvos()` çağır

- [x] 3. `ManageTeam` panelinə "Üzv Əlavə Et" düyməsini əlavə et
  - [x] 3.1 `Messages.jsx`-dəki `ManageTeam` panelini tap
  - [x] 3.2 `selectedProjectConvo.project.authorId === currentUser?.id` şərti ilə düyməni göstər
  - [x] 3.3 Düymə `onClick`-ında `setShowAddMember(true)` çağır

- [x] 4. `AddMemberModal`-ı `Messages.jsx`-ə inteqrasiya et
  - [x] 4.1 `AddMemberModal` komponentini import et
  - [x] 4.2 `showAddMember` true olduqda `AddMemberModal`-ı render et, lazımi props-ları ötür
  - [x] 4.3 `onAdd={handleAddMember}` və `onClose={() => setShowAddMember(false)}` props-larını ötür

- [x] 5. Artıq üzv xəta halını idarə et
  - [x] 5.1 `handleAddMember`-da artıq üzv yoxlamasını əlavə et
  - [x] 5.2 Artıq üzv olduqda UI-da xəbərdarlıq mesajı göstər (toast və ya modal daxilindəki mesaj)

- [ ] 6. Testlər yaz
  - [ ] 6.1 `AddMemberModal` üçün unit testlər yaz (axtarış sahəsi, boş nəticə mesajı, ləğv etmə)
  - [ ] 6.2 `handleAddMember` üçün property-based testlər yaz (fast-check ilə, P4, P5, P6, P7)
  - [ ] 6.3 Admin görünürlük property testi yaz (P1)
  - [ ] 6.4 Namizəd filtrasiyası property testi yaz (P2, P3)
