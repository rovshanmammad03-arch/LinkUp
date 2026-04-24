export const DB = {
    get: function(k) { try { return JSON.parse(localStorage.getItem('lu_' + k)) || [] } catch(e) { return [] } },
    set: function(k, v) { try { localStorage.setItem('lu_' + k, JSON.stringify(v)) } catch(e) { console.error('localStorage yazma xətası:', e); throw e; } },
    getOne: function(k) { try { return JSON.parse(localStorage.getItem('lu_' + k)) } catch(e) { return null } },
    setOne: function(k, v) { localStorage.setItem('lu_' + k, JSON.stringify(v)) }
};

/**
 * Şifrəni sadə hash ilə kodlayır (backend olmadığı üçün müvəqqəti həll).
 * Real backend əlavə edildikdə bcrypt ilə əvəz edilməlidir.
 * @param {string} password
 * @returns {string}
 */
export function hashPassword(password) {
    // djb2 hash alqoritmi — açıq mətn saxlamaqdan daha yaxşıdır
    let hash = 5381;
    for (let i = 0; i < password.length; i++) {
        hash = ((hash << 5) + hash) ^ password.charCodeAt(i);
        hash = hash >>> 0; // 32-bit unsigned
    }
    return 'h_' + hash.toString(16) + '_' + btoa(password.length.toString()).replace(/=/g, '');
}

export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }

export function parseTechnologies(input) {
    if (!input) return [];
    return input.split(',').map(t => t.trim()).filter(Boolean);
}

export const GRADIENTS = [
    'from-brand-500 to-purple-500','from-cyan-500 to-green-500',
    'from-amber-500 to-rose-500','from-pink-500 to-brand-500',
    'from-green-500 to-cyan-500','from-purple-500 to-pink-500',
    'from-teal-500 to-brand-500','from-rose-500 to-amber-500',
    'from-brand-600 to-cyan-500'
];

export function initials(n) { 
    if (!n) return '';
    return n.split(' ').map(function(w){return w[0]}).join('').slice(0,2).toUpperCase() 
}

export function timeAgo(ts, t) {
    var d = Date.now() - ts, 
        m = Math.floor(d / 60000), 
        h = Math.floor(d / 3600000), 
        dy = Math.floor(d / 86400000);
    if (t) {
        if (m < 1) return t('timeAgo.now');
        if (m < 60) return t('timeAgo.min', { count: m });
        if (h < 24) return t('timeAgo.hour', { count: h });
        return t('timeAgo.day', { count: dy });
    }
    if (m < 1) return 'İndi';
    if (m < 60) return m + ' dəq';
    if (h < 24) return h + ' saat';
    return dy + ' gün';
}

export function getUser(id) {
    return DB.get('users').find(function(u){return u.id === id});
}

export function seedIfEmpty() {
    if (DB.get('users').length > 0) return;
    const hp = hashPassword('12345678');
    DB.set('users',[
        {id:'seed_1',name:'Leyla Məmmədova',email:'leyla@test.com',password:hp,university:'ADNSU',field:'Dizayn',level:'Qabaqcıl',bio:'Product Designer at Google. Figma enthusiast.',grad:'from-pink-500 to-rose-500',skills:[{n:'Figma',l:'Qabaqcıl'},{n:'UI/UX',l:'Qabaqcıl'},{n:'Prototyping',l:'Orta'}],links:[{t:'Portfolio',v:'behance.net/leyla'},{t:'LinkedIn',v:'linkedin.com/in/leyla'}],views:120,followers:['seed_0','seed_2'],following:['seed_0']},
        {id:'seed_0',name:'Ayxan Quliyev',email:'ayxan@test.com',password:hp,university:'UNEC',field:'Proqramlaşdırma',level:'Orta',bio:'Full-stack developer student. Love React and Node.js.',grad:'from-brand-500 to-brand-600',skills:[{n:'React',l:'Orta'},{n:'JavaScript',l:'Orta'},{n:'CSS',l:'Qabaqcıl'}],links:[{t:'GitHub',v:'github.com/ayxan'},{t:'Twitter',v:'twitter.com/ayxan'}],views:85,followers:['seed_1'],following:['seed_1','seed_2']},
        {id:'seed_2',name:'Rəşad Əliyev',email:'reshad@test.com',password:hp,university:'BMU',field:'Proqramlaşdırma',level:'Qabaqcıl',bio:'Data Scientist. Python and ML expert.',grad:'from-blue-500 to-indigo-600',skills:[{n:'Python',l:'Qabaqcıl'},{n:'TensorFlow',l:'Orta'},{n:'SQL',l:'Qabaqcıl'}],links:[{t:'Kaggle',v:'kaggle.com/reshad'}],views:210,followers:['seed_0'],following:['seed_1']},
        {id:'seed_3',name:'Nigar Hüseynova',email:'nigar@test.com',password:hp,university:'ADA',field:'Marketinq',level:'Orta',bio:'Digital marketing specialist. SEO and Social Media expert.',grad:'from-orange-400 to-red-500',skills:[{n:'SEO',l:'Orta'},{n:'Google Ads',l:'Qabaqcıl'}],links:[],views:45,followers:[],following:[]},
        {id:'seed_4',name:'Emin Bağırov',email:'emin@test.com',password:hp,university:'ADNSU',field:'Proqramlaşdırma',level:'Başlanğıc',bio:'Junior dev learning the ropes. Java and Spring.',grad:'from-green-500 to-teal-500',skills:[{n:'Java',l:'Başlanğıc'},{n:'Spring',l:'Başlanğıc'}],links:[],views:32,followers:[],following:[]},
        {id:'seed_5',name:'Səbinə Rəhimova',email:'sabina@test.com',password:hp,university:'ADRA',field:'Dizayn',level:'Orta',bio:'Graphic designer. Illustrator and Photoshop geek.',grad:'from-purple-500 to-indigo-500',skills:[{n:'Illustrator',l:'Qabaqcıl'},{n:'Photoshop',l:'Qabaqcıl'}],links:[],views:78,followers:[],following:[]},
        {id:'seed_6',name:'Murad Vəliyev',email:'murad@test.com',password:hp,university:'BANM',field:'Proqramlaşdırma',level:'Qabaqcıl',bio:'Cybersecurity expert and software architect.',grad:'from-neutral-700 to-neutral-900',skills:[{n:'C++',l:'Qabaqcıl'},{n:'Cybersecurity',l:'Qabaqcıl'}],links:[],views:145,followers:[],following:[]},
        {id:'seed_7',name:'Aydan Məmmədova',email:'aydan@test.com',password:hp,university:'ADNSU',field:'Dizayn',level:'Orta',bio:'Interior designer. Focus on minimalist projects.',grad:'from-amber-400 to-orange-500',skills:[{n:'AutoCAD',l:'Orta'},{n:'3ds Max',l:'Orta'}],links:[],views:62,followers:[],following:[]}
    ]);
    DB.set('projects',[
        {id:'p1',title:'E-ticaret Platforması',desc:'MVC arxitekturası ilə tam funksional e-ticaret saytı. İstifadəçi qeydiyyatı, məhsul kataloqu, səbət və ödəniş sistemi.',authorId:'seed_0',skills:['React','Node.js','UI/UX'],team:'3-5 nəfər',status:'active',createdAt:Date.now()-100000,applicants:[],grad:GRADIENTS[0]},
        {id:'p2',title:'Mobil Fitness App',desc:'Flutter ilə çarpaz platformalı fitness tətbiqi. Pulsuz və premium planlar, izləmə dashboard.',authorId:'seed_1',skills:['Flutter','UI/UX','Backend'],team:'2-3 nəfər',status:'active',createdAt:Date.now()-200000,applicants:[],grad:GRADIENTS[1]},
        {id:'p3',title:'AI Foto Redaktor',desc:'ML əsaslı foto redaktə web app. Auto-enhance, arxa plan dəyişmə, stil transfer.',authorId:'seed_2',skills:['Python','TensorFlow','React'],team:'3-5 nəfər',status:'active',createdAt:Date.now()-300000,applicants:[],grad:GRADIENTS[2]},
        {id:'p4',title:'Startup Landing Page',desc:'SaaS startup üçün modern, animasiyalı landing page. SEO-optimized, responsive.',authorId:'seed_3',skills:['UI/UX','Next.js','Copywriting'],team:'2-3 nəfər',status:'completed',createdAt:Date.now()-400000,applicants:[],grad:GRADIENTS[3]}
    ]);
    DB.set('connections',[]);
    DB.set('messages',[]);
    DB.set('posts',[
        {id:'post1',authorId:'seed_1',image:'',caption:'Bu layihədə Figma ilə SaaS dashboard dizayn etdim. Dark theme, minimal approach. Component library hazırladım.',type:'design',likes:['seed_0','seed_5','seed_3'],comments:[{id:'c1',userId:'seed_0',text:'Gözəl dizayn! Color palette çox yaxşı seçilib 👏',ts:Date.now()-100000},{id:'c2',userId:'seed_5',text:'Bu component library-ni paylaşa bilərsənmi?',ts:Date.now()-80000},{id:'c3',userId:'seed_1',parentId:'c2',text:'Əlbəttə, tezliklə GitHub-a yükləyəcəm!',ts:Date.now()-60000}],createdAt:Date.now()-120000},
        {id:'post2',authorId:'seed_0',image:'',caption:'Django REST Framework ilə backend API yazdım. JWT auth, pagination, filtering hamısı hazırdır. GitHub-da var.',type:'code',likes:['seed_2','seed_6','seed_1','seed_7'],comments:[{id:'c4',userId:'seed_6',text:'Mən də oxşar bir şey yazmışdım, versiyalar fərqlidir 😄',ts:Date.now()-90000},{id:'c5',userId:'seed_2',text:'Filtering hissəsini necə həll etdin?',ts:Date.now()-70000},{id:'c6',userId:'seed_0',parentId:'c5',text:'Django-filters library istifadə etdim, çox rahatdır.',ts:Date.now()-60000}],createdAt:Date.now()-150000},
        {id:'post3',authorId:'seed_5',image:'',caption:'"FreshBite" restoran üçün branding etdim. Logo, menü kartı, və sosial media post şablonları. Adobe Illustrator ilə.',type:'design',likes:['seed_1','seed_3','seed_4','seed_7','seed_2'],comments:[{id:'c7',userId:'seed_3',text:'Logo çox yaxşı alınıb! Font nədir?',ts:Date.now()-75000},{id:'c8',userId:'seed_5',parentId:'c7',text:'Montserrat bold + Playfair Display. Combo çox uyğundur.',ts:Date.now()-70000}],createdAt:Date.now()-250000},
        {id:'post4',authorId:'seed_2',image:'',caption:'Kaggle competition-da top 5% girib. Titanic dataset üzərində feature engineering etdim. Random Forest və XGBoost ilə müqayisə etdim.',type:'project',likes:['seed_0','seed_7','seed_4'],comments:[{id:'c9',userId:'seed_7',text:'XGBoost həmişə yaxşı nəticə verir 😎',ts:Date.now()-90000},{id:'c10',userId:'seed_4',text:'Mən də Kaggle başlamaq istəyirdim, növbəti competition hansıdır?',ts:Date.now()-85000}],createdAt:Date.now()-350000},
        {id:'post5',authorId:'seed_6',image:'',caption:'MERN stack ilə e-ticaret saytı yazıram. İndi payment integration mərhələsindəyəm. Stripe istifadə edirəm.',type:'code',likes:['seed_0','seed_1'],comments:[{id:'c11',userId:'seed_1',text:'Stripe çox asandır, yaxşı seçim!',ts:Date.now()-45000}],createdAt:Date.now()-500000},
        {id:'post6',authorId:'seed_3',image:'',caption:'Google Ads ilə kampaniya idarə etdim. CPC 0.30 AZN-ə saldım, conversion rate 4.2% oldu. Screenshots aşağıda.',type:'other',likes:['seed_5','seed_7'],comments:[],createdAt:Date.now()-600000},
        {id:'post7',authorId:'seed_0',image:'',caption:'React-də custom useFetch hook yazdım. Loading, error və data state-lərini avtomatik idarə edir.',type:'code',metadata:{language:'JavaScript',code:`import { useState, useEffect } from 'react';\n\nexport function useFetch(url) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    fetch(url)\n      .then(res => res.json())\n      .then(setData)\n      .catch(setError)\n      .finally(() => setLoading(false));\n  }, [url]);\n\n  return { data, loading, error };\n}`},likes:['seed_2','seed_6'],comments:[],createdAt:Date.now()-700000},
        {id:'post8',authorId:'seed_1',image:'',caption:'LinkUp üçün onboarding ekranı dizayn etdim. Figma Auto Layout ilə responsive komponentlər.',type:'design',metadata:{designLink:'https://figma.com',tools:['Figma','Framer']},likes:['seed_5','seed_3','seed_0'],comments:[],createdAt:Date.now()-800000},
        {id:'post9',authorId:'seed_2',image:'',caption:'Açıq mənbəli Python paket yazdım — CSV faylları üçün sürətli data validation kitabxanası.',type:'project',metadata:{projectName:'csv-validator',description:'CSV faylları üçün sürətli schema-based validation kitabxanası.',technologies:['Python','Pandas','PyPI'],githubUrl:'https://github.com',demoUrl:'https://pypi.org'},likes:['seed_0','seed_4','seed_7'],comments:[],createdAt:Date.now()-900000},
        {id:'post10',authorId:'seed_4',image:'',caption:'Bu həftə Docker haqqında çox şey öyrəndim. Container-lar, image-lər, volume-lar — hamısı artıq aydındır!',type:'learned',metadata:{topic:'Docker & Containerization',level:'beginner',notes:'Container = izolə edilmiş mühit. Image = şablon. docker-compose ilə multi-container app idarə etmək çox asandır.',sourceUrl:'https://docs.docker.com'},likes:['seed_0','seed_2'],comments:[],createdAt:Date.now()-1000000}
    ]);
    DB.set('notifications',[]);
}

export function addNotification({ toUserId, fromUserId, type, text, route, routeParams }) {
    if (!toUserId || !fromUserId || toUserId === fromUserId) return;
    const notifs = DB.get('notifications');
    notifs.unshift({
        id: 'n_' + uid(),
        toUserId,
        fromUserId,
        type,
        text,
        route: route || 'notifications',
        routeParams: routeParams || {},
        read: false,
        ts: Date.now()
    });
    // Max 50 notification saxla
    DB.set('notifications', notifs.slice(0, 50));
}

/**
 * E-poçtu DB-də axtarır, tapılarsa 6 rəqəmli token generasiya edib
 * lu_reset_token açarı ilə saxlayır.
 * @param {string} email
 * @returns {{ success: boolean, token?: string, error?: string }}
 */
export function generateResetToken(email) {
    const users = DB.get('users');
    const user = users.find(function(u) { return u.email === email; });
    if (!user) return { success: false, error: 'not_found' };
    const token = Math.floor(100000 + Math.random() * 900000);
    DB.setOne('reset_token', { email, token: String(token), expiresAt: Date.now() + 15 * 60 * 1000 });
    return { success: true, token: String(token) };
}

/**
 * Daxil edilmiş tokeni DB-dəki token ilə müqayisə edir və müddətini yoxlayır.
 * @param {string} email
 * @param {string} token
 * @returns {{ success: boolean, error?: 'wrong_token' | 'expired' | 'not_found' }}
 */
export function verifyToken(email, token) {
    const record = DB.getOne('reset_token');
    if (!record) return { success: false, error: 'not_found' };
    if (record.email !== email) return { success: false, error: 'wrong_token' };
    if (Date.now() >= record.expiresAt) return { success: false, error: 'expired' };
    if (record.token !== token) return { success: false, error: 'wrong_token' };
    return { success: true };
}

/**
 * İstifadəçinin şifrəsini yeniləyir və token məlumatını silir.
 * @param {string} email
 * @param {string} newPassword
 * @returns {{ success: boolean, error?: string }}
 */
export function resetPassword(email, newPassword) {
    const users = DB.get('users');
    const userIndex = users.findIndex(function(u) { return u.email === email; });
    if (userIndex === -1) return { success: false, error: 'not_found' };
    const updatedUsers = users.map(function(u) {
        return u.email === email ? Object.assign({}, u, { password: hashPassword(newPassword) }) : u;
    });
    DB.set('users', updatedUsers);
    DB.setOne('reset_token', null);
    return { success: true };
}

/**
 * URL-in http:// və ya https:// ilə başlayıb-başlamadığını yoxlayır.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Fayl ölçüsünün 2MB limitini aşıb-aşmadığını yoxlayır.
 * @param {number} sizeInBytes
 * @returns {boolean}
 */
export function isValidFileSize(sizeInBytes) {
    return typeof sizeInBytes === 'number' && sizeInBytes >= 0 && sizeInBytes <= 2 * 1024 * 1024;
}

/**
 * Showcase CRUD service — localStorage əsaslı
 */
export const showcaseService = {
    getAll() {
        return DB.get('showcases');
    },
    getByProject(projectId) {
        return DB.get('showcases')
            .filter(s => s.projectId === projectId)
            .sort((a, b) => b.createdAt - a.createdAt);
    },
    add(data) {
        const showcase = { ...data, id: uid(), createdAt: Date.now() };
        const all = DB.get('showcases');
        all.push(showcase);
        DB.set('showcases', all);
        return showcase;
    },
    remove(showcaseId) {
        const all = DB.get('showcases').filter(s => s.id !== showcaseId);
        DB.set('showcases', all);
        return true;
    },
    isParticipant(userId, project) {
        if (!userId || !project) return false;
        if (project.authorId === userId) return true;
        const applicants = project.applicants || [];
        return applicants.some(a =>
            typeof a === 'object' && a !== null && a.id === userId && a.status === 'accepted'
        );
    },
    isValidUrl,
    isValidFileSize,
};
