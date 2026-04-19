# Implementation Plan: Participant Project Visibility

## Overview

`Profile.jsx`-dəki layihə filtrini genişləndirmək — həm `authorId === targetUser.id` olanları, həm də `applicants` içində `{ id: targetUser.id, status: 'accepted' }` olanları göstərmək. Layihə kartında rol fərqləndirməsi: sahibi redaktə/silmə düymələrini görür, iştirakçı isə "İştirakçı" badge-i görür.

## Tasks

- [x] 1. `getParticipantProjects` köməkçi funksiyasını yazmaq
  - `src/pages/Profile.jsx`-in yuxarısında (component-dən kənarda) `getParticipantProjects(userId, allProjects)` funksiyasını əlavə et
  - `authorId === userId` olan layihələri seç
  - `applicants` massivindəki `{ id: userId, status: 'accepted' }` girişlərini tap (köhnə string formatını `pending` kimi qəbul et)
  - Dublikatları aradan qaldır (`Set` və ya `id` yoxlaması ilə)
  - Nəticəni `createdAt` üzrə azalan sırada qaytarır
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2_

  - [x]* 1.1 Property test: Ownership Inclusion (Property 1)
    - **Property 1: Ownership Inclusion** — `authorId === userId` olan hər layihə nəticədə olmalıdır
    - **Validates: Requirements 1.1, 4.1, 6.1**

  - [x]* 1.2 Property test: Accepted Applicant Inclusion (Property 2)
    - **Property 2: Accepted Applicant Inclusion** — `applicants` içində `{ id: userId, status: 'accepted' }` olan hər layihə nəticədə olmalıdır
    - **Validates: Requirements 1.2, 4.2, 6.2**

  - [x]* 1.3 Property test: Non-Accepted Statuses Are Excluded (Property 3)
    - **Property 3: Non-Accepted Statuses Are Excluded** — `pending`, `rejected`, `left` statuslu applicant-lar nəticəyə daxil edilməməlidir
    - **Validates: Requirements 1.3, 1.4, 1.5**

  - [x]* 1.4 Property test: No Duplicate Projects (Property 4)
    - **Property 4: No Duplicate Projects** — istifadəçi həm sahibi, həm də accepted applicant olsa belə layihə bir dəfə görünməlidir
    - **Validates: Requirements 3.1, 4.5**

  - [x]* 1.5 Property test: Sort Order Invariant (Property 5)
    - **Property 5: Sort Order Invariant** — nəticə `createdAt` üzrə azalan sırada olmalıdır
    - **Validates: Requirements 1.6, 4.6**

  - [x]* 1.6 Property test: Legacy Format Exclusion (Property 6)
    - **Property 6: Legacy Format Exclusion** — yalnız string olan applicant girişləri `accepted` sayılmamalıdır
    - **Validates: Requirements 5.1, 5.2, 4.4**

- [x] 2. `Profile.jsx`-dəki `useEffect`-i yeni funksiya ilə yeniləmək
  - `useEffect` içindəki `allProjects.filter(p => p.authorId === targetUser.id)` sətirini `getParticipantProjects(targetUser.id, allProjects)` ilə əvəz et
  - `confirmDeleteProject` funksiyasındakı filter-i da yenilə — silinmiş layihədən sonra `getParticipantProjects` istifadə et
  - _Requirements: 1.1, 1.2, 1.6, 6.1, 6.2, 7.1_

- [x] 3. Layihə kartında `isOwner` / `isParticipant` məntiqi əlavə etmək
  - `tab === 'projects'` render blokunun içərisində hər `p` üçün `isOwner` və `isParticipant` dəyişənlərini hesabla:
    - `isOwner`: `p.authorId === currentUser?.id`
    - `isParticipant`: `p.authorId !== currentUser?.id` VƏ `applicants` içində `{ id: currentUser.id, status: 'accepted' }` var
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Layihə kartında "İştirakçı" badge-ini əlavə etmək
  - `isParticipant === true` olduqda layihə kartının başlıq bölməsindəki status badge-inin yanında "İştirakçı" badge-i göstər
  - Badge stili: `text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20` (mövcud status badge-i ilə uyğun)
  - `isOwner === false` olduqda options menyu (üç nöqtə düyməsi) gizlənməlidir — mövcud `isOwnProfile` yoxlamasını `isOwner` ilə əvəz et
  - _Requirements: 2.2, 2.3, 6.3_

  - [ ]* 4.1 Property test: Participant Controls Are Hidden (Property 7)
    - **Property 7: Participant Controls Are Hidden** — `isParticipant === true` olduqda redaktə/silmə/status düymələri render edilməməlidir
    - **Validates: Requirements 2.3**

  - [ ]* 4.2 Property test: Project Card Contains Required Fields (Property 8)
    - **Property 8: Project Card Contains Required Fields** — hər layihə kartında başlıq, təsvir, bacarıqlar və status olmalıdır
    - **Validates: Requirements 2.4**

- [x] 5. Checkpoint — Bütün testlər keçməlidir
  - Bütün testlər keçməlidir, suallar yaranarsa istifadəçiyə müraciət et.

## Notes

- `*` ilə işarələnmiş tapşırıqlar isteğe bağlıdır və sürətli MVP üçün keçilə bilər
- Hər tapşırıq izlənə bilmək üçün xüsusi tələblərə istinad edir
- Checkpointlər artımlı doğrulamanı təmin edir
- Property testlər universal düzgünlük xüsusiyyətlərini yoxlayır
- Unit testlər xüsusi nümunələri və kənar halları yoxlayır
