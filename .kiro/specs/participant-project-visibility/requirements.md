# Requirements Document

## Introduction

Bu sənəd `participant-project-visibility` xüsusiyyəti üçün tələbləri müəyyən edir. Hazırda istifadəçinin profil səhifəsindəki "Layihələr" tabı yalnız həmin istifadəçinin yaratdığı layihələri göstərir. Bu xüsusiyyət, qəbul edilmiş müraciətçilərin (`accepted` statuslu applicant-ların) və birbaşa əlavə edilmiş üzvlərin profilindəki "Layihələr" tabında iştirak etdikləri layihələri də göstərəcək. Beləliklə, bir istifadəçinin profili onun həm yaratdığı, həm də iştirak etdiyi bütün layihələri əks etdirəcək.

---

## Glossary

- **Profile**: İstifadəçinin şəxsi profil səhifəsi (`Profile.jsx`). Postlar, layihələr və bəyənilmiş məzmun tablarını ehtiva edir.
- **Projects_Tab**: Profil səhifəsindəki "Layihələr" tabı — istifadəçinin layihələrini göstərən bölmə.
- **Project**: Bir istifadəçi tərəfindən yaradılmış, `id`, `title`, `authorId`, `applicants`, `status` sahələrini ehtiva edən layihə obyekti.
- **Applicant**: Bir layihəyə müraciət etmiş istifadəçi. `{ id: string, status: 'pending' | 'accepted' | 'rejected' | 'left' }` formatında saxlanılır.
- **Accepted_Applicant**: `status === 'accepted'` olan müraciətçi — layihəyə qəbul edilmiş iştirakçı.
- **Project_Owner**: `project.authorId === userId` olan istifadəçi — layihəni yaradan şəxs.
- **Participant**: Layihəyə qəbul edilmiş, lakin layihənin sahibi olmayan istifadəçi (`Accepted_Applicant` və `authorId !== userId`).
- **Participant_Badge**: İştirakçı layihə kartında göstərilən vizual etiket — istifadəçinin həmin layihədə sahibi deyil, iştirakçı olduğunu bildirir.
- **getParticipantProjects**: Bir istifadəçinin həm yaratdığı, həm də iştirak etdiyi layihələri qaytaran funksiya.
- **DB**: `localStorage`-a əsaslanan məlumat saxlama servisi (`src/services/db.js`).
- **Legacy_Format**: `applicants` massivindəki sadə string ID-ləri (köhnə format — status sahəsi yoxdur).

---

## Requirements

### Requirement 1: İştirak Edilən Layihələrin Profildə Göstərilməsi

**User Story:** Bir layihəyə qəbul edilmiş istifadəçi kimi, profilimin "Layihələr" tabında iştirak etdiyim layihəni görmək istəyirəm ki, fəaliyyətim tam əks olunsun.

#### Acceptance Criteria

1. WHEN a user's profile is loaded, THE Projects_Tab SHALL display all projects where the user is the Project_Owner.
2. WHEN a user's profile is loaded, THE Projects_Tab SHALL display all projects where the user is an Accepted_Applicant.
3. WHEN a user's profile is loaded, THE Projects_Tab SHALL NOT display projects where the user has `pending` applicant status.
4. WHEN a user's profile is loaded, THE Projects_Tab SHALL NOT display projects where the user has `rejected` applicant status.
5. WHEN a user's profile is loaded, THE Projects_Tab SHALL NOT display projects where the user has `left` applicant status.
6. THE Projects_Tab SHALL display projects sorted by `createdAt` in descending order (newest first).

---

### Requirement 2: Layihə Kartında Rol Fərqləndirməsi

**User Story:** Bir istifadəçi kimi, profilimin "Layihələr" tabında hansı layihəni yaratdığımı, hansında iştirakçı olduğumu vizual olaraq fərqləndirmək istəyirəm ki, rolumu aydın görüm.

#### Acceptance Criteria

1. WHEN a project card is displayed for a Project_Owner, THE Projects_Tab SHALL show edit, delete, and status-toggle controls for that project.
2. WHEN a project card is displayed for a Participant, THE Projects_Tab SHALL show a Participant_Badge on that project card.
3. WHEN a project card is displayed for a Participant, THE Projects_Tab SHALL NOT show edit, delete, or status-toggle controls for that project.
4. THE Projects_Tab SHALL display project title, description, skills, and status for both Project_Owner and Participant project cards.

---

### Requirement 3: Dublikat Olmama Qarantiyası

**User Story:** Bir istifadəçi kimi, profilimin "Layihələr" tabında eyni layihənin bir dəfədən çox görünməməsini istəyirəm ki, interfeys qarışıq görünməsin.

#### Acceptance Criteria

1. THE Projects_Tab SHALL display each project at most once, even if the user is both the Project_Owner and an Accepted_Applicant of the same project.

---

### Requirement 4: `getParticipantProjects` Funksiyasının Davranışı

**User Story:** Bir developer kimi, profil layihə siyahısını hesablayan funksiyasının düzgün işlədiyini bilmək istəyirəm ki, UI-ın doğru data göstərdiyinə əmin olum.

#### Acceptance Criteria

1. WHEN `getParticipantProjects` is called with a valid `userId` and a list of projects, THE getParticipantProjects SHALL return all projects where `project.authorId === userId`.
2. WHEN `getParticipantProjects` is called with a valid `userId` and a list of projects, THE getParticipantProjects SHALL return all projects where the `applicants` array contains an entry with `id === userId` and `status === 'accepted'`.
3. WHEN `getParticipantProjects` is called and a project's `applicants` array is `undefined` or `null`, THE getParticipantProjects SHALL treat that project's applicants as an empty array and continue without error.
4. WHEN `getParticipantProjects` is called and an applicant entry is a plain string (Legacy_Format), THE getParticipantProjects SHALL NOT treat that entry as an accepted applicant.
5. THE getParticipantProjects SHALL return a result with no duplicate projects.
6. THE getParticipantProjects SHALL return results sorted by `createdAt` in descending order.

---

### Requirement 5: Köhnə Format Uyğunluğu

**User Story:** Bir developer kimi, köhnə `applicants` formatındakı (sadə string ID) layihələrin yeni məntiqə görə iştirakçı kimi sayılmamasını istəyirəm ki, köhnə datanın yanlış görünməsinin qarşısı alınsın.

#### Acceptance Criteria

1. WHEN a project's `applicants` array contains a plain string entry (Legacy_Format), THE getParticipantProjects SHALL NOT include that project in the results based on that entry alone (unless the user is the Project_Owner).
2. WHEN a project's `applicants` array contains both Legacy_Format entries and object-format entries, THE getParticipantProjects SHALL only evaluate object-format entries for `accepted` status.

---

### Requirement 6: Başqa İstifadəçinin Profilinin Görüntülənməsi

**User Story:** Bir istifadəçi kimi, başqa bir istifadəçinin profilini ziyarət etdikdə onun iştirak etdiyi layihələri də görmək istəyirəm ki, həmin şəxsin fəaliyyəti haqqında tam məlumat əldə edim.

#### Acceptance Criteria

1. WHEN a user views another user's profile, THE Projects_Tab SHALL display all projects where the viewed user is a Project_Owner.
2. WHEN a user views another user's profile, THE Projects_Tab SHALL display all projects where the viewed user is an Accepted_Applicant.
3. WHEN a user views another user's profile, THE Projects_Tab SHALL NOT show edit, delete, or status-toggle controls regardless of the viewed user's role in each project.

---

### Requirement 7: Silinmiş Layihənin Profilə Təsiri

**User Story:** Bir istifadəçi kimi, bir layihə silindiyi zaman həmin layihənin profilimin "Layihələr" tabından avtomatik çıxarılmasını istəyirəm ki, profildə etibarsız məlumat görünməsin.

#### Acceptance Criteria

1. WHEN a project is deleted from the DB, THE Projects_Tab SHALL no longer display that project on any user's profile upon the next profile load.
