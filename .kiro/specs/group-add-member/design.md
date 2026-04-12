# Dizayn Sənədi: Group Add Member

## Ümumi Baxış

Bu xüsusiyyət, layihə qruplarının adminlərinə (layihənin `authorId`-si olan istifadəçilərə) mövcud platforma istifadəçilərini birbaşa qrup söhbətinə əlavə etmə imkanı verir. Hal-hazırda `Messages.jsx`-dəki `ManageTeam` paneli yalnız üzv çıxarma (`handleRemoveMember`) funksiyasını dəstəkləyir. Bu dizayn, əks istiqamətdə — üzv əlavə etmə — funksionallığını əlavə edir.

**Əsas axın:**
1. Admin `ManageTeam` panelindəki "Üzv Əlavə Et" düyməsinə basır
2. `AddMemberModal` açılır, admin istifadəçi adına görə axtarış edir
3. Nəticə siyahısından istifadəçini seçir
4. Sistem istifadəçini `project.applicants`-a əlavə edir, sistem mesajı yazır, bildiriş göndərir

---

## Arxitektura

Mövcud arxitektura saxlanılır: `Messages.jsx` tək böyük komponent kimi işləyir, `localStorage`-a `src/services/db.js` vasitəsilə müraciət edir. Yeni `AddMemberModal` komponenti bu arxitekturaya uyğun olaraq ayrı bir fayl kimi yaradılır.

```mermaid
graph TD
    A[Messages.jsx] -->|showAddMember state| B[AddMemberModal]
    B -->|DB.get('users')| C[localStorage]
    B -->|onAdd callback| A
    A -->|DB.set('projects')| C
    A -->|DB.set('messages')| C
    A -->|addNotification| C
```

**Dizayn qərarları:**
- `AddMemberModal` ayrı komponent faylı kimi yaradılır (`src/components/messages/AddMemberModal.jsx`) — `ManageTeam` paneli artıq `Messages.jsx`-in içindədir, modal isə daha böyük olduğu üçün ayrı saxlanılır.
- Bütün DB əməliyyatları `Messages.jsx`-in içindəki `handleAddMember` funksiyasında icra edilir — bu, mövcud `handleRemoveMember` ilə eyni pattern-dir.
- Axtarış məntiqi `AddMemberModal`-ın daxilindəki `useState` ilə idarə olunur, DB-yə yazma isə `Messages.jsx`-ə ötürülür.

---

## Komponentlər və İnterfeyslər

### 1. `AddMemberModal` komponenti

**Fayl:** `src/components/messages/AddMemberModal.jsx`

**Props:**
```js
{
  projectId: string,       // seçilmiş layihənin id-si
  currentMembers: Array,   // mövcud aktiv üzvlər [{ id, status }]
  adminId: string,         // layihənin authorId-si (nəticədən çıxarılır)
  onAdd: (userId) => void, // üzv əlavə edildikdə çağırılır
  onClose: () => void      // modal bağlandıqda çağırılır
}
```

**Daxili state:**
```js
const [search, setSearch] = useState('');
```

**Filtrasiya məntiqi:**
```js
const activeMemberIds = new Set(
  currentMembers
    .filter(a => (typeof a === 'object' ? a.status : 'pending') === 'accepted')
    .map(a => typeof a === 'object' ? a.id : a)
);

const candidates = DB.get('users').filter(u =>
  u.id !== adminId &&
  !activeMemberIds.has(u.id) &&
  u.name.toLowerCase().includes(search.toLowerCase())
);
```

### 2. `Messages.jsx` dəyişiklikləri

**Yeni state:**
```js
const [showAddMember, setShowAddMember] = useState(false);
```

**Yeni funksiya — `handleAddMember`:**
```js
const handleAddMember = (userId) => {
  if (!selectedProjectId) return;
  const allProjects = DB.get('projects');
  const pIdx = allProjects.findIndex(p => p.id === selectedProjectId);
  if (pIdx === -1) return;

  const project = allProjects[pIdx];

  // Artıq üzv olub-olmadığını yoxla
  const alreadyMember = project.applicants.some(a => {
    const id = typeof a === 'object' ? a.id : a;
    const status = typeof a === 'object' ? a.status : 'pending';
    return id === userId && status === 'accepted';
  });
  if (alreadyMember) return;

  // Əlavə et
  project.applicants.push({ id: userId, status: 'accepted' });
  DB.set('projects', allProjects);

  // Sistem mesajı
  const addedUser = getUser(userId);
  DB.set('messages', [...DB.get('messages'), {
    id: 'm_' + uid(),
    from: 'system',
    projectId: selectedProjectId,
    text: `${addedUser?.name} qrupa əlavə edildi.`,
    ts: Date.now()
  }]);

  // Bildiriş
  addNotification({
    toUserId: userId,
    fromUserId: currentUser.id,
    type: 'group_add',
    text: `${currentUser.name} sizi "${project.title}" qrupuna əlavə etdi.`,
    route: 'messages',
    routeParams: { projectId: selectedProjectId }
  });

  setShowAddMember(false);
  refreshConvos();
};
```

**ManageTeam panelindəki dəyişiklik:**

Admin olduqda "Üzv Əlavə Et" düyməsi göstərilir:
```jsx
{selectedProjectConvo.project.authorId === currentUser?.id && (
  <button onClick={() => setShowAddMember(true)}>
    Üzv Əlavə Et
  </button>
)}
```

---

## Data Modelləri

### `project.applicants` massivi (mövcud format)
```js
[
  { id: "user_id", status: "accepted" | "rejected" | "pending" | "left" }
]
```

Yeni üzv əlavə edildikdə:
```js
project.applicants.push({ id: userId, status: "accepted" });
```

### Sistem mesajı (mövcud format)
```js
{
  id: "m_" + uid(),
  from: "system",
  projectId: string,
  text: "{İstifadəçi adı} qrupa əlavə edildi.",
  ts: Date.now()
}
```

### Bildiriş (mövcud `addNotification` funksiyası)
```js
{
  toUserId: string,
  fromUserId: string,
  type: "group_add",
  text: `${adminName} sizi "${projectTitle}" qrupuna əlavə etdi.`,
  route: "messages",
  routeParams: { projectId: string }
}
```

---


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Admin görünürlük invariantı

*For any* layihə və istifadəçi cütü, əgər `user.id === project.authorId` olarsa "Üzv Əlavə Et" düyməsi görünməlidir; əks halda görünməməlidir.

**Validates: Requirements 1.1, 1.3**

---

### Property 2: Namizəd filtrasiyası

*For any* layihə üçün, `AddMemberModal`-ın qaytardığı namizəd siyahısında nə layihənin admini (`authorId`), nə də `status: 'accepted'` olan aktiv üzv olmamalıdır.

**Validates: Requirements 2.3, 2.4**

---

### Property 3: Axtarış filtrasiyası

*For any* axtarış sorğusu və istifadəçi siyahısı üçün, qaytarılan bütün namizədlərin adları axtarış sorğusunu (case-insensitive) ehtiva etməlidir.

**Validates: Requirements 2.2**

---

### Property 4: Üzv əlavə etmə round-trip

*For any* etibarlı istifadəçi və layihə üçün, `handleAddMember(userId)` çağırıldıqdan sonra `project.applicants` massivində `{ id: userId, status: 'accepted' }` formatında qeyd olmalıdır.

**Validates: Requirements 3.1**

---

### Property 5: Sistem mesajı invariantı

*For any* qrupa əlavə edilən istifadəçi üçün, `messages` DB-sində həmin `projectId`-yə aid `from: 'system'` mesajı olmalı və mətn `"{istifadəçi adı} qrupa əlavə edildi."` formatında olmalıdır.

**Validates: Requirements 3.2**

---

### Property 6: Bildiriş göndərilməsi

*For any* qrupa əlavə edilən istifadəçi üçün, `notifications` DB-sində `toUserId === userId` və `type === 'group_add'` olan bildiriş olmalıdır.

**Validates: Requirements 3.5**

---

### Property 7: Təkrar əlavə etmə idempotentliyi

*For any* layihə üçün, artıq `status: 'accepted'` olan üzvü yenidən əlavə etməyə cəhd etdikdə `project.applicants` massivi dəyişməməlidir.

**Validates: Requirements 4.1**

---

## Xəta İdarəetməsi

| Ssenari | Davranış |
|---|---|
| `projectId` DB-də tapılmır | `handleAddMember` erkən çıxır, heç bir dəyişiklik olmur |
| İstifadəçi artıq aktiv üzvdür | Əlavə edilmir, UI-da xəbərdarlıq mesajı göstərilir |
| Modal xaricinə klik / "Ləğv et" | Modal bağlanır, heç bir DB dəyişikliyi olmur |
| Axtarış nəticəsi boşdur | "İstifadəçi tapılmadı" mesajı göstərilir |

---

## Test Strategiyası

### Unit Testlər

Konkret nümunələr və edge case-lər üçün:

- Admin olmayan istifadəçi üçün "Üzv Əlavə Et" düyməsinin gizlənməsi
- "Üzv Əlavə Et" düyməsinə basıldıqda modalın açılması
- Modal açıldıqda axtarış sahəsinin mövcudluğu
- Boş axtarış nəticəsində "İstifadəçi tapılmadı" mesajı
- Əlavə etmədən sonra modalın bağlanması
- "Ləğv et" düyməsinin DB-ni dəyişdirmədən modalı bağlaması
- Mövcud olmayan `projectId` ilə `handleAddMember` çağırıldıqda heç bir dəyişiklik olmaması

### Property-Based Testlər

**Kitabxana:** [fast-check](https://github.com/dubzzz/fast-check) (JavaScript/React üçün)

Hər property testi minimum **100 iterasiya** ilə işləməlidir. Hər test aşağıdakı tag formatı ilə annotasiya edilməlidir:

`// Feature: group-add-member, Property {N}: {property_text}`

| Property | Test Strategiyası |
|---|---|
| P1: Admin görünürlük | `fc.record({ userId: fc.string(), authorId: fc.string() })` ilə render, düymənin görünürlüyünü yoxla |
| P2: Namizəd filtrasiyası | Təsadüfi `applicants` massivi ilə, nəticədə admin və aktiv üzv olmadığını yoxla |
| P3: Axtarış filtrasiyası | Təsadüfi axtarış sorğusu ilə, bütün nəticələrin sorğunu ehtiva etdiyini yoxla |
| P4: Üzv əlavə round-trip | Təsadüfi `userId` ilə `handleAddMember` çağır, `applicants`-da `{ id, status: 'accepted' }` olduğunu yoxla |
| P5: Sistem mesajı | Əlavə etmədən sonra `messages`-də düzgün sistem mesajının olduğunu yoxla |
| P6: Bildiriş | Əlavə etmədən sonra `notifications`-da düzgün bildirişin olduğunu yoxla |
| P7: İdempotentlik | Artıq üzv olan istifadəçini yenidən əlavə etdikdə `applicants` uzunluğunun dəyişmədiyini yoxla |

### İnteqrasiya Testləri

- `Messages.jsx` ilə `AddMemberModal` arasındakı tam axın (açma → axtarış → seçim → əlavə)
- `ManageTeam` panelinin əlavə etmədən sonra yenilənməsi
