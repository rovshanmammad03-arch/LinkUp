# Implementation Plan: Rich Post Types

## Overview

`NewPostModal.jsx` və `PostCard.jsx` komponentlərini genişləndirərək dörd zəngin post tipi (`code`, `design`, `project`, `learned`) əlavə edirik. Hər tip öz xüsusi sahə formu, məlumat strukturu (`metadata`) və feed görünüşünə malikdir. Köhnə postlarla geriyə uyğunluq qorunur.

## Tasks

- [x] 1. `react-syntax-highlighter` paketini quraşdır və `parseTechnologies` utility funksiyasını yaz
  - `npm install react-syntax-highlighter` ilə paketi əlavə et
  - `src/services/db.js`-ə `parseTechnologies(input)` funksiyasını əlavə et: `input.split(',').map(t => t.trim()).filter(Boolean)`
  - _Requirements: 2.4, 4.2_

- [x] 2. i18n açarlarını bütün dil fayllarına əlavə et
  - [x] 2.1 `public/locales/az/translation.json`-a yeni açarları əlavə et
    - `newPost.types.learned` → `"Öyrəndim"`
    - `newPost.codeLanguageLabel` → `"Proqramlaşdırma Dili"`
    - `newPost.codePlaceholder` → `"Kodunuzu buraya yazın..."`
    - `newPost.designLinkLabel` → `"Dizayn Linki"`
    - `newPost.designLinkPlaceholder` → `"Figma, Behance, Dribbble..."`
    - `newPost.toolsLabel` → `"İstifadə Edilən Alətlər"`
    - `newPost.projectNameLabel` → `"Layihə Adı"`
    - `newPost.projectNamePlaceholder` → `"Layihənin adı..."`
    - `newPost.projectDescLabel` → `"Qısa Təsvir"`
    - `newPost.technologiesLabel` → `"Texnologiyalar"`
    - `newPost.technologiesPlaceholder` → `"React, Node.js, TypeScript"`
    - `newPost.githubLabel` → `"GitHub Linki"`
    - `newPost.demoLabel` → `"Canlı Demo Linki"`
    - `newPost.topicLabel` → `"Mövzu"`
    - `newPost.topicPlaceholder` → `"Nə öyrəndiniz?"`
    - `newPost.levelLabel` → `"Səviyyə"`
    - `newPost.notesLabel` → `"Qeydlər"`
    - `newPost.notesPlaceholder` → `"Öyrəndikləriniz haqqında qeydlər..."`
    - `newPost.sourceLinkLabel` → `"Mənbə Linki"`
    - `post.types.learned` → `"Öyrəndim"`
    - `post.copyCode` → `"Kopyala"`
    - `post.codeCopied` → `"Kopyalandı ✓"`
    - `post.viewDesign` → `"Dizayna Bax"`
    - `post.viewSource` → `"Mənbəyə Bax"`
    - `post.viewDemo` → `"Canlı Demo"`
    - `post.levels.beginner` → `"Başlanğıc"`
    - `post.levels.intermediate` → `"Orta"`
    - `post.levels.advanced` → `"Qabaqcıl"`
    - _Requirements: 8.1, 8.3_
  - [x] 2.2 Eyni açarları `en`, `ru`, `tr` dil fayllarına müvafiq tərcümələrlə əlavə et
    - EN: `learned`→`"Learned"`, `copyCode`→`"Copy"`, `codeCopied`→`"Copied ✓"`, `viewDesign`→`"View Design"`, `viewSource`→`"View Source"`, `viewDemo`→`"Live Demo"`, levels: `beginner`→`"Beginner"`, `intermediate`→`"Intermediate"`, `advanced`→`"Advanced"`
    - RU: `learned`→`"Узнал"`, `copyCode`→`"Копировать"`, `codeCopied`→`"Скопировано ✓"`, `viewDesign`→`"Открыть дизайн"`, `viewSource`→`"Открыть источник"`, `viewDemo`→`"Живое демо"`, levels: `beginner`→`"Начинающий"`, `intermediate`→`"Средний"`, `advanced`→`"Продвинутый"`
    - TR: `learned`→`"Öğrendim"`, `copyCode`→`"Kopyala"`, `codeCopied`→`"Kopyalandı ✓"`, `viewDesign`→`"Tasarıma Bak"`, `viewSource`→`"Kaynağa Bak"`, `viewDemo`→`"Canlı Demo"`, levels: `beginner`→`"Başlangıç"`, `intermediate`→`"Orta"`, `advanced`→`"İleri"`
    - _Requirements: 8.3, 8.4_

- [x] 3. `NewPostModal.jsx`-i genişləndir — `learned` tipi və `metadata` state-i
  - `POST_TYPES` massivinə `{ value: 'learned', icon: 'mdi:lightbulb-outline', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' }` əlavə et
  - `const [metadata, setMetadata] = useState({})` state-i əlavə et
  - `postType` dəyişdikdə `setMetadata({})` çağır
  - `handlePost` funksiyasında `newPost` obyektinə `metadata` sahəsini əlavə et
  - `isPublishDisabled()` funksiyasını dizayn sənədindəki tip-spesifik validasiya məntiqi ilə yaz
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 7.1, 7.3_

- [x] 4. `CodeTypeForm` komponentini `NewPostModal.jsx` içərisində yaz
  - Proqramlaşdırma dili `<select>` elementi: JavaScript, TypeScript, Python, Dart, Java, C++, HTML, CSS, SQL, Bash
  - Kod `<textarea>` elementi: `font-mono`, `min-h-[200px]`, `bg-black/5 dark:bg-black/50`
  - `onChange` prop vasitəsilə `metadata.language` və `metadata.code` yenilənsin
  - `NewPostModal`-da `postType === 'code'` olduqda bu formu render et
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. `DesignTypeForm` komponentini `NewPostModal.jsx` içərisində yaz
  - Mövcud şəkil yükləmə/URL bölməsini bu formun içinə köçür (yalnız `design` tipindən istifadə etsin)
  - Dizayn linki `<input type="url">` sahəsi: `metadata.designLink`
  - Alətlər çoxlu seçim: Figma, Adobe XD, Sketch, Illustrator, Photoshop, Canva, Framer, Webflow — toggle düymələri kimi
  - `metadata.tools` array-i seçilmiş alətləri saxlasın
  - `NewPostModal`-da `postType === 'design'` olduqda bu formu render et
  - _Requirements: 3.1, 3.2_

- [x] 6. `ProjectTypeForm` komponentini `NewPostModal.jsx` içərisində yaz
  - Layihə adı `<input>`: `metadata.projectName`
  - Qısa təsvir `<textarea>`: `metadata.description`
  - Texnologiyalar `<input>` (vergüllə ayrılmış): `metadata.technologies` — daxiletmə zamanı string, saxlama zamanı `parseTechnologies()` ilə array-ə çevrilir
  - GitHub linki `<input type="url">`: `metadata.githubUrl`
  - Canlı demo linki `<input type="url">`: `metadata.demoUrl`
  - `NewPostModal`-da `postType === 'project'` olduqda bu formu render et
  - _Requirements: 4.1, 4.2_

- [x] 7. `LearnedTypeForm` komponentini `NewPostModal.jsx` içərisində yaz
  - Mövzu adı `<input>`: `metadata.topic`
  - Səviyyə seçimi — üç düymə: `beginner`, `intermediate`, `advanced` → `metadata.level`
  - Qeydlər `<textarea>`: `metadata.notes`
  - Mənbə linki `<input type="url">`: `metadata.sourceUrl`
  - `NewPostModal`-da `postType === 'learned'` olduqda bu formu render et
  - _Requirements: 5.1, 5.2_

- [x] 8. Checkpoint — `NewPostModal` testlərini keç
  - Bütün dörd tipin formlarının düzgün render olduğunu yoxla
  - Tip dəyişdikdə metadata-nın sıfırlandığını yoxla
  - Publish düyməsinin validasiya qaydalarına uyğun deaktiv/aktiv olduğunu yoxla
  - Bütün testlər keçirsə növbəti mərhələyə keç, suallar varsa istifadəçiyə müraciət et

- [x] 9. `PostCard.jsx`-i genişləndir — `POST_ICONS` və `POST_LABELS` yenilənməsi
  - `POST_ICONS`-a `learned: 'mdi:lightbulb-outline'` əlavə et
  - `POST_LABELS`-a `learned: 'bg-amber-500/10 text-amber-400 border-amber-500/20'` əlavə et
  - Köhnə `other` tipi üçün fallback davranışı qorunur
  - _Requirements: 6.1, 6.2, 7.2, 7.4_

- [x] 10. `PostCard.jsx`-ə `CodePostView` render bloku əlavə et
  - `post.type === 'code'` olduqda mövcud placeholder/image bölməsinin yerinə bu bloku render et
  - `react-syntax-highlighter` ilə `SyntaxHighlighter` komponenti: `language={post.metadata?.language?.toLowerCase() ?? 'javascript'}`, `style={oneDark}`
  - Sol üstdə dil etiketi badge-i
  - Sağ üstdə "Kopyala" düyməsi: `navigator.clipboard.writeText()`, 2 saniyə "Kopyalandı ✓" göstər
  - `post.metadata?.code ?? ''` — optional chaining ilə
  - _Requirements: 2.4, 2.5, 2.6, 2.7, 6.3_

- [x] 11. `PostCard.jsx`-ə `DesignPostView` render bloku əlavə et
  - `post.type === 'design'` olduqda şəkli tam genişlikdə göstər (mövcud davranış qorunur)
  - `post.metadata?.tools ?? []` — alət etiketlərini kiçik badge-lər kimi şəklin altında render et
  - `post.metadata?.designLink` varsa "Dizayna Bax" düyməsi göstər (`target="_blank" rel="noopener noreferrer"`)
  - _Requirements: 3.3, 3.4, 3.5, 6.6_

- [x] 12. `PostCard.jsx`-ə `ProjectPostView` render bloku əlavə et
  - `post.type === 'project'` olduqda `post.metadata?.projectName` başlıq kimi render et
  - `post.metadata?.technologies ?? []` — rəngli pill tag-lar kimi render et
  - `post.metadata?.githubUrl` varsa GitHub ikonlu link düyməsi göstər
  - `post.metadata?.demoUrl` varsa "Canlı Demo" düyməsi göstər
  - Hər iki düymə `target="_blank" rel="noopener noreferrer"` ilə
  - _Requirements: 4.3, 4.4, 4.5, 6.4_

- [x] 13. `PostCard.jsx`-ə `LearnedPostView` render bloku əlavə et
  - `post.type === 'learned'` olduqda `post.metadata?.topic` başlıq kimi render et
  - Səviyyə badge-i: `beginner`→`bg-green-500/10 text-green-400`, `intermediate`→`bg-yellow-500/10 text-yellow-400`, `advanced`→`bg-red-500/10 text-red-400`
  - `post.metadata?.notes` varsa mətn kimi render et
  - `post.metadata?.sourceUrl` varsa "Mənbəyə Bax" düyməsi göstər
  - _Requirements: 5.3, 5.4, 5.5, 6.5_

- [x] 14. Köhnə post geriyə uyğunluğunu `PostCard.jsx`-də təmin et
  - `post.metadata` olmayan postlar üçün `post.type === 'other'` kimi render et (mövcud davranış)
  - Bütün `post.metadata?.field` oxumalarında optional chaining istifadə et
  - `post.type` olmayan postlar üçün `POST_ICONS.other` və `POST_LABELS.other` fallback-i tətbiq et
  - _Requirements: 7.2, 7.4_

- [x] 15. Checkpoint — `PostCard` render bloklarını yoxla
  - Hər dörd tip üçün feed-də düzgün render olduğunu yoxla
  - Köhnə seed postlarının sınmadığını yoxla
  - Kopyala düyməsinin işlədiyini yoxla
  - Xarici linklərin `target="_blank"` ilə açıldığını yoxla
  - Bütün testlər keçirsə növbəti mərhələyə keç, suallar varsa istifadəçiyə müraciət et

- [x] 16. Test fayllarını quraşdır və property testlərini yaz
  - [x] 16.1 Vitest + React Testing Library + fast-check quraşdır
    - `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom fast-check jsdom`
    - `vite.config.js`-ə test konfiqurasiyasını əlavə et: `test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.js'] }`
    - `src/test/setup.js` faylını yarat: `import '@testing-library/jest-dom'`
    - _Requirements: 8.1_
  - [ ]* 16.2 `src/test/utils.test.js` — P6: Tag parsing round-trip property testi yaz
    - **Property 6: Texnologiya tag parsing round-trip**
    - **Validates: Requirements 4.2**
    - `// Feature: rich-post-types, Property 6: For any non-empty array of technology strings, join then parse produces original array`
    - `fc.array(fc.string({minLength:1}).map(s=>s.trim()).filter(s=>s&&!s.includes(',')), {minLength:1})` generatoru ilə
    - _Requirements: 4.2_
  - [ ]* 16.3 `src/test/NewPostModal.test.jsx` — P1, P2, P3 property testlərini yaz
    - **Property 1: Tip seçimi düzgün formu göstərir** — `fc.constantFrom('code','design','project','learned')` ilə hər tipin öz sahələrini render etdiyini yoxla
    - **Property 2: Tip dəyişdikdə metadata sıfırlanır** — iki fərqli tip seçib metadata-nın boş olduğunu yoxla
    - **Property 3: Dəstəklənən dillər dropdown-da mövcuddur** — `fc.constantFrom(...REQUIRED_LANGUAGES)` ilə hər dilin `<select>`-də olduğunu yoxla
    - `// Feature: rich-post-types, Property 1/2/3: ...`
    - _Requirements: 1.2, 1.3, 2.2_
  - [ ]* 16.4 `src/test/PostCard.test.jsx` — P4, P5, P7, P8, P10 property testlərini yaz
    - **Property 4: Kod postu kod bloku kimi render edilir** — `fc.record({ code: fc.string({minLength:1}), language: fc.constantFrom(...langs) })` ilə
    - **Property 5: Dizayn alətləri etiket kimi render edilir** — `fc.array(fc.constantFrom(...TOOLS), {minLength:1})` ilə
    - **Property 7: Layihə postu adı və texnologiyaları render edir** — `fc.record({ projectName: fc.string({minLength:1}), technologies: fc.array(...) })` ilə
    - **Property 8: Öyrəndim postu mövzu və səviyyəni render edir** — `fc.record({ topic: fc.string({minLength:1}), level: fc.constantFrom('beginner','intermediate','advanced') })` ilə
    - **Property 10: Hər post tipi üçün Type_Badge render edilir** — `fc.option(fc.constantFrom(...allTypes))` ilə metadata olmayan postlar da daxil
    - Hər test minimum 100 iterasiya ilə işləsin: `fc.assert(fc.property(...), { numRuns: 100 })`
    - `// Feature: rich-post-types, Property N: ...`
    - _Requirements: 2.4, 2.5, 3.4, 4.3, 5.3, 5.4, 6.2, 7.4_
  - [ ]* 16.5 `src/test/db.test.js` — P9: Post yaradılarkən data bütövlüyü property testi yaz
    - **Property 9: Post yaradılarkən data bütövlüyü qorunur**
    - **Validates: Requirements 7.1, 7.3, 7.5**
    - `fc.record({ type: fc.constantFrom('code','design','project','learned'), caption: fc.string({minLength:1}), metadata: fc.object() })` ilə
    - Yaradılan post-un `type`, `caption`, `metadata`, `likes`, `comments`, `createdAt`, `authorId` sahələrini yoxla
    - `// Feature: rich-post-types, Property 9: For any post type and valid metadata, created post preserves all required fields`
    - _Requirements: 7.1, 7.3, 7.5_

- [x] 17. Final checkpoint — bütün testlər keçsin
  - `npx vitest run` ilə bütün testləri işlət
  - Bütün testlər keçirsə iş tamamdır, suallar varsa istifadəçiyə müraciət et

## Notes

- `*` ilə işarələnmiş tapşırıqlar isteğe bağlıdır — sürətli MVP üçün keçilə bilər
- Hər tapşırıq izlənə bilmək üçün spesifik requirements-lərə istinad edir
- Checkpoint tapşırıqları inkremental doğrulama üçündür
- Property testləri universal düzgünlük xüsusiyyətlərini yoxlayır
- Unit testlər spesifik nümunələri və edge case-ləri yoxlayır
- `react-syntax-highlighter` yükləmə xətasında `<pre><code>` fallback-i tətbiq edilir
- Bütün xarici linklər `target="_blank" rel="noopener noreferrer"` ilə açılır
