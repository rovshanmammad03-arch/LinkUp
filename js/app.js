// DB and API are defined in js/api.js
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }

var GRADIENTS = [
    'from-brand-500 to-purple-500','from-cyan-500 to-green-500',
    'from-amber-500 to-rose-500','from-pink-500 to-brand-500',
    'from-green-500 to-cyan-500','from-purple-500 to-pink-500',
    'from-teal-500 to-brand-500','from-rose-500 to-amber-500',
    'from-brand-600 to-cyan-500'
];
function initials(n) { return n.split(' ').map(function(w){return w[0]}).join('').slice(0,2).toUpperCase() }

// ====================== SEED ======================
function seedIfEmpty() {
    if (DB.get('users').length > 0) return;
    DB.set('users',[
        {id:'seed_1',name:'Leyla Məmmədova',email:'leyla@test.com',pass:'12345678',university:'ADNSU',field:'Dizayn',level:'Qabaqcıl',bio:'Product Designer at Google. Figma enthusiast.',grad:'from-pink-500 to-rose-500',skills:[{n:'Figma',l:'Qabaqcıl'},{n:'UI/UX',l:'Qabaqcıl'},{n:'Prototyping',l:'Orta'}],links:[{t:'Portfolio',v:'behance.net/leyla'},{t:'LinkedIn',v:'linkedin.com/in/leyla'}],views:120,followers:['seed_0','seed_2'],following:['seed_0']},
        {id:'seed_0',name:'Ayxan Quliyev',email:'ayxan@test.com',pass:'12345678',university:'UNEC',field:'Proqramlaşdırma',level:'Orta',bio:'Full-stack developer student. Love React and Node.js.',grad:'from-brand-500 to-brand-600',skills:[{n:'React',l:'Orta'},{n:'JavaScript',l:'Orta'},{n:'CSS',l:'Qabaqcıl'}],links:[{t:'GitHub',v:'github.com/ayxan'},{t:'Twitter',v:'twitter.com/ayxan'}],views:85,followers:['seed_1'],following:['seed_1','seed_2']},
        {id:'seed_2',name:'Rəşad Əliyev',email:'reshad@test.com',pass:'12345678',university:'BMU',field:'Proqramlaşdırma',level:'Qabaqcıl',bio:'Data Scientist. Python and ML expert.',grad:'from-blue-500 to-indigo-600',skills:[{n:'Python',l:'Qabaqcıl'},{n:'TensorFlow',l:'Orta'},{n:'SQL',l:'Qabaqcıl'}],links:[{t:'Kaggle',v:'kaggle.com/reshad'}],views:210,followers:['seed_0'],following:['seed_1']},
        {id:'seed_3',name:'Nigar Hüseynova',email:'nigar@test.com',pass:'12345678',university:'ADA',field:'Marketinq',level:'Orta',bio:'Digital marketing specialist. SEO and Social Media expert.',grad:'from-orange-400 to-red-500',skills:[{n:'SEO',l:'Orta'},{n:'Google Ads',l:'Qabaqcıl'}],links:[],views:45,followers:[],following:[]},
        {id:'seed_4',name:'Emin Bağırov',email:'emin@test.com',pass:'12345678',university:'ADNSU',field:'Proqramlaşdırma',level:'Başlanğıc',bio:'Junior dev learning the ropes. Java and Spring.',grad:'from-green-500 to-teal-500',skills:[{n:'Java',l:'Başlanğıc'},{n:'Spring',l:'Başlanğıc'}],links:[],views:32,followers:[],following:[]},
        {id:'seed_5',name:'Səbinə Rəhimova',email:'sabina@test.com',pass:'12345678',university:'ADRA',field:'Dizayn',level:'Orta',bio:'Graphic designer. Illustrator and Photoshop geek.',grad:'from-purple-500 to-indigo-500',skills:[{n:'Illustrator',l:'Qabaqcıl'},{n:'Photoshop',l:'Qabaqcıl'}],links:[],views:78,followers:[],following:[]},
        {id:'seed_6',name:'Murad Vəliyev',email:'murad@test.com',pass:'12345678',university:'BANM',field:'Proqramlaşdırma',level:'Qabaqcıl',bio:'Cybersecurity expert and software architect.',grad:'from-neutral-700 to-neutral-900',skills:[{n:'C++',l:'Qabaqcıl'},{n:'Cybersecurity',l:'Qabaqcıl'}],links:[],views:145,followers:[],following:[]},
        {id:'seed_7',name:'Aydan Məmmədova',email:'aydan@test.com',pass:'12345678',university:'ADNSU',field:'Dizayn',level:'Orta',bio:'Interior designer. Focus on minimalist projects.',grad:'from-amber-400 to-orange-500',skills:[{n:'AutoCAD',l:'Orta'},{n:'3ds Max',l:'Orta'}],links:[],views:62,followers:[],following:[]}
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
        {id:'post6',authorId:'seed_3',image:'',caption:'Google Ads ilə kampaniya idarə etdim. CPC 0.30 AZN-ə saldım, conversion rate 4.2% oldu. Screenshots aşağıda.',type:'other',likes:['seed_5','seed_7'],comments:[],createdAt:Date.now()-600000}
    ]);
    DB.set('notifications',[]);
}

// ====================== STATE ======================
var currentUser = null;
var currentRoute = '';
window._viewUser = null;
window._chatUser = null;
var _editSkills = [];
var _editLinks = [];
var _discoverView = 'grid'; // grid or list
var _discoverTab = 'people'; // people or projects
var _typingTimeout = null;
var _replyingToCommentId = null;
var _replyingToCommentName = null;
var _profileTab = 'posts'; // posts or liked
var _dashboardTab = 'all'; // all or following

// ====================== AUTH ======================
function auth() {
    if (!API._token) { currentUser = null; return false }
    if (!currentUser) return false
    return true
}
function refreshUser() {
    API.getMe().then(function(r){ if(r.data) currentUser = normalizeUser(r.data) })
}

// Map server field names to frontend field names
function normalizeUser(u) {
    if (!u) return null
    return {
        id: u.id,
        name: u.name,
        email: u.email,
        university: u.university || '',
        field: u.field || '',
        level: u.level || 'Başlanğıc',
        bio: u.bio || '',
        avatar: u.avatar || '',
        grad: u.grad || 'from-brand-500 to-purple-500',
        skills: u.skills || [],
        links: u.links || [],
        views: u.views || 0,
        followers: u.followers || [],
        following: u.following || [],
        onboardingDone: u.onboarding_done || false,
        createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now()
    }
}
function normalizePost(p) {
    if (!p) return null
    return {
        id: p.id,
        authorId: p.author_id,
        caption: p.caption,
        type: p.type || 'other',
        image: p.image || '',
        likes: p.likes || [],
        comments: (p.comments || []).map(function(c){ return { id:c.id, userId:c.user_id, text:c.text, ts:c.ts, parentId:c.parent_id||null } }),
        createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now()
    }
}
function normalizeProject(p) {
    if (!p) return null
    return {
        id: p.id,
        title: p.title,
        desc: p.desc,
        authorId: p.author_id,
        skills: p.skills || [],
        team: p.team || '',
        status: p.status || 'active',
        applicants: (p.applicants || []).map(function(a){ return { userId:a.user_id, msg:a.msg, ts:a.ts } }),
        grad: p.grad || 'from-brand-500 to-purple-500',
        createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now()
    }
}
function normalizeMessage(m) {
    if (!m) return null
    return { id:m.id, from:m.from_id, to:m.to_id, text:m.text, read:m.read, ts: new Date(m.created_at).getTime() }
}
function normalizeNotif(n) {
    if (!n) return null
    return { id:n.id, userId:n.user_id, type:n.type, text:n.text, fromId:n.from_id, read:n.read, projectId:n.project_id, connId:n.conn_id, ts: new Date(n.created_at).getTime() }
}

async function doRegister(e) {
    e.preventDefault()
    var f = new FormData(e.target)
    var name = f.get('name').trim() + ' ' + f.get('surname').trim()
    var r = await API.register({
        email: f.get('email').trim(),
        password: f.get('password'),
        name: name,
        university: f.get('university'),
        field: f.get('field') || '',
        level: f.get('level') || 'Başlanğıc'
    })
    if (r.error) { toast(r.error, 'error'); return }
    API.setToken(r.data.token)
    currentUser = normalizeUser(r.data.user)
    toast('🎉 Qeydiyyat uğurla tamamlandı!', 'success')
    showOnboarding()
}

async function doLogin(e) {
    e.preventDefault()
    var f = new FormData(e.target)
    var r = await API.login({ email: f.get('email').trim(), password: f.get('password') })
    if (r.error) { toast('E-poçt və ya şifrə yanlışdır!', 'error'); return }
    API.setToken(r.data.token)
    currentUser = normalizeUser(r.data.user)
    if (!currentUser.onboardingDone) { showOnboarding(); return }
    toast('👋 Xoş gəldin, ' + currentUser.name.split(' ')[0] + '!', 'success')
    navigate('dashboard')
}

function handleLogout() {
    API.setToken(null)
    currentUser = null
    toast('👋 Hesabdan çıxış edildi.', 'success')
    navigate('landing')
}

// ====================== ONBOARDING ======================
function showOnboarding(){
    document.getElementById('onboardingOverlay').classList.remove('hidden');
    renderOnboardingStep(0);
}
function hideOnboarding(){
    document.getElementById('onboardingOverlay').classList.add('hidden');
    API.updateMe({ onboarding_done: true }).then(function(r){
        if (r.data) currentUser = normalizeUser(r.data);
        else { currentUser.onboardingDone = true; }
        toast('🎉 Profilin hazırdır! Dashboard-a keçid edilir.','success');
        navigate('dashboard');
    });
}
function renderOnboardingStep(step){
    var c=document.getElementById('onboardingContent');
    var steps=3;
    var dots='<div class="flex items-center justify-center gap-2 mb-8">';
    for(var i=0;i<steps;i++){dots+='<div class="step-dot'+(i===step?' active':'')+(i<step?' done':'')+'"></div>'}
    dots+='</div>';
    if(step===0){
        c.innerHTML='<div class="anim-up text-center">'+dots+
            '<div class="w-20 h-20 rounded-full bg-gradient-to-br '+currentUser.grad+' flex items-center justify-center text-2xl font-semibold mx-auto mb-6 avatar-upload" onclick="uploadOnboardAvatar()">'+
            (currentUser.avatar?'<img src="'+currentUser.avatar+'" class="w-full h-full object-cover rounded-full">':'<span id="obAvatarText">'+initials(currentUser.name)+'</span>')+
            '<div class="avatar-overlay rounded-full"><iconify-icon icon="mdi:camera" class="text-white text-xl"></iconify-icon></div></div>'+
            '<h2 class="text-xl font-semibold mb-2">Profil şəklini yüklə</h2><p class="text-sm text-neutral-400 font-light mb-6">Opsional — sonra da dəyişə bilərsən</p>'+
            '<div class="text-left space-y-4"><div><label class="text-xs text-neutral-400 mb-1 block">Bio</label><textarea id="obBio" class="input-field" rows="3" placeholder="Özünüz haqqında qısa məlumat yazın...">'+(currentUser.bio||'')+'</textarea></div></div>'+
            '<button onclick="saveOnboardStep(0)" class="btn-primary w-full text-center mt-6">Davam Et →</button></div>';
    } else if(step===1){
        var existingSkills=(currentUser.skills||[]).map(function(sk,i){
            return '<span class="skill-tag tag-removable" onclick="removeObSkill('+i+')">'+sk.n+' · '+sk.l+' ✕</span>';
        }).join('');
        var popularSkills=['Python','JavaScript','React','Figma','UI/UX','Node.js','SMM','SEO','TensorFlow','Photoshop','Django','Flutter'];
        var suggestions=popularSkills.filter(function(s){return !(currentUser.skills||[]).some(function(sk){return sk.n===s})}).slice(0,8).map(function(s){
            return '<button onclick="addObSkill(\''+s+'\')" class="skill-tag hover:bg-brand-500/10 hover:text-brand-400 hover:border-brand-500/30 cursor-pointer">+ '+s+'</button>';
        }).join('');
        c.innerHTML='<div class="anim-up text-center">'+dots+
            '<div class="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xl mx-auto mb-4">🛠️</div>'+
            '<h2 class="text-xl font-semibold mb-2">Bacarıqlarını əlavə et</h2><p class="text-sm text-neutral-400 font-light mb-6">Digərlərin səni tapa bilməsi üçün vacibdir</p>'+
            '<div id="obSkillTags" class="flex flex-wrap gap-2 mb-3 min-h-[32px]">'+existingSkills+'</div>'+
            '<div class="flex gap-2 mb-3"><input id="obSkillName" class="input-field flex-1" placeholder="Bacarıq adı"><select id="obSkillLvl" class="input-field w-28"><option>Başlanğıc</option><option>Orta</option><option>Qabaqcıl</option></select><button type="button" onclick="addObSkillCustom()" class="btn-secondary btn-xs px-3">+</button></div>'+
            '<div class="text-left"><p class="text-[10px] text-neutral-600 mb-2 uppercase tracking-wider">Təklif olunan</p><div class="flex flex-wrap gap-1.5">'+suggestions+'</div></div>'+
            '<button onclick="saveOnboardStep(1)" class="btn-primary w-full text-center mt-6">Davam Et →</button></div>';
    } else {
        c.innerHTML='<div class="anim-up text-center">'+dots+
            '<div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center text-2xl mx-auto mb-4">🚀</div>'+
            '<h2 class="text-xl font-semibold mb-2">Hazırsan!</h2><p class="text-sm text-neutral-400 font-light mb-2">Profilin tamamlandı. İndi bacarıqlı insanları tapa bilərsən.</p>'+
            '<div class="glass-card rounded-xl p-4 text-left mb-6"><div class="flex items-center gap-3"><iconify-icon icon="mdi:check-circle" class="text-green-400 text-xl"></iconify-icon><div><div class="text-sm font-medium">Profil tamamlanıb</div><div class="text-[11px] text-neutral-500">Bio, bacarıqlar əlavə edilib</div></div></div></div>'+
            '<button onclick="hideOnboarding()" class="btn-secondary w-full text-center flex items-center justify-center gap-2"><iconify-icon icon="mdi:rocket-launch-outline"></iconify-icon>Platformaya Başla</button></div>';
    }
}
var _obSkills=[];
function removeObSkill(i){_obSkills.splice(i,1);renderOnboardingStep(1)}
function addObSkill(name){
    if(_obSkills.some(function(s){return s.n===name}))return;
    _obSkills.push({n:name,l:'Orta'});renderOnboardingStep(1);
}
function addObSkillCustom(){
    var n=document.getElementById('obSkillName').value.trim();if(!n)return;
    if(_obSkills.some(function(s){return s.n.toLowerCase()===n.toLowerCase()})){toast('Bu bacarıq artıq əlavə edilib','info');return}
    _obSkills.push({n:n,l:document.getElementById('obSkillLvl').value});renderOnboardingStep(1);
}
function uploadOnboardAvatar(){
    var inp=document.createElement('input');inp.type='file';inp.accept='image/*';
    inp.onchange=function(e){
        var file=e.target.files[0];if(!file)return;
        var reader=new FileReader();reader.onload=function(ev){
            currentUser.avatar=ev.target.result;renderOnboardingStep(0);
        };reader.readAsDataURL(file);
    };inp.click();
}
function saveOnboardStep(step){
    if(step===0){
        var bio=document.getElementById('obBio').value.trim();
        API.updateMe({ bio: bio, avatar: currentUser.avatar }).then(function(r){
            if (r.data) currentUser = normalizeUser(r.data);
            else { currentUser.bio = bio; }
            _obSkills=[...(currentUser.skills||[])];renderOnboardingStep(1);
        });
    } else if(step===1){
        API.updateMe({ skills: _obSkills.slice() }).then(function(r){
            if (r.data) currentUser = normalizeUser(r.data);
            else { currentUser.skills = _obSkills.slice(); }
            renderOnboardingStep(2);
        });
    }
}

// ====================== HELPERS ======================
function toast(msg,type){
    var c=document.getElementById('toastBox'),t=document.createElement('div');
    t.className='toast'+(type?' '+type:'');t.innerHTML=msg;c.appendChild(t);
    setTimeout(function(){t.style.opacity='0';t.style.transform='translateY(10px)';t.style.transition='all 0.3s';setTimeout(function(){t.remove()},300)},3500);
}
function openModal(html){document.getElementById('modalBox').innerHTML=html;document.getElementById('modalBg').classList.add('active');document.body.style.overflow='hidden'}
function closeModal(){document.getElementById('modalBg').classList.remove('active');document.body.style.overflow=''}
function lvlBadge(l){
    var c={'Qabaqcıl':'bg-green-500/10 text-green-400 border-green-500/20','Orta':'bg-brand-500/10 text-brand-400 border-brand-500/20','Başlanğıc':'bg-amber-500/10 text-amber-400 border-amber-500/20'};
    return '<span class="text-[10px] font-medium px-2 py-0.5 rounded-full border '+(c[l]||c['Başlanğıc'])+'">'+l+'</span>';
}
function timeAgo(ts){var d=Date.now()-ts,m=Math.floor(d/60000),h=Math.floor(d/3600000),dy=Math.floor(d/86400000);if(m<1)return'İndi';if(m<60)return m+' dəq';if(h<24)return h+' saat';return dy+' gün'}
function getUser(id){return DB.get('users').find(function(u){return u.id===id})}
function scrollToSection(id){var el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'})}
function profileCompletion(u){
    var score=0,total=5;
    if(u.avatar)score++;if(u.bio&&u.bio.length>10)score++;if(u.skills&&u.skills.length>=2)score++;if(u.field)score++;if(u.links&&u.links.length>=1)score++;
    return Math.round(score/total*100);
}
function completionBar(pct){
    var color=pct>=80?'from-green-500 to-emerald-400':pct>=50?'from-brand-500 to-purple-400':'from-amber-500 to-orange-400';
    return '<div class="progress-bar"><div class="progress-fill bg-gradient-to-r '+color+'" style="width:'+pct+'%"></div></div><span class="text-[10px] text-neutral-500 mt-1 block">'+pct+'% tamamlandı</span>';
}
function avatarHtml(u,size){
    var cls=size==='lg'?'w-20 h-20 text-2xl':size==='md'?'w-11 h-11 text-sm':'w-8 h-8 text-xs';
    if(u.avatar)return '<div class="'+cls+' rounded-full overflow-hidden shrink-0"><img src="'+u.avatar+'" class="w-full h-full object-cover"></div>';
    return '<div class="'+cls+' rounded-full bg-gradient-to-br '+u.grad+' flex items-center justify-center font-semibold shrink-0">'+initials(u.name)+'</div>';
}
function updateDots(){
    if(!currentUser)return;
    var msgs=_cache.messages.filter(function(m){return m.to===currentUser.id&&!m.read});
    var notifs=_cache.notifications.filter(function(n){return n.userId===currentUser.id&&!n.read});
    document.getElementById('msgDot').classList.toggle('hidden',msgs.length===0);
    document.getElementById('notifDot').classList.toggle('hidden',notifs.length===0);
}
function updateNav(route){
    document.querySelectorAll('[data-nav]').forEach(function(a){a.classList.toggle('active',a.dataset.nav===route)});
    document.querySelectorAll('[data-mnav]').forEach(function(a){a.classList.toggle('text-brand-400',a.dataset.mnav===route);a.classList.toggle('text-neutral-500',a.dataset.mnav!==route)});
    if(currentUser){document.getElementById('navAvatar').innerHTML=avatarHtml(currentUser,'sm');document.getElementById('navName').textContent=currentUser.name.split(' ')[0]}
}
function toggleNotifDrop(){
    var d=document.getElementById('notifDrop');d.classList.toggle('hidden');
    if(!d.classList.contains('hidden'))renderNotifDrop();
}
function renderNotifDrop(){
    var notifs=DB.get('notifications').filter(function(n){return n.userId===currentUser.id}).sort(function(a,b){return b.ts-a.ts}).slice(0,5);
    var list=document.getElementById('notifDropList');
    if(!notifs.length){list.innerHTML='<div class="p-6 text-center text-xs text-neutral-600">'+t('noNotif')+'</div>';return}
    list.innerHTML=notifs.map(function(n){
        var icon='mdi:bell',color='text-neutral-400';
        if(n.type==='connection'){icon='mdi:account-plus-outline';color='text-brand-400'}
        if(n.type==='message'){icon='mdi:message-outline';color='text-cyan-400'}
        if(n.type==='project_apply'){icon='mdi:folder-star-outline';color='text-amber-400'}
        if(n.type==='project_accepted'||n.type==='connection_accepted'){icon='mdi:check-circle-outline';color='text-green-400'}
        return '<div class="px-3 py-2.5 border-b border-white/[.03] flex items-start gap-2.5 hover:bg-white/[.02] transition-colors cursor-pointer'+(n.read?' opacity-50':'')+'" onclick="navigate(\'notifications\');toggleNotifDrop()">'+
            '<iconify-icon icon="'+icon+'" class="'+color+' text-sm mt-0.5 shrink-0"></iconify-icon>'+
            '<div class="min-w-0"><p class="text-[11px] text-neutral-300 leading-relaxed line-clamp-2" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+n.text+'</p><span class="text-[9px] text-neutral-600">'+timeAgo(n.ts)+'</span></div>'+
            (n.read?'':'<span class="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5"></span>')+
            '</div>';
    }).join('');
}

// ====================== ROUTER ======================
var _navHistory = [];
// Cache for API data
var _cache = { users:[], posts:[], projects:[], messages:[], notifications:[] }

async function loadData() {
    var [users, posts, projects, messages, notifs] = await Promise.all([
        API.getUsers(), API.getPosts(), API.getProjects(), API.getMessages(), API.getNotifs()
    ])
    if (users.data)   _cache.users        = users.data.map(normalizeUser)
    if (posts.data)   _cache.posts        = posts.data.map(normalizePost)
    if (projects.data)_cache.projects     = projects.data.map(normalizeProject)
    if (messages.data)_cache.messages     = messages.data.map(normalizeMessage)
    if (notifs.data)  _cache.notifications= notifs.data.map(normalizeNotif)
}

// Replace DB calls with cache
function getUser(id) {
    if (currentUser && currentUser.id === id) return currentUser
    return _cache.users.find(function(u){ return u.id === id })
}

function navigate(route, addToHistory){
    if(addToHistory !== false && currentRoute && currentRoute !== route) {
        _navHistory.push({route: currentRoute, viewUser: window._viewUser, chatUser: window._chatUser});
    }
    updateBackBtn();
    currentRoute=route;
    var isAuth = API._token && currentUser;
    var gn=document.getElementById('guestNav'),an=document.getElementById('appNav'),lp=document.getElementById('landingPage'),ac=document.getElementById('appContainer'),mn=document.getElementById('mobileNav');
    document.getElementById('notifDrop').classList.add('hidden');
    var sd=document.getElementById('settingsDrop');if(sd)sd.classList.add('hidden');
    if(route==='login'||route==='register'){
        if(isAuth){navigate('dashboard');return}
        gn.classList.remove('hidden');an.classList.add('hidden');lp.classList.add('hidden');ac.classList.remove('hidden');mn.classList.add('hidden');
        document.getElementById('appMain').innerHTML='<div class="page-enter">'+(route==='login'?renderLoginPage():renderRegisterPage())+'</div>';
        window.scrollTo(0,0);return;
    }
    if(!isAuth){gn.classList.remove('hidden');an.classList.add('hidden');lp.classList.remove('hidden');ac.classList.add('hidden');mn.classList.add('hidden');window.scrollTo(0,0);return}
    gn.classList.add('hidden');an.classList.remove('hidden');lp.classList.add('hidden');ac.classList.remove('hidden');mn.classList.remove('hidden');
    if(route==='landing'||route==='login'||route==='register')route='dashboard';
    updateNav(route);
    var main=document.getElementById('appMain');window.scrollTo(0,0);
    // Show skeleton while loading
    main.innerHTML='<div class="page-enter"><div class="grid md:grid-cols-2 gap-5">'+skeletonCards(4)+'</div></div>';
    loadData().then(function(){
        switch(route){
            case 'dashboard':main.innerHTML='<div class="page-enter">'+renderDashboard()+'</div>';break;
            case 'discover':main.innerHTML='<div class="page-enter" id="discoverWrapper">'+renderDiscover()+'</div>';if(_discoverTab==='people')initDiscover();break;
            case 'messages':main.innerHTML='<div class="page-enter">'+renderMessages()+'</div>';break;
            case 'chat':main.innerHTML='<div class="page-enter">'+renderChat()+'</div>';break;
            case 'notifications':main.innerHTML='<div class="page-enter">'+renderNotifications()+'</div>';break;
            case 'profile':main.innerHTML='<div class="page-enter">'+renderProfile()+'</div>';initProfileEdit();break;
            case 'user':main.innerHTML='<div class="page-enter">'+renderUserProfile()+'</div>';break;
            default:main.innerHTML='<div class="page-enter">'+renderDashboard()+'</div>';
        }
        updateDots();
        applyLang();
        updateBackBtn();
    });
}

function goBack(){
    if(!_navHistory.length) return;
    var prev = _navHistory.pop();
    window._viewUser = prev.viewUser || window._viewUser;
    window._chatUser = prev.chatUser || window._chatUser;
    navigate(prev.route, false);
}

function updateBackBtn(){
    var btn = document.getElementById('globalBackBtn');
    if(!btn) return;
    var mainRoutes = ['dashboard','discover','messages','profile','notifications'];
    var show = _navHistory.length > 0 && mainRoutes.indexOf(currentRoute) === -1;
    btn.classList.toggle('hidden', !show);
}

// ====================== SKELETON ======================
function skeletonCards(n){
    var s='';for(var i=0;i<n;i++){s+='<div class="glass-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-4"><div class="skeleton w-11 h-11 rounded-full shrink-0"></div><div class="flex-1"><div class="skeleton h-4 w-24 mb-2 rounded"></div><div class="skeleton h-3 w-36 rounded"></div></div></div><div class="skeleton h-3 w-full mb-2 rounded"></div><div class="skeleton h-3 w-3/4 mb-4 rounded"></div><div class="flex gap-2"><div class="skeleton h-6 w-16 rounded"></div><div class="skeleton h-6 w-20 rounded"></div><div class="skeleton h-6 w-14 rounded"></div></div><div class="flex gap-2 mt-4"><div class="skeleton h-8 flex-1 rounded-lg"></div><div class="skeleton h-8 w-8 rounded-lg"></div></div></div>'}
    return s;
}

// ====================== DASHBOARD ======================
// ====================== DASHBOARD ======================
var POST_COLORS = [
    'from-brand-600 via-purple-600 to-pink-500',
    'from-cyan-600 via-blue-600 to-brand-600',
    'from-amber-500 via-orange-500 to-rose-500',
    'from-green-600 via-teal-600 to-cyan-500',
    'from-rose-500 via-pink-500 to-purple-500',
    'from-indigo-600 via-brand-600 to-cyan-500'
];
var POST_ICONS = {
    design: 'mdi:palette-outline',
    code: 'mdi:code-braces',
    project: 'mdi:rocket-launch-outline',
    other: 'mdi:star-four-points-outline'
};
var POST_LABELS = {
    design: function(){ return '<span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">'+t('design')+'</span>' },
    code: function(){ return '<span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">'+t('code')+'</span>' },
    project: function(){ return '<span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">'+t('project')+'</span>' },
    other: function(){ return '<span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">'+t('other')+'</span>' }
};

function renderDashboard(){
    refreshUser();
    var pct = profileCompletion(currentUser);
    var conns = 0;
    var unreadMsgs = _cache.messages.filter(function(m){return m.to===currentUser.id&&!m.read}).length;
    var posts = _cache.posts.slice().sort(function(a,b){return b.createdAt - a.createdAt});

    return (pct < 100 ? '<div class="glass-card rounded-2xl p-4 mb-6 anim-up flex items-center gap-4" style="animation-delay:.05s"><div class="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0"><iconify-icon icon="mdi:progress-check" class="text-brand-400 text-lg"></iconify-icon></div><div class="flex-1 min-w-0"><div class="flex items-center justify-between mb-1.5"><span class="text-sm font-medium">'+t('profileCompletion')+'</span><span class="text-xs text-neutral-400">'+pct+'%</span></div><div class="progress-bar"><div class="progress-fill '+(pct>=80?'bg-gradient-to-r from-green-500 to-emerald-400':pct>=50?'bg-gradient-to-r from-brand-500 to-purple-400':'bg-gradient-to-r from-amber-500 to-orange-400')+'" style="width:'+pct+'%"></div></div></div><button onclick="navigate(\'profile\')" class="btn-outline btn-xs shrink-0">'+t('edit')+'</button></div>' : '') +
    '<div class="max-w-2xl mx-auto space-y-5">' + posts.map(function(p,i){ return renderPostCard(p,i) }).join('') + '</div>' +
    '<div id="feedEnd" class="text-center py-8"><span class="text-xs text-neutral-600">'+t('allSeen')+'</span></div>';
}

function renderPostCard(p, i){
    var author = getUser(p.authorId);
    if(!author) return '';
    var isLiked = p.likes && p.likes.indexOf(currentUser.id) !== -1;
    var likeCount = (p.likes || []).length;
    var commentCount = (p.comments || []).length;
    var colorIdx = Math.abs(p.authorId.charCodeAt(p.authorId.length-1)) % POST_COLORS.length;
    var placeholderGrad = POST_COLORS[colorIdx];
    var postIcon = POST_ICONS[p.type] || POST_ICONS.other;
    var postLabel = (POST_LABELS[p.type] || POST_LABELS.other)();

    // Şəkil bölməsi
    var imageSection = '';
    if(p.image){
        imageSection = '<div class="relative"><img src="'+p.image+'" class="w-full rounded-xl object-cover" style="max-height:400px" alt="Post image"><div class="absolute bottom-2 right-2">'+postLabel+'</div></div>';
    } else {
        imageSection = '<div class="w-full h-48 rounded-xl bg-gradient-to-br '+placeholderGrad+' flex flex-col items-center justify-center gap-2 relative"><iconify-icon icon="'+postIcon+'" class="text-4xl text-white/30"></iconify-icon><span class="text-xs text-white/20 font-medium">'+(p.type==='design'?t('designPlaceholder'):p.type==='code'?t('codePlaceholder'):p.type==='project'?t('projectPlaceholder'):t('otherPlaceholder'))+'</span><div class="absolute bottom-2 right-2">'+postLabel+'</div></div>';
    }

    var seeCommentsHtml = '';
    if(p.comments && p.comments.length > 0){
        seeCommentsHtml = '<div class="px-4 pb-3"><button onclick="openCommentsModal(\''+p.id+'\')" class="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">'+t('comments')+'</button></div>';
    }

    return '<div class="glass-card rounded-2xl overflow-hidden anim-up" style="animation-delay:'+(i*0.08)+'s" id="post-'+p.id+'">' +
        // Header
        '<div class="p-4 pb-3 flex items-center gap-3">' +
            '<div class="cursor-pointer" onclick="window._viewUser=\''+author.id+'\';navigate(\'user\')">' + avatarHtml(author,'sm') + '</div>' +
            '<div class="flex-1 min-w-0 cursor-pointer" onclick="window._viewUser=\''+author.id+'\';navigate(\'user\')">' +
                '<div class="text-sm font-medium truncate">'+author.name+'</div>' +
                '<div class="text-[10px] text-neutral-500">'+author.field+' · '+timeAgo(p.createdAt)+'</div>' +
            '</div>' +
            (p.authorId === currentUser.id ? 
                '<div class="relative">' +
                    '<button onclick="toggleMoreMenu(event, \''+p.id+'\')" class="text-neutral-500 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all"><iconify-icon icon="mdi:dots-vertical" class="text-xl"></iconify-icon></button>' +
                    '<div id="menu-'+p.id+'" class="more-menu hidden">' +
                        '<button onclick="openEditPost(\''+p.id+'\')" class="more-item"><iconify-icon icon="mdi:pencil-outline"></iconify-icon>Redaktə Et</button>' +
                        '<button onclick="deletePost(\''+p.id+'\')" class="more-item delete"><iconify-icon icon="mdi:delete-outline"></iconify-icon>Sil</button>' +
                    '</div>' +
                '</div>' : '') +
        '</div>' +
        // Image / Placeholder
        '<div class="px-4 pb-3">' + imageSection + '</div>' +
        // Actions
        '<div class="px-4 pb-2 flex items-center gap-4">' +
            '<button onclick="toggleLike(\''+p.id+'\')" class="flex items-center gap-1.5 group transition-colors '+(isLiked?'text-rose-400':'text-neutral-500')+' hover:text-rose-400">' +
                '<iconify-icon icon="'+(isLiked?'mdi:heart':'mdi:heart-outline')+'" class="text-lg transition-transform '+(isLiked?'scale-110':'')+' group-hover:scale-110"></iconify-icon>' +
                '<span class="text-xs">'+likeCount+'</span>' +
            '</button>' +
            '<button onclick="openCommentsModal(\''+p.id+'\')" class="flex items-center gap-1.5 text-neutral-500 hover:text-brand-400 transition-colors group">' +
                '<iconify-icon icon="mdi:comment-outline" class="text-lg group-hover:scale-110 transition-transform"></iconify-icon>' +
                '<span class="text-xs">'+commentCount+'</span>' +
            '</button>' +
            '<button onclick="sharePost(\''+p.id+'\')" class="flex items-center gap-1.5 text-neutral-500 hover:text-green-400 transition-colors group">' +
                '<iconify-icon icon="mdi:share-outline" class="text-lg group-hover:scale-110 transition-transform"></iconify-icon>' +
            '</button>' +
        '</div>' +
        // Caption
        '<div class="px-4 pb-2"><p class="text-[13px] text-neutral-300 font-light leading-relaxed"><span class="font-medium text-sm text-white mr-2 cursor-pointer hover:underline" onclick="window._viewUser=\''+author.id+'\';navigate(\'user\')">'+author.name+'</span>'+p.caption+'</p></div>' +
        // See All Comments Link
        seeCommentsHtml +
    '</div>';
}

// ====================== POST ACTIONS ======================
function toggleLike(postId){
    API.likePost(postId).then(function(r){
        if(r.error){toast(r.error,'error');return}
        var p = normalizePost(r.data)
        var idx = _cache.posts.findIndex(function(x){return x.id===postId})
        if(idx!==-1) _cache.posts[idx] = p
        var el = document.getElementById('post-'+postId);
        if(el){ var tmp=document.createElement('div');tmp.innerHTML=renderPostCard(p,0);el.replaceWith(tmp.firstElementChild) }
        updateDots();
    })
}

function openCommentsModal(postId) {
    var p = _cache.posts.find(function(x){return x.id===postId});
    if(!p) return;
    
    var commentsList = '';
    if(p.comments && p.comments.length){
        var roots = p.comments.filter(function(c){return !c.parentId});
        var replies = p.comments.filter(function(c){return c.parentId});
        
        commentsList = '<div class="space-y-6">' + roots.map(function(c){
            var cu = getUser(c.userId);
            var safeName = cu ? cu.name.replace(/'/g, "\\'") : '';
            var isMyComment = c.userId === currentUser.id;
            
            var actionsHtml = '<div class="flex items-center gap-3 mt-1"><button onclick="replyToComment(\''+p.id+'\', \''+c.id+'\', \''+safeName+'\')" class="text-[11px] text-neutral-500 hover:text-brand-400 font-medium transition-colors">'+t('reply')+'</button>' + (isMyComment ? '<button onclick="deleteComment(\''+p.id+'\', \''+c.id+'\')" class="text-[11px] text-neutral-500 hover:text-red-400 transition-colors">'+t('delete')+'</button>' : '') + '</div>';
            
            var childReplies = replies.filter(function(r){return r.parentId === c.id});
            var repliesHtml = '';
            if(childReplies.length > 0) {
                var repliesList = childReplies.map(function(r){
                    var rcu = getUser(r.userId);
                    var rName = rcu ? rcu.name : 'Naməlum';
                    var rSafeName = rcu ? rcu.name.replace(/'/g, "\\'") : '';
                    var isMyReply = r.userId === currentUser.id;
                    return '<div class="reply-item flex gap-3">' +
                        '<div class="cursor-pointer" onclick="closeModal();window._viewUser=\''+(rcu?rcu.id:'')+'\';navigate(\'user\')"><div class="w-6 h-6 rounded-full bg-gradient-to-br '+(rcu?rcu.grad:'from-neutral-500 to-neutral-600')+' flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">'+(rcu?initials(rcu.name):'??')+'</div></div>' +
                        '<div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-0.5"><span class="text-[12px] font-medium cursor-pointer hover:text-brand-400 transition-colors" onclick="closeModal();window._viewUser=\''+(rcu?rcu.id:'')+'\';navigate(\'user\')">'+rName+'</span> <span class="text-[9px] text-neutral-500">'+timeAgo(r.ts)+'</span></div><div class="text-[12px] text-neutral-300 font-light leading-relaxed break-words">'+r.text+'</div>' +
                        '<div class="flex items-center gap-3 mt-1"><button onclick="replyToComment(\''+p.id+'\', \''+c.id+'\', \''+rSafeName+'\')" class="text-[10px] text-neutral-500 hover:text-brand-400 transition-colors">'+t('reply')+'</button>' + (isMyReply ? '<button onclick="deleteComment(\''+p.id+'\', \''+r.id+'\')" class="text-[10px] text-neutral-500 hover:text-red-400 transition-colors">'+t('delete')+'</button>' : '') + '</div>' + 
                        '</div></div>';
                }).join('');
                
                repliesHtml = '<div id="toggle-btn-'+c.id+'" class="reply-toggle-btn" onclick="toggleReplies(\''+c.id+'\')"><div class="line"></div><span>' + childReplies.length + ' '+t('seeReplies')+'</span><iconify-icon icon="mdi:chevron-down"></iconify-icon></div>' + 
                              '<div id="replies-'+c.id+'" class="replies-container hidden">' + repliesList + '</div>';
            }

            return '<div class="comment-item group"><div class="flex gap-3"><div class="cursor-pointer" onclick="closeModal();window._viewUser=\''+(cu?cu.id:'')+'\';navigate(\'user\')"><div class="w-8 h-8 rounded-full bg-gradient-to-br '+(cu?cu.grad:'from-neutral-500 to-neutral-600')+' flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 shadow-sm">'+(cu?initials(cu.name):'??')+'</div></div><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-0.5"><span class="text-sm font-medium cursor-pointer hover:text-brand-400 transition-colors" onclick="closeModal();window._viewUser=\''+(cu?cu.id:'')+'\';navigate(\'user\')">'+(cu?cu.name:'Naməlum')+'</span> <span class="text-[10px] text-neutral-500">'+timeAgo(c.ts)+'</span></div><div class="text-[13px] text-neutral-300 font-light leading-relaxed break-words">'+c.text+'</div>'+actionsHtml+'</div></div>' + repliesHtml + '</div>';
        }).join('') + '</div>';
    } else {
        commentsList = '<div class="text-center py-10 flex flex-col items-center justify-center h-full"><iconify-icon icon="mdi:comment-processing-outline" class="text-4xl text-neutral-700 mb-3"></iconify-icon><span class="text-neutral-500 text-sm">'+t('noComments')+'</span></div>';
    }

    var html = '<div class="flex flex-col h-full">' +
               '<div class="flex items-center justify-between mb-4 shrink-0"><h3 class="text-lg font-semibold flex items-center gap-2"><iconify-icon icon="mdi:comment-multiple-outline" class="text-brand-400"></iconify-icon>'+t('comments')+'</h3><button onclick="closeModal()" class="text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"><iconify-icon icon="mdi:close" class="text-xl"></iconify-icon></button></div>' +
               '<div id="modalCommentsList" class="overflow-y-auto mb-4 pr-1 max-h-[50vh] min-h-[150px]" style="scrollbar-width:thin;">' + commentsList + '</div>' +
               '<form onsubmit="addCommentInModal(event,\''+p.id+'\')" class="flex gap-2 pt-3 border-t border-white/5 shrink-0">' +
                    '<input type="text" id="modalCommentText-'+p.id+'" class="input-field flex-1 text-sm py-2 px-3 bg-white/[.03]" placeholder="'+t('commentPlaceholder')+'" autofocus>' +
                    '<button type="submit" class="btn-secondary btn-sm px-4 flex items-center justify-center"><iconify-icon icon="mdi:send" class="text-lg"></iconify-icon></button>' +
               '</form>' +
               '</div>';
    
    openModal(html);
    setTimeout(function(){
        var el = document.getElementById('modalCommentsList');
        if(el) el.scrollTop = el.scrollHeight;
    }, 50);
}

function replyToComment(postId, commentId, userName) {
    _replyingToCommentId = commentId;
    _replyingToCommentName = userName;
    
    var input = document.getElementById('modalCommentText-' + postId);
    if(input) {
        // Remove existing bar if any
        var oldBar = document.getElementById('replyContextBar');
        if(oldBar) oldBar.remove();
        
        var bar = document.createElement('div');
        bar.id = 'replyContextBar';
        bar.className = 'reply-context-bar';
        bar.innerHTML = '<span class="text-[10px] text-neutral-400 font-light truncate flex items-center gap-1"><iconify-icon icon="mdi:reply" class="text-brand-400"></iconify-icon> <span class="text-brand-400">@' + userName + '</span> '+t('replyingTo')+'</span><button onclick="cancelReply(\''+postId+'\')" class="text-neutral-500 hover:text-white"><iconify-icon icon="mdi:close"></iconify-icon></button>';
        
        input.parentElement.parentElement.insertBefore(bar, input.parentElement);
        input.focus();
    }
}

function deleteComment(postId, commentId) {
    API.deleteComment(postId, commentId).then(function(r){
        if(r.error){toast(r.error,'error');return}
        var p = normalizePost(r.data)
        var idx = _cache.posts.findIndex(function(x){return x.id===postId})
        if(idx!==-1) _cache.posts[idx] = p
        var el = document.getElementById('post-'+postId);
        if(el){var tmp=document.createElement('div');tmp.innerHTML=renderPostCard(p,0);el.replaceWith(tmp.firstElementChild)}
        openCommentsModal(postId);
    })
}

function toggleReplies(commentId) {
    var container = document.getElementById('replies-' + commentId);
    var btn = document.getElementById('toggle-btn-' + commentId);
    if(!container || !btn) return;
    
    var isHidden = container.classList.contains('hidden');
    if(isHidden) {
        container.classList.remove('hidden');
        btn.classList.add('active');
        btn.querySelector('span').innerText = t('hideReplies');
    } else {
        container.classList.add('hidden');
        btn.classList.remove('active');
        var count = container.children.length;
        btn.querySelector('span').innerText = count + ' '+t('seeReplies');
    }
}

function cancelReply(postId) {
    _replyingToCommentId = null;
    _replyingToCommentName = null;
    var bar = document.getElementById('replyContextBar');
    if(bar) bar.remove();
}

function addCommentInModal(e, postId){
    e.preventDefault();
    var input = document.getElementById('modalCommentText-'+postId);
    var text = input.value.trim();
    if(!text) return;
    API.addComment(postId, { text: text, parent_id: _replyingToCommentId }).then(function(r){
        if(r.error){toast(r.error,'error');return}
        var p = normalizePost(r.data)
        var idx = _cache.posts.findIndex(function(x){return x.id===postId})
        if(idx!==-1) _cache.posts[idx] = p
        _replyingToCommentId = null; _replyingToCommentName = null;
        var el = document.getElementById('post-'+postId);
        if(el){var tmp=document.createElement('div');tmp.innerHTML=renderPostCard(p,0);el.replaceWith(tmp.firstElementChild)}
        openCommentsModal(postId);
    })
}

function openEditPost(postId){
    var p = _cache.posts.find(function(x){return x.id===postId});
    if(!p) return;
    openModal(
        '<div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold">'+t('editPost')+'</h3><button onclick="closeModal()" class="text-neutral-500 hover:text-white"><iconify-icon icon="mdi:close" class="text-xl"></iconify-icon></button></div>' +
        '<form onsubmit="updatePost(event,\''+postId+'\')"><div class="space-y-4">' +
            '<div><label class="text-xs text-neutral-400 mb-1 block">'+t('type')+'</label><select id="editPostType" class="input-field"><option value="design" '+(p.type==='design'?'selected':'')+'>'+t('design')+'</option><option value="code" '+(p.type==='code'?'selected':'')+'>'+t('code')+'</option><option value="project" '+(p.type==='project'?'selected':'')+'>'+t('project')+'</option><option value="other" '+(p.type==='other'?'selected':'')+'>'+t('other')+'</option></select></div>' +
            '<div><label class="text-xs text-neutral-400 mb-1 block">'+t('description')+'</label><textarea id="editPostCaption" class="input-field" rows="4" required>'+p.caption+'</textarea></div>' +
            '<button type="submit" class="btn-secondary w-full text-center flex items-center justify-center gap-2"><iconify-icon icon="mdi:check"></iconify-icon>'+t('save')+'</button>' +
        '</div></form>'
    );
}

function updatePost(e, postId){
    e.preventDefault();
    API.updatePost(postId, {
        type: document.getElementById('editPostType').value,
        caption: document.getElementById('editPostCaption').value.trim()
    }).then(function(r){
        if(r.error){toast(r.error,'error');return}
        var p = normalizePost(r.data)
        var idx = _cache.posts.findIndex(function(x){return x.id===postId})
        if(idx!==-1) _cache.posts[idx] = p
        closeModal(); toast('✅ Post yeniləndi!','success'); navigate(currentRoute);
    })
}

function deletePost(postId){
    openModal('<div class="text-center"><iconify-icon icon="mdi:delete-alert-outline" class="text-4xl text-red-400 mb-4"></iconify-icon><h3 class="text-lg font-semibold mb-2">'+t('deletePost')+'</h3><p class="text-sm text-neutral-400 mb-6">'+t('deletePostConfirm')+'</p><div class="flex gap-3"><button onclick="closeModal()" class="btn-outline btn-sm flex-1 text-center">'+t('cancel')+'</button><button onclick="confirmDeletePost(\''+postId+'\')" class="btn-sm flex-1 text-center bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium cursor-pointer hover:bg-red-500/30 transition-colors">'+t('delete')+'</button></div></div>');
}

function toggleMoreMenu(e, id) {
    if(e) e.stopPropagation();
    var menu = document.getElementById('menu-' + id);
    var allMenus = document.querySelectorAll('.more-menu');
    allMenus.forEach(function(m){ if(m.id !== 'menu-'+id) m.classList.add('hidden') });
    if(menu) menu.classList.toggle('hidden');
}

document.addEventListener('click', function(e){
    if(!e.target.closest('.more-menu') && !e.target.closest('button[onclick^="toggleMoreMenu"]')) {
        document.querySelectorAll('.more-menu').forEach(function(m){ m.classList.add('hidden') });
    }
});
function confirmDeletePost(postId){
    API.deletePost(postId).then(function(){
        _cache.posts = _cache.posts.filter(function(p){return p.id!==postId});
        closeModal();toast('🗑️ Post silindi.','success');navigate('dashboard');
    });
}

function sharePost(postId){
    var p = _cache.posts.find(function(x){return x.id===postId});
    if(!p) return;
    var author = getUser(p.authorId);
    var text = author.name + ' LinkUp-da paylaşdı: "' + p.caption.slice(0,60) + '..."';
    if(navigator.clipboard){navigator.clipboard.writeText(text).then(function(){toast('📋 Link kopyalandı!','success')})}
    else {toast('📋 Paylaşım mətni: '+text,'info')}
}

function openProjectForm(){
    openModal(
        '<div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold">Yeni Layihə Yarat</h3><button onclick="closeModal()" class="text-neutral-500 hover:text-white"><iconify-icon icon="mdi:close" class="text-xl"></iconify-icon></button></div>' +
        '<form onsubmit="createProject(event)"><div class="space-y-4">' +
            '<div><label class="text-xs text-neutral-400 mb-1 block">Başlıq</label><input id="projTitle" class="input-field" required placeholder="Məs: Mobil tətbiq dizaynı"></div>' +
            '<div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-neutral-400 mb-1 block">Komanda</label><input id="projTeam" class="input-field" placeholder="Məs: 3-5 nəfər"></div><div><label class="text-xs text-neutral-400 mb-1 block">Status</label><select id="projStatus" class="input-field"><option value="active">Aktiv</option><option value="completed">Tamamlandı</option></select></div></div>' +
            '<div><label class="text-xs text-neutral-400 mb-1 block">Təsvir</label><textarea id="projDesc" class="input-field" rows="3" required placeholder="Layihə haqqında qısa məlumat..."></textarea></div>' +
            '<div><label class="text-xs text-neutral-400 mb-1 block">Bacarıqlar (vergüllə)</label><input id="projSkills" class="input-field" placeholder="Figma, React, UI/UX"></div>' +
            '<button type="submit" class="btn-secondary w-full text-center flex items-center justify-center gap-2"><iconify-icon icon="mdi:check"></iconify-icon>Yarat</button>' +
        '</div></form>'
    );
}

function createProject(e){
    e.preventDefault();
    API.createProject({
        title: document.getElementById('projTitle').value.trim(),
        desc: document.getElementById('projDesc').value.trim(),
        skills: document.getElementById('projSkills').value.split(',').map(function(s){return s.trim()}).filter(Boolean),
        team: document.getElementById('projTeam').value.trim() || '3-5 nəfər',
        status: document.getElementById('projStatus').value
    }).then(function(r){
        if(r.error){toast(r.error,'error');return}
        _cache.projects.unshift(normalizeProject(r.data));
        closeModal();
        toast('🚀 Layihə yaradıldı!','success');
        _discoverTab = 'projects';
        navigate('discover');
    });
}

function openEditProject(projectId){
    var p = _cache.projects.find(function(x){return x.id===projectId});
    if(!p) return;
    
    openModal(
        '<div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold">Layihəni Redaktə Et</h3><button onclick="closeModal()" class="text-neutral-500 hover:text-white"><iconify-icon icon="mdi:close" class="text-xl"></iconify-icon></button></div>' +
        '<form onsubmit="updateProject(event,\''+projectId+'\')"><div class="space-y-4">' +
            '<div><label class="text-xs text-neutral-400 mb-1 block">Başlıq</label><input id="editProjTitle" class="input-field" value="'+p.title+'" required></div>' +
            '<div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-neutral-400 mb-1 block">Komanda</label><input id="editProjTeam" class="input-field" value="'+p.team+'"></div><div><label class="text-xs text-neutral-400 mb-1 block">Status</label><select id="editProjStatus" class="input-field"><option value="active" '+(p.status==='active'?'selected':'')+'>Aktiv</option><option value="completed" '+(p.status==='completed'?'selected':'')+'>Tamamlandı</option></select></div></div>' +
            '<div><label class="text-xs text-neutral-400 mb-1 block">Təsvir</label><textarea id="editProjDesc" class="input-field" rows="3" required>'+p.desc+'</textarea></div>' +
            '<div><label class="text-xs text-neutral-400 mb-1 block">Bacarıqlar (vergüllə)</label><input id="editProjSkills" class="input-field" value="'+p.skills.join(', ')+'"></div>' +
            '<button type="submit" class="btn-secondary w-full text-center flex items-center justify-center gap-2"><iconify-icon icon="mdi:check"></iconify-icon>Yadda Saxla</button>' +
        '</div></form>'
    );
}

function updateProject(e, projectId){
    e.preventDefault();
    API.updateProject(projectId, {
        title: document.getElementById('editProjTitle').value.trim(),
        team: document.getElementById('editProjTeam').value.trim(),
        status: document.getElementById('editProjStatus').value,
        desc: document.getElementById('editProjDesc').value.trim(),
        skills: document.getElementById('editProjSkills').value.split(',').map(function(s){return s.trim()}).filter(function(s){return s!==''})
    }).then(function(r){
        if(r.error){toast(r.error,'error');return}
        var idx = _cache.projects.findIndex(function(x){return x.id===projectId});
        if(idx!==-1) _cache.projects[idx] = normalizeProject(r.data);
        closeModal();
        toast('✅ Layihə yeniləndi!','success');
        navigate('discover');
    });
}

// ====================== NEW POST ======================
var _newPostImage = '';

function openNewPost(){
    _newPostImage = '';
    openModal(
        '<div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold">'+t('newPost')+'</h3><button onclick="closeModal()" class="text-neutral-500 hover:text-white"><iconify-icon icon="mdi:close" class="text-xl"></iconify-icon></button></div>' +
        '<form onsubmit="createPost(event)"><div class="space-y-4">' +
            '<div>' +
                '<label class="text-xs text-neutral-400 mb-2 block">'+t('photo')+'</label>' +
                '<div id="postImagePreview" class="hidden mb-3 relative"><img id="postImgTag" class="w-full rounded-xl object-cover" style="max-height:200px" alt="Preview"><button type="button" onclick="removePostImage()" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500/60 transition-colors"><iconify-icon icon="mdi:close" class="text-sm"></iconify-icon></button></div>' +
                '<div id="postUploadArea" class="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-brand-500/30 hover:bg-brand-500/5 transition-all" onclick="uploadPostImage()">' +
                    '<iconify-icon icon="mdi:cloud-upload-outline" class="text-3xl text-neutral-600 mb-2"></iconify-icon>' +
                    '<p class="text-xs text-neutral-500">'+t('photoHint')+'</p>' +
                    '<p class="text-[10px] text-neutral-600 mt-1">'+t('photoSize')+'</p>' +
                '</div>' +
            '</div>' +
            '<div><label class="text-xs text-neutral-400 mb-1 block">'+t('type')+'</label><select id="postType" class="input-field"><option value="design">'+t('design')+'</option><option value="code">'+t('code')+'</option><option value="project">'+t('project')+'</option><option value="other">'+t('other')+'</option></select></div>' +
            '<div><label class="text-xs text-neutral-400 mb-1 block">'+t('captionLabel')+'</label><textarea id="postCaption" class="input-field" rows="3" required placeholder="'+t('captionPlaceholder')+'"></textarea></div>' +
            '<button type="submit" class="btn-secondary w-full text-center flex items-center justify-center gap-2"><iconify-icon icon="mdi:send"></iconify-icon>'+t('postBtn')+'</button>' +
        '</div></form>'
    );
}

function uploadPostImage(){
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function(e){
        var file = e.target.files[0]; if(!file) return;
        if(file.size > 3*1024*1024){toast('Şəkil 3MB-dan kiçik olmalıdır','error');return}
        var reader = new FileReader();
        reader.onload = function(ev){
            _newPostImage = ev.target.result;
            document.getElementById('postUploadArea').classList.add('hidden');
            document.getElementById('postImagePreview').classList.remove('hidden');
            document.getElementById('postImgTag').src = _newPostImage;
        };
        reader.readAsDataURL(file);
    };
    inp.click();
}

function removePostImage(){
    _newPostImage = '';
    document.getElementById('postUploadArea').classList.remove('hidden');
    document.getElementById('postImagePreview').classList.add('hidden');
}

function createPost(e){
    e.preventDefault();
    var posts = DB.get('posts');
    posts.unshift({
        id: uid(),
        authorId: currentUser.id,
        image: _newPostImage,
        caption: document.getElementById('postCaption').value.trim(),
        type: document.getElementById('postType').value,
        likes: [],
        comments: [],
        createdAt: Date.now()
    });
    DB.set('posts',posts);
    closeModal();
    toast('🎉 Paylaşım uğurla yerləşdirildi!','success');
    navigate('dashboard');
}

// ====================== DISCOVER ======================
function switchDiscoverTab(tab) {
    _discoverTab = tab;
    var wrapper = document.getElementById('discoverWrapper');
    if(wrapper) {
        wrapper.innerHTML = renderDiscover();
        if(tab === 'people') initDiscover();
    }
}
function renderDiscover(){
    var tabsHtml = '<div class="flex items-center gap-2 mb-6 anim-up bg-white/[.02] p-1 rounded-xl border border-white/5 inline-flex">' +
        '<button onclick="switchDiscoverTab(\'people\')" class="px-5 py-2 rounded-lg text-sm font-medium transition-all ' + (_discoverTab==='people'?'bg-white/10 text-white shadow-lg':'text-neutral-500 hover:text-neutral-300') + '">'+t('people')+'</button>' +
        '<button onclick="switchDiscoverTab(\'projects\')" class="px-5 py-2 rounded-lg text-sm font-medium transition-all ' + (_discoverTab==='projects'?'bg-white/10 text-white shadow-lg':'text-neutral-500 hover:text-neutral-300') + '">'+t('projects')+'</button>' +
    '</div>';

    if (_discoverTab === 'projects') {
        var projs=DB.get('projects');
        var projectsList = '<div class="grid md:grid-cols-2 gap-5">'+projs.map(function(p,i){var a=getUser(p.authorId);var isMine=p.authorId===currentUser.id;var applied=p.applicants&&p.applicants.some(function(ap){return ap.userId===currentUser.id});
            var statusBadge=p.status==='completed'?'<span class="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">'+t('completed')+'</span>':'<span class="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">'+t('active')+'</span>';
            var actionBtn=isMine?
                '<div class="flex items-center gap-2">' +
                    '<div class="relative justify-end">' +
                        '<button onclick="toggleMoreMenu(event, \'proj-'+p.id+'\')" class="text-neutral-500 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all"><iconify-icon icon="mdi:dots-vertical" class="text-lg"></iconify-icon></button>' +
                        '<div id="menu-proj-'+p.id+'" class="more-menu hidden" style="top:30px!important;">' +
                            '<button onclick="openEditProject(\''+p.id+'\')" class="more-item"><iconify-icon icon="mdi:pencil-outline"></iconify-icon>'+t('edit')+'</button>' +
                            '<button onclick="toast(\'🗑️ Layihə silindi.\',\'success\');closeModal();" class="more-item delete"><iconify-icon icon="mdi:delete-outline"></iconify-icon>'+t('delete')+'</button>' +
                        '</div>' +
                    '</div>' +
                    '<button onclick="viewApplicants(\''+p.id+'\')" class="btn-outline btn-xs px-3">'+t('applications')+'</button>' +
                '</div>':
                applied?'<span class="btn-xs px-3 text-green-400 border border-green-500/20 bg-green-500/5 rounded-lg text-[11px]">'+t('applied')+'</span>':
                '<button onclick="applyProject(\''+p.id+'\')" class="btn-secondary btn-xs">'+t('applyProject')+'</button>';
            return '<div class="glass-card rounded-2xl p-6 card-hover anim-up" style="animation-delay:'+(i*0.08)+'s"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-xl bg-gradient-to-br '+p.grad+' flex items-center justify-center"><iconify-icon icon="mdi:folder-star-outline" class="text-white text-lg"></iconify-icon></div><div class="flex-1 min-w-0"><h3 class="text-sm font-medium truncate">'+p.title+'</h3><p class="text-[11px] text-neutral-500">'+(a?a.name:'Naməlum')+' · '+p.team+'</p></div>'+statusBadge+'</div><p class="text-xs text-neutral-400 font-light leading-relaxed mb-4">'+p.desc+'</p><div class="flex flex-wrap gap-1.5 mb-4">'+p.skills.map(function(s){return '<span class="skill-tag">'+s+'</span>'}).join('')+'</div><div class="flex items-center justify-end">'+actionBtn+'</div></div>'}).join('')+'</div>';
        
        return '<div class="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4 anim-up"><div><h1 class="text-2xl font-semibold mb-1">'+t('discoverTitle')+'</h1><p class="text-sm text-neutral-400 font-light">'+t('discoverSubProjects')+'</p></div>' + tabsHtml + '</div>' + 
               '<div class="flex justify-start md:justify-end mb-6 anim-up"><button onclick="openProjectForm()" class="btn-secondary btn-sm flex items-center gap-2"><iconify-icon icon="mdi:plus"></iconify-icon>'+t('createProject')+'</button></div>' + projectsList;
    }

    return '<div class="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4 anim-up"><div><h1 class="text-2xl font-semibold mb-1">'+t('discoverTitle')+'</h1><p class="text-sm text-neutral-400 font-light">'+t('discoverSubPeople')+'</p></div>'+
    tabsHtml + '</div>' + 
    '<div class="flex justify-start md:justify-end items-center gap-2 mb-6 anim-up"><select id="discSort" class="input-field w-auto text-xs py-1.5 px-3" onchange="doFilter()"><option value="new">'+t('newest')+'</option><option value="skills">'+t('mostSkills')+'</option><option value="views">'+t('mostViewed')+'</option></select>'+
    '<button onclick="toggleDiscoverView(\'grid\')" class="view-toggle-btn'+(_discoverView==='grid'?' active':'')+'" id="viewGrid"><iconify-icon icon="mdi:view-grid-outline"></iconify-icon></button>'+
    '<button onclick="toggleDiscoverView(\'list\')" class="view-toggle-btn'+(_discoverView==='list'?' active':'')+'" id="viewList"><iconify-icon icon="mdi:view-list-outline"></iconify-icon></button></div>'+
    '<div class="glass-card rounded-2xl p-4 mb-6 anim-up" style="animation-delay:.1s"><div class="flex flex-col md:flex-row gap-3">'+
    '<div class="flex-1 relative"><iconify-icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"></iconify-icon><input type="text" id="discSearch" placeholder="'+t('searchPlaceholder')+'" class="input-field pl-10" oninput="doFilter()" onfocus="showAutoComplete()" onblur="setTimeout(hideAutoComplete,200)"><div id="autoComplete" class="autocomplete-list hidden"></div></div>'+
    '<select id="discLevel" class="input-field md:w-40" onchange="doFilter()"><option value="">'+t('allLevels')+'</option><option>'+t('beginner')+'</option><option>'+t('intermediate')+'</option><option>'+t('advanced')+'</option></select>'+
    '<select id="discField" class="input-field md:w-40" onchange="doFilter()"><option value="">'+t('allFields')+'</option><option>Proqramlaşdırma</option><option>Dizayn</option><option>Marketinq</option><option>Data Science</option></select>'+
    '</div></div><div id="discGrid" class="'+(_discoverView==='grid'?'grid md:grid-cols-2 lg:grid-cols-3':'space-y-3')+' gap-5"></div><div id="discEmpty" class="hidden text-center py-20"><iconify-icon icon="mdi:account-search-outline" class="text-5xl text-neutral-700 mb-4"></iconify-icon><p class="text-neutral-500 text-sm mb-2">'+t('notFound')+'</p><p class="text-neutral-600 text-xs">'+t('tryFilter')+'</p></div>';
}
function initDiscover(){doFilter()}
function toggleDiscoverView(v){_discoverView=v;var g=document.getElementById('discGrid');g.className=v==='grid'?'grid md:grid-cols-2 lg:grid-cols-3 gap-5':'space-y-3';document.getElementById('viewGrid').classList.toggle('active',v==='grid');document.getElementById('viewList').classList.toggle('active',v==='list');doFilter()}

function showAutoComplete(){
    var input=document.getElementById('discSearch');if(!input||!input.value){hideAutoComplete();return}
    var val=input.value.toLowerCase();var allSkills=[];
    DB.get('users').forEach(function(u){u.skills.forEach(function(sk){if(!allSkills.includes(sk.n)&&sk.n.toLowerCase().includes(val))allSkills.push(sk.n)})});
    if(!allSkills.length){hideAutoComplete();return}
    var ac=document.getElementById('autoComplete');ac.classList.remove('hidden');
    ac.innerHTML=allSkills.slice(0,6).map(function(s){return '<div class="autocomplete-item" onmousedown="selectAutoComplete(\''+s+'\')">'+s+'</div>'}).join('');
}
function hideAutoComplete(){var ac=document.getElementById('autoComplete');if(ac)ac.classList.add('hidden')}
function selectAutoComplete(val){document.getElementById('discSearch').value=val;hideAutoComplete();doFilter()}

function doFilter(){
    var s=document.getElementById('discSearch').value.toLowerCase(),lv=document.getElementById('discLevel').value,fi=document.getElementById('discField').value,sort=document.getElementById('discSort').value;
    var users=_cache.users.filter(function(u){return u.id!==currentUser.id}).filter(function(u){
        var ms=!s||u.skills.some(function(sk){return sk.n.toLowerCase().includes(s)})||u.name.toLowerCase().includes(s)||(u.bio||'').toLowerCase().includes(s)||(u.field||'').toLowerCase().includes(s);
        return ms&&(!lv||u.level===lv)&&(!fi||u.field===fi);
    });
    if(sort==='skills')users.sort(function(a,b){return b.skills.length-a.skills.length});
    if(sort==='views')users.sort(function(a,b){return(b.views||0)-(a.views||0)});
    if(sort==='new')users.sort(function(a,b){return b.createdAt-a.createdAt});
    var grid=document.getElementById('discGrid'),empty=document.getElementById('discEmpty');
    if(!users.length){grid.innerHTML='';empty.classList.remove('hidden');return}
    empty.classList.add('hidden');
    grid.innerHTML=users.map(function(u,i){return _discoverView==='grid'?profileCardGrid(u,i):profileCardList(u,i)}).join('');
}
function profileCardGrid(u,i){
    var isFollowing = currentUser.following && currentUser.following.indexOf(u.id) !== -1;
    var actionBtn = u.id === currentUser.id ? '' : 
        (isFollowing ? '<button onclick="toggleFollow(event,\''+u.id+'\')" class="btn-outline btn-xs px-3" title="İzlənilir"><iconify-icon icon="mdi:check" class="text-sm"></iconify-icon></button>' : 
        '<button onclick="toggleFollow(event,\''+u.id+'\')" class="btn-secondary btn-xs px-3" title="İzlə"><iconify-icon icon="mdi:account-plus-outline" class="text-sm"></iconify-icon></button>');
    
    return '<div class="glass-card rounded-2xl p-6 card-hover anim-up" style="animation-delay:'+(i*0.06)+'s"><div class="flex items-start gap-3 mb-3">'+
        '<div class="cursor-pointer" onclick="window._viewUser=\''+u.id+'\';navigate(\'user\')">'+avatarHtml(u,'md')+'</div>'+
        '<div class="min-w-0 flex-1"><div class="text-sm font-medium truncate cursor-pointer hover:text-brand-400 transition-colors" onclick="window._viewUser=\''+u.id+'\';navigate(\'user\')">'+u.name+'</div><div class="text-[11px] text-neutral-500 truncate">'+(u.university||'')+' · '+(u.field||'')+'</div></div>'+lvlBadge(u.level)+'</div>'+
        '<p class="text-xs text-neutral-400 font-light leading-relaxed mb-3" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+(u.bio||t('noBio'))+'</p>'+
        '<div class="flex flex-wrap gap-1.5 mb-4">'+(u.skills||[]).slice(0,4).map(function(sk){return '<span class="skill-tag">'+sk.n+'</span>'}).join('')+((u.skills||[]).length>4?'<span class="skill-tag">+'+(u.skills.length-4)+'</span>':'')+'</div>'+
        '<div class="flex items-center justify-between"><div class="flex gap-2"><button onclick="window._viewUser=\''+u.id+'\';navigate(\'user\')" class="btn-outline btn-xs flex-1 text-center">'+t('profileBtn')+'</button><button onclick="event.stopPropagation();startChat(\''+u.id+'\')" class="btn-secondary btn-xs px-3"><iconify-icon icon="mdi:message-outline" class="text-sm"></iconify-icon></button></div>'+actionBtn+'</div></div>';
}
function profileCardList(u,i){
    var isFollowing = currentUser.following && currentUser.following.indexOf(u.id) !== -1;
    var actionBtn = u.id === currentUser.id ? '' : 
        (isFollowing ? '<button onclick="toggleFollow(event,\''+u.id+'\')" class="btn-outline btn-xs px-3" title="İzlənilir"><iconify-icon icon="mdi:check" class="text-xs"></iconify-icon></button>' : 
        '<button onclick="toggleFollow(event,\''+u.id+'\')" class="btn-secondary btn-xs px-3" title="İzlə"><iconify-icon icon="mdi:account-plus-outline" class="text-xs"></iconify-icon></button>');

    return '<div class="glass-card rounded-xl p-4 flex items-center gap-4 anim-up" style="animation-delay:'+(i*0.04)+'s">'+
        '<div class="cursor-pointer shrink-0" onclick="window._viewUser=\''+u.id+'\';navigate(\'user\')">'+avatarHtml(u,'md')+'</div>'+
        '<div class="flex-1 min-w-0"><div class="text-sm font-medium truncate cursor-pointer hover:text-brand-400" onclick="window._viewUser=\''+u.id+'\';navigate(\'user\')">'+u.name+'</div>'+
        '<div class="text-[11px] text-neutral-500 truncate mb-1.5">'+(u.field||'')+' · '+(u.university||'')+'</div>'+
        '<div class="flex flex-wrap gap-1">'+(u.skills||[]).slice(0,3).map(function(sk){return '<span class="skill-tag">'+sk.n+'</span>'}).join('')+'</div></div>'+
        '<div class="flex flex-col items-end gap-2 shrink-0">'+lvlBadge(u.level)+actionBtn+
        '<button onclick="startChat(\''+u.id+'\')" class="btn-secondary btn-xs px-2.5"><iconify-icon icon="mdi:message-outline" class="text-sm"></iconify-icon></button></div></div>';
}

// ====================== DASHBOARD ======================
function renderDashboard(){
    var posts = DB.get('posts');
    if(_dashboardTab === 'following') {
        posts = posts.filter(function(p){ 
            return p.authorId === currentUser.id || (currentUser.following && currentUser.following.indexOf(p.authorId) !== -1);
        });
    }
    posts = posts.sort(function(a,b){return b.createdAt-a.createdAt});

    var tabsHtml = '<div class="flex items-center gap-6 mb-8 border-b border-white/5 anim-up">' +
        '<button onclick="switchDashboardTab(\'all\')" class="pb-3 text-sm font-medium transition-all relative ' + (_dashboardTab==='all'?'text-white':'text-neutral-500 hover:text-neutral-300') + '">' +
            t('everyone') + (_dashboardTab==='all'?'<span class="absolute bottom-[-1px] left-0 w-full h-0.5 bg-brand-500 rounded-full"></span>':'') +
        '</button>' +
        '<button onclick="switchDashboardTab(\'following\')" class="pb-3 text-sm font-medium transition-all relative ' + (_dashboardTab==='following'?'text-white':'text-neutral-500 hover:text-neutral-300') + '">' +
            t('following') + (_dashboardTab==='following'?'<span class="absolute bottom-[-1px] left-0 w-full h-0.5 bg-brand-500 rounded-full"></span>':'') +
        '</button>' +
    '</div>';

    var postsHtml = posts.length ? posts.map(function(p,i){return renderPostCard(p,i)}).join('') : '<div class="text-center py-20 bg-white/[.02] border border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-3"><iconify-icon icon="mdi:post-outline" class="text-4xl text-neutral-700"></iconify-icon><span class="text-sm text-neutral-500">'+(_dashboardTab==='following'?t('noPostsFollowing'):t('noPosts'))+'</span></div>';
    
    return '<div class="max-w-2xl mx-auto">' + tabsHtml + '<div class="space-y-6">' + postsHtml + '</div></div>';
}

function switchDashboardTab(tab){
    _dashboardTab = tab;
    var main = document.getElementById('appMain');
    main.innerHTML = '<div class="page-enter">' + renderDashboard() + '</div>';
    initScrollObs();
}

// ====================== USER PROFILE ======================
function renderUserProfile(){
    var u=getUser(window._viewUser);if(!u)return'<p class="text-neutral-500">Tapılmadı.</p>';
    // Increment views
    var users=DB.get('users');var idx=users.findIndex(function(x){return x.id===u.id});users[idx].views=(users[idx].views||0)+1;DB.set('users',users);
    
    var isFollowing = currentUser.following && currentUser.following.indexOf(u.id) !== -1;
    var followBtn = isFollowing ? 
        '<button onclick="toggleFollow(event,\''+u.id+'\')" class="btn-outline btn-sm flex-1 text-center py-2.5">'+t('following2')+'</button>' : 
        '<button onclick="toggleFollow(event,\''+u.id+'\')" class="btn-secondary btn-sm flex-1 text-center py-2.5">'+t('follow')+'</button>';

    var userPosts=DB.get('posts').filter(function(p){return p.authorId===u.id}).sort(function(a,b){return b.createdAt-a.createdAt});
    var postsHtml=userPosts.length?'<div class="space-y-5">'+userPosts.map(function(p,i){return renderPostCard(p,i)}).join('')+'</div>':'<p class="text-sm text-neutral-500 text-center py-6 border border-dashed border-white/10 rounded-xl">'+t('noPosts2')+'</p>';
    
    var statsHtml = '<div class="flex items-center justify-center gap-8 mb-6 py-4 border-y border-white/5">' +
        '<div class="text-center cursor-pointer hover:opacity-80" onclick="viewFollowList(\''+u.id+'\',\'followers\')"><div class="text-base font-semibold">'+(u.followers?u.followers.length:0)+'</div><div class="text-[10px] text-neutral-500 uppercase tracking-wider">'+t('followers')+'</div></div>' +
        '<div class="text-center cursor-pointer hover:opacity-80" onclick="viewFollowList(\''+u.id+'\',\'following\')"><div class="text-base font-semibold">'+(u.following?u.following.length:0)+'</div><div class="text-[10px] text-neutral-500 uppercase tracking-wider">'+t('followingCount')+'</div></div>' +
        '<div class="text-center"><div class="text-base font-semibold">'+userPosts.length+'</div><div class="text-[10px] text-neutral-500 uppercase tracking-wider">'+t('posts')+'</div></div>' +
    '</div>';

    return '<div class="max-w-2xl mx-auto"><button onclick="navigate(\'discover\')" class="text-sm text-neutral-400 hover:text-white mb-6 flex items-center gap-1 transition-colors anim-up"><iconify-icon icon="mdi:arrow-left"></iconify-icon> '+t('back')+'</button>'+
        '<div class="glass-card rounded-2xl p-8 anim-up mb-8" style="animation-delay:.1s"><div class="text-center mb-6"><div class="mb-4">'+avatarHtml(u,'lg')+'</div><h2 class="text-xl font-semibold">'+u.name+'</h2><p class="text-sm text-neutral-500 mt-1">'+u.university+' · '+u.field+'</p><div class="mt-2 flex items-center justify-center gap-3">'+lvlBadge(u.level)+'</div></div>'+
        statsHtml + 
        (u.bio?'<div class="mb-6"><h3 class="text-xs text-neutral-400 font-medium mb-2 uppercase tracking-wider">'+t('about')+'</h3><p class="text-sm text-neutral-300 font-light leading-relaxed">'+u.bio+'</p></div>':'')+
        (u.skills.length?'<div class="mb-6"><h3 class="text-xs text-neutral-400 font-medium mb-2 uppercase tracking-wider">'+t('skills')+' ('+u.skills.length+')</h3><div class="flex flex-wrap gap-2">'+u.skills.map(function(sk){return '<span class="skill-tag">'+sk.n+' <span class="text-neutral-600 text-[10px]">· '+sk.l+'</span></span>'}).join('')+'</div></div>':'')+
        '<div class="flex gap-3 pt-4 border-t border-white/5">'+followBtn+'<button onclick="startChat(\''+u.id+'\')" class="btn-outline btn-sm flex-1 text-center py-2.5">'+t('sendMessage')+'</button></div></div>'+
        '<h3 class="text-lg font-semibold mb-4 anim-up">'+t('myPosts')+' <span class="text-neutral-500 text-sm font-light">('+userPosts.length+')</span></h3><div class="anim-up" style="animation-delay:.2s">'+postsHtml+'</div></div>';
}

// ====================== OWN PROFILE ======================
function renderProfile(){
    refreshUser();var u=currentUser;var pct=profileCompletion(u);
    var posts = [];
    var title = "";
    var emptyText = "";

    if(_profileTab === 'posts') {
        posts = DB.get('posts').filter(function(p){return p.authorId===u.id}).sort(function(a,b){return b.createdAt-a.createdAt});
        title = t('myPosts');
        emptyText = t('noPostsOwn');
    } else {
        posts = DB.get('posts').filter(function(p){return p.likes && p.likes.indexOf(u.id) !== -1}).sort(function(a,b){return b.createdAt-a.createdAt});
        title = t('myLiked');
        emptyText = t('noLiked');
    }

    var postsHtml = posts.length ? '<div class="space-y-5">' + posts.map(function(p,i){return renderPostCard(p,i)}).join('') + '</div>' : '<div class="text-center py-12 border border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-3"><iconify-icon icon="mdi:heart-off-outline" class="text-4xl text-neutral-700"></iconify-icon><span class="text-sm text-neutral-500">'+emptyText+'</span></div>';
    
    var tabsHtml = '<div class="flex items-center gap-2 mb-6 anim-up bg-white/[.02] p-1 rounded-xl border border-white/5 inline-flex w-full">' +
        '<button onclick="switchProfileTab(\'posts\')" class="flex-1 py-2 rounded-lg text-xs font-medium transition-all ' + (_profileTab==='posts'?'bg-white/10 text-white shadow-lg':'text-neutral-500 hover:text-neutral-300') + '"><iconify-icon icon="mdi:grid-large" class="shrink-0"></iconify-icon> '+t('myPosts')+'</button>' +
        '<button onclick="switchProfileTab(\'liked\')" class="flex-1 py-2 rounded-lg text-xs font-medium transition-all ' + (_profileTab==='liked'?'bg-white/10 text-white shadow-lg':'text-neutral-500 hover:text-neutral-300') + '"><iconify-icon icon="mdi:heart-outline" class="shrink-0"></iconify-icon> '+t('myLiked')+'</button>' +
    '</div>';

    var statsHtml = '<div class="flex items-center justify-center gap-8 mb-6 py-4 border-y border-white/5">' +
        '<div class="text-center cursor-pointer hover:opacity-80" onclick="viewFollowList(\''+u.id+'\',\'followers\')"><div class="text-base font-semibold">'+(u.followers?u.followers.length:0)+'</div><div class="text-[10px] text-neutral-500 uppercase tracking-wider">'+t('followers')+'</div></div>' +
        '<div class="text-center cursor-pointer hover:opacity-80" onclick="viewFollowList(\''+u.id+'\',\'following\')"><div class="text-base font-semibold">'+(u.following?u.following.length:0)+'</div><div class="text-[10px] text-neutral-500 uppercase tracking-wider">'+t('followingCount')+'</div></div>' +
        '<div class="text-center"><div class="text-base font-semibold">'+posts.length+'</div><div class="text-[10px] text-neutral-500 uppercase tracking-wider">'+t('posts')+'</div></div>' +
    '</div>';

    return '<div class="max-w-2xl mx-auto"><div class="flex items-center justify-between mb-6 anim-up"><h1 class="text-2xl font-semibold">'+t('myProfile')+'</h1><button onclick="toggleEdit()" id="editBtn" class="btn-outline btn-xs flex items-center gap-1"><iconify-icon icon="mdi:pencil-outline" class="text-sm"></iconify-icon>'+t('editProfile')+'</button></div>'+
        '<div id="profileView"><div class="glass-card rounded-2xl p-8 anim-up mb-8" style="animation-delay:.1s"><div class="text-center mb-6"><div class="mb-4 relative inline-block avatar-upload" onclick="uploadAvatar()">'+avatarHtml(u,'lg')+'<div class="avatar-overlay rounded-full"><iconify-icon icon="mdi:camera" class="text-white text-xl"></iconify-icon></div></div><h2 class="text-xl font-semibold">'+u.name+'</h2><p class="text-sm text-neutral-500 mt-1">'+(u.university||t('university'))+' · '+(u.field||t('field'))+'</p><div class="mt-2">'+lvlBadge(u.level)+'</div><div class="mt-4 max-w-xs mx-auto">'+completionBar(pct)+'</div></div>'+
        statsHtml +
        (u.bio?'<div class="mb-6"><h3 class="text-xs text-neutral-400 font-medium mb-2 uppercase tracking-wider">'+t('about')+'</h3><p class="text-sm text-neutral-300 font-light leading-relaxed">'+u.bio+'</p></div>':'<p class="text-center text-neutral-600 text-sm mb-6">'+t('noBioOwn')+'</p>')+
        (u.skills.length?'<div class="mb-6"><h3 class="text-xs text-neutral-400 font-medium mb-2 uppercase tracking-wider">'+t('skills')+' ('+u.skills.length+')</h3><div class="flex flex-wrap gap-2">'+u.skills.map(function(sk){return '<span class="skill-tag">'+sk.n+' <span class="text-neutral-600 text-[10px]">· '+sk.l+'</span></span>'}).join('')+'</div></div>':'')+
        (u.links&&u.links.length?'<div class="mb-4"><h3 class="text-xs text-neutral-400 font-medium mb-2 uppercase tracking-wider">'+t('links')+'</h3><div class="flex flex-col gap-2">'+u.links.map(function(l){return '<a href="#" class="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"><iconify-icon icon="mdi:open-in-new" class="text-brand-400 text-sm"></iconify-icon>'+l.t+': '+l.v+'</a>'}).join('')+'</div></div>':'')+
        '<div class="pt-4 border-t border-white/5 text-center"><span class="text-[10px] text-neutral-600 flex items-center justify-center gap-1"><iconify-icon icon="mdi:eye-outline"></iconify-icon>'+(u.views||0)+' '+t('views')+'</span></div></div>'+
        tabsHtml +
        '<div class="anim-up" style="animation-delay:.2s">'+postsHtml+'</div></div>'+
        '<div id="profileEdit" class="glass-card rounded-2xl p-8 hidden"><form id="profileForm" onsubmit="saveProfile(event)"><div class="space-y-4">'+
        '<div><label class="text-xs text-neutral-400 mb-1 block">'+t('fullName')+'</label><input name="name" class="input-field" value="'+(u.name||'')+'" required></div>'+
        '<div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-neutral-400 mb-1 block">'+t('university')+'</label><input name="university" class="input-field" value="'+(u.university||'')+'"></div><div><label class="text-xs text-neutral-400 mb-1 block">'+t('field')+'</label><input name="field" class="input-field" value="'+(u.field||'')+'"></div></div>'+
        '<div><label class="text-xs text-neutral-400 mb-1 block">'+t('level')+'</label><select name="level" class="input-field"><option'+(u.level==='Başlanğıc'?' selected':'')+'>'+t('beginner')+'</option><option'+(u.level==='Orta'?' selected':'')+'>'+t('intermediate')+'</option><option'+(u.level==='Qabaqcıl'?' selected':'')+'>'+t('advanced')+'</option></select></div>'+
        '<div><label class="text-xs text-neutral-400 mb-1 block">'+t('bio')+'</label><textarea name="bio" class="input-field" rows="3">'+(u.bio||'')+'</textarea></div>'+
        '<div><label class="text-xs text-neutral-400 mb-1 block">'+t('skillsLabel')+'</label><div id="skillTags" class="flex flex-wrap gap-2 mb-2">'+u.skills.map(function(sk,i){return '<span class="skill-tag tag-removable" onclick="removeSkill('+i+')">'+sk.n+' · '+sk.l+' ✕</span>'}).join('')+'</div><div class="flex gap-2"><input id="newSkill" class="input-field flex-1" placeholder="'+t('skillsLabel')+'"><select id="newSkillLvl" class="input-field w-32"><option>'+t('beginner')+'</option><option>'+t('intermediate')+'</option><option>'+t('advanced')+'</option></select><button type="button" onclick="addSkill()" class="btn-secondary btn-xs px-3">+</button></div></div>'+
        '<div><label class="text-xs text-neutral-400 mb-1 block">'+t('linksLabel')+'</label><div id="linkTags" class="flex flex-wrap gap-2 mb-2">'+(u.links||[]).map(function(l,i){return '<span class="skill-tag tag-removable" onclick="removeLink('+i+')">'+l.t+': '+l.v+' ✕</span>'}).join('')+'</div><div class="flex gap-2"><input id="linkType" class="input-field w-28" placeholder="GitHub"><input id="linkVal" class="input-field flex-1" placeholder="github.com/username"><button type="button" onclick="addLink()" class="btn-secondary btn-xs px-3">+</button></div></div>'+
        '<div class="flex gap-3 pt-2"><button type="submit" class="btn-secondary btn-sm flex-1 text-center">'+t('save')+'</button><button type="button" onclick="toggleEdit()" class="btn-outline btn-sm flex-1 text-center">'+t('cancel')+'</button></div></div></form></div></div>';
}

function switchProfileTab(tab){
    _profileTab = tab;
    var main = document.getElementById('appMain');
    main.innerHTML = '<div class="page-enter">' + renderProfile() + '</div>';
}
function initProfileEdit(){_editSkills=[...(currentUser.skills||[])];_editLinks=[...(currentUser.links||[])]}
function toggleEdit(){document.getElementById('profileView').classList.toggle('hidden');document.getElementById('profileEdit').classList.toggle('hidden');document.getElementById('editBtn').classList.toggle('hidden')}
function uploadAvatar(){var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=function(e){var file=e.target.files[0];if(!file)return;if(file.size>2*1024*1024){toast('Şəkil 2MB-dan kiçik olmalıdır','error');return}var reader=new FileReader();reader.onload=function(ev){var users=DB.get('users');var idx=users.findIndex(function(u){return u.id===currentUser.id});users[idx].avatar=ev.target.result;DB.set('users',users);currentUser=users[idx];navigate('profile')};reader.readAsDataURL(file)};inp.click()}
function addSkill(){var n=document.getElementById('newSkill').value.trim(),l=document.getElementById('newSkillLvl').value;if(!n)return;_editSkills.push({n:n,l:l});document.getElementById('skillTags').innerHTML=_editSkills.map(function(sk,i){return '<span class="skill-tag tag-removable" onclick="removeSkill('+i+')">'+sk.n+' · '+sk.l+' ✕</span>'}).join('');document.getElementById('newSkill').value=''}
function removeSkill(i){_editSkills.splice(i,1);document.getElementById('skillTags').innerHTML=_editSkills.map(function(sk,i){return '<span class="skill-tag tag-removable" onclick="removeSkill('+i+')">'+sk.n+' · '+sk.l+' ✕</span>'}).join('')}
function addLink(){var t=document.getElementById('linkType').value.trim(),v=document.getElementById('linkVal').value.trim();if(!t||!v)return;_editLinks.push({t:t,v:v});document.getElementById('linkTags').innerHTML=_editLinks.map(function(l,i){return '<span class="skill-tag tag-removable" onclick="removeLink('+i+')">'+l.t+': '+l.v+' ✕</span>'}).join('');document.getElementById('linkType').value='';document.getElementById('linkVal').value=''}
function removeLink(i){_editLinks.splice(i,1);document.getElementById('linkTags').innerHTML=_editLinks.map(function(l,i){return '<span class="skill-tag tag-removable" onclick="removeLink('+i+')">'+l.t+': '+l.v+' ✕</span>'}).join('')}
function saveProfile(e){e.preventDefault();var f=new FormData(e.target);var users=DB.get('users');var idx=users.findIndex(function(u){return u.id===currentUser.id});users[idx]=Object.assign(users[idx],{name:f.get('name').trim(),university:f.get('university'),field:f.get('field'),level:f.get('level'),bio:f.get('bio'),skills:_editSkills,links:_editLinks});DB.set('users',users);currentUser=users[idx];toggleEdit();document.getElementById('editBtn').classList.remove('hidden');toast('✅ Profil yeniləndi!','success');navigate('profile')}

// ====================== MESSAGES ======================
function renderMessages(){
    var msgs=DB.get('messages').filter(function(m){return m.from===currentUser.id||m.to===currentUser.id});var grouped={};
    msgs.forEach(function(m){var oid=m.from===currentUser.id?m.to:m.from;if(!grouped[oid]||m.ts>grouped[oid].lastTs)grouped[oid]={oid:oid,lastMsg:m.text,lastTs:m.ts}});
    Object.keys(grouped).forEach(function(oid){grouped[oid].unread=msgs.filter(function(m){return m.from===oid&&m.to===currentUser.id&&!m.read}).length});
    var convs=Object.values(grouped).sort(function(a,b){return b.lastTs-a.lastTs});
    if(!convs.length)return '<div class="mb-6 anim-up"><h1 class="text-2xl font-semibold mb-1">'+t('messagesTitle')+'</h1></div><div class="text-center py-20 anim-up"><div class="w-20 h-20 rounded-full bg-white/[.03] flex items-center justify-center mx-auto mb-4"><iconify-icon icon="mdi:message-text-outline" class="text-4xl text-neutral-700"></iconify-icon></div><p class="text-neutral-500 text-sm mb-2">'+t('noMessages')+'</p><p class="text-neutral-600 text-xs mb-6">'+t('discoverSubPeople')+'</p><button onclick="navigate(\'discover\')" class="btn-secondary btn-sm">'+t('discoverTitle')+'</button></div>';
    return '<div class="mb-6 anim-up"><h1 class="text-2xl font-semibold mb-1">'+t('messagesTitle')+'</h1><p class="text-sm text-neutral-400 font-light">'+convs.length+' '+t('conversations')+'</p></div><div class="space-y-2">'+convs.map(function(c,i){var u=getUser(c.oid);if(!u)return'';return '<div class="glass-card rounded-xl p-4 flex items-center gap-3 cursor-pointer anim-up" style="animation-delay:'+(i*0.05)+'s" onclick="window._chatUser=\''+c.oid+'\';navigate(\'chat\')">'+avatarHtml(u,'md')+'<div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="text-sm font-medium">'+u.name+'</span>'+(c.unread?'<span class="w-5 h-5 rounded-full bg-brand-500 text-[10px] font-semibold flex items-center justify-center">'+c.unread+'</span>':'')+'</div><p class="text-xs text-neutral-500 truncate">'+c.lastMsg+'</p></div><span class="text-[10px] text-neutral-600 shrink-0">'+timeAgo(c.lastTs)+'</span></div>'}).join('')+'</div>';
}
function renderChat(){
    var u=getUser(window._chatUser);if(!u)return'<p class="text-neutral-500">Tapılmadı.</p>';
    var msgs=DB.get('messages').filter(function(m){return(m.from===currentUser.id&&m.to===u.id)||(m.from===u.id&&m.to===currentUser.id)}).sort(function(a,b){return a.ts-b.ts});
    var allMsgs=DB.get('messages');allMsgs.forEach(function(m){if(m.from===u.id&&m.to===currentUser.id)m.read=true});DB.set('messages',allMsgs);
    var msgHtml=!msgs.length?'<div class="text-center py-8"><div class="w-12 h-12 rounded-full bg-white/[.03] flex items-center justify-center mx-auto mb-3"><iconify-icon icon="mdi:hand-wave" class="text-2xl text-neutral-600"></iconify-icon></div><p class="text-neutral-600 text-xs">Salam de! İlk mesajı göndər 👋</p></div>':
        msgs.map(function(m){return '<div class="flex '+(m.from===currentUser.id?'justify-end':'justify-start')+'"><div class="chat-bubble '+(m.from===currentUser.id?'chat-sent':'chat-recv')+'">'+m.text+'</div></div>'}).join('');
    return '<div class="max-w-2xl mx-auto"><button onclick="navigate(\'messages\')" class="text-sm text-neutral-400 hover:text-white mb-4 flex items-center gap-1 transition-colors anim-up"><iconify-icon icon="mdi:arrow-left"></iconify-icon> '+t('messagesTitle')+'</button>'+
        '<div class="glass-card rounded-2xl overflow-hidden anim-up" style="animation-delay:.1s"><div class="p-4 border-b border-white/5 flex items-center gap-3">'+avatarHtml(u,'sm')+'<div><div class="text-sm font-medium">'+u.name+'</div><div class="text-[10px] text-green-400 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>Online</div></div></div>'+
        '<div id="chatMsgs" class="p-4 space-y-3 max-h-[50vh] overflow-y-auto" style="scrollbar-width:thin">'+msgHtml+'</div>'+
        '<div id="typingIndicator" class="hidden px-4 pb-1"><div class="flex items-center gap-2"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span><span class="text-[10px] text-neutral-600 ml-1">yazır...</span></div></div>'+
        '<form onsubmit="sendMsg(event,\''+u.id+'\')" class="p-4 border-t border-white/5 flex gap-2"><button type="button" onclick="insertEmoji()" class="btn-outline btn-xs px-2.5" title="Emoji"><iconify-icon icon="mdi:emoticon-happy-outline" class="text-lg"></iconify-icon></button><input type="text" id="chatInput" class="input-field flex-1" placeholder="'+t('messagePlaceholder')+'" oninput="showTyping()" autofocus><button type="submit" class="btn-secondary btn-sm px-4"><iconify-icon icon="mdi:send" class="text-lg"></iconify-icon></button></form></div></div>';
}
function showTyping(){clearTimeout(_typingTimeout);_typingTimeout=setTimeout(function(){var ti=document.getElementById('typingIndicator');if(ti)ti.classList.add('hidden')},2000)}
function insertEmoji(){var emojis=['😊','👍','🎉','🔥','💡','🚀','✅','❤️','👏','💪','🎯','⭐'];var e=emojis[Math.floor(Math.random()*emojis.length)];var inp=document.getElementById('chatInput');inp.value+=e;inp.focus()}
function sendMsg(e,toId){
    e.preventDefault();var inp=document.getElementById('chatInput');var text=inp.value.trim();if(!text)return;
    var msgs=DB.get('messages');msgs.push({id:uid(),from:currentUser.id,to:toId,text:text,ts:Date.now(),read:false});DB.set('messages',msgs);inp.value='';
    var area=document.getElementById('chatMsgs');area.innerHTML+='<div class="flex justify-end anim-up"><div class="chat-bubble chat-sent">'+text+'</div></div>';area.scrollTop=area.scrollHeight;
    var notifs=DB.get('notifications');notifs.push({id:uid(),userId:toId,type:'message',text:currentUser.name+' sənə mesaj göndərdi',read:false,ts:Date.now(),fromId:currentUser.id});DB.set('notifications',notifs);updateDots();
    // Show typing then reply
    setTimeout(function(){var ti=document.getElementById('typingIndicator');if(ti)ti.classList.remove('hidden')},800);
    setTimeout(function(){
        var ti=document.getElementById('typingIndicator');if(ti)ti.classList.add('hidden');
        var replies=[' Maraqlı fikirdir!',' Bəli, razıyam.',' Hansı vaxt müzakirə edək?',' Təşəkkürlər!',' Gözəl, bunu birlikdə həll edə bilərik.',' Mən də düşünürəm.',' Əla!',' Hə, bu yaxşı ideadır.',' 😊',' 👍 Razıyam!'];
        var allMsgs=DB.get('messages');var reply=replies[Math.floor(Math.random()*replies.length)];
        allMsgs.push({id:uid(),from:toId,to:currentUser.id,text:reply,ts:Date.now(),read:false});DB.set('messages',allMsgs);
        if(document.getElementById('chatMsgs')){var a=document.getElementById('chatMsgs');a.innerHTML+='<div class="flex justify-start anim-up"><div class="chat-bubble chat-recv">'+reply+'</div></div>';a.scrollTop=a.scrollHeight}
    },2000+Math.random()*2000);
}
function startChat(userId){window._chatUser=userId;navigate('chat')}

// ====================== PROJECTS ======================
// renderProjects function removed as it is now inside renderDiscover
function applyProject(pid){openModal('<div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold">Müraciət</h3><button onclick="closeModal()" class="text-neutral-500 hover:text-white"><iconify-icon icon="mdi:close" class="text-xl"></iconify-icon></button></div><form onsubmit="doApply(event,\''+pid+'\')"><div class="space-y-4"><div><label class="text-xs text-neutral-400 mb-1 block">Özünüzü qısa təqdim edin</label><textarea id="applyMsg" class="input-field" rows="4" required placeholder="Niyə bu layihədə iştirak etmək istəyirsiniz?"></textarea></div><button type="submit" class="btn-primary w-full text-center">Göndər</button></div></form>')}
function doApply(e,pid){e.preventDefault();var projs=DB.get('projects');var p=projs.find(function(x){return x.id===pid});if(!p)return;if(!p.applicants)p.applicants=[];p.applicants.push({userId:currentUser.id,msg:document.getElementById('applyMsg').value,ts:Date.now()});DB.set('projects',projs);closeModal();toast('🎉 Müraciət göndərildi!','success');var notifs=DB.get('notifications');notifs.push({id:uid(),userId:p.authorId,type:'project_apply',text:currentUser.name+' "'+p.title+'" layihəsinə müraciət etdi.',read:false,ts:Date.now(),projectId:pid});DB.set('notifications',notifs);updateDots();_discoverTab='projects';navigate('discover')}
function viewApplicants(pid){var projs=DB.get('projects');var p=projs.find(function(x){return x.id===pid});if(!p||!p.applicants||!p.applicants.length){toast('Hələ müraciət yoxdur.','info');return}var list=p.applicants.map(function(a){var u=getUser(a.userId);if(!u)return'';return '<div class="flex items-center gap-3 p-3 rounded-xl bg-white/[.02] border border-white/5">'+avatarHtml(u,'sm')+'<div class="flex-1 min-w-0"><div class="text-sm font-medium">'+u.name+'</div><p class="text-[11px] text-neutral-500 truncate">'+a.msg+'</p></div><button onclick="acceptApplicant(\''+pid+'\',\''+a.userId+'\')" class="btn-secondary btn-xs">Qəbul Et</button></div>'}).filter(Boolean).join('');openModal('<div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold">Müraciətlər ('+p.applicants.length+')</h3><button onclick="closeModal()" class="text-neutral-500 hover:text-white"><iconify-icon icon="mdi:close" class="text-xl"></iconify-icon></button></div><div class="space-y-3">'+list+'</div>')}
function acceptApplicant(pid,userId){var notifs=DB.get('notifications');notifs.push({id:uid(),userId:userId,type:'project_accepted',text:'Müraciətiniz qəbul edildi!',read:false,ts:Date.now()});DB.set('notifications',notifs);var conns=DB.get('connections');if(!conns.find(function(c){return(c.from===currentUser.id&&c.to===userId)||(c.from===userId&&c.to===currentUser.id)})){conns.push({id:uid(),from:currentUser.id,to:userId,status:'accepted',ts:Date.now()});DB.set('connections',conns)}closeModal();toast('✅ Müraciət qəbul edildi!','success')}
function openProjectDetail(pid){if(!auth())return navigate('login');var p=DB.get('projects').find(function(x){return x.id===pid});if(!p)return;var a=getUser(p.authorId);var isMine=p.authorId===currentUser.id;openModal('<div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold">'+p.title+'</h3><button onclick="closeModal()" class="text-neutral-500 hover:text-white"><iconify-icon icon="mdi:close" class="text-xl"></iconify-icon></button></div><div class="space-y-4"><div class="flex items-center gap-3">'+avatarHtml(a||currentUser,'sm')+'<div><div class="text-sm font-medium">'+(a?a.name:'Naməlum')+'</div><div class="text-[11px] text-neutral-500">'+p.team+'</div></div></div><p class="text-sm text-neutral-300 font-light leading-relaxed">'+p.desc+'</p><div class="flex flex-wrap gap-2">'+p.skills.map(function(s){return '<span class="skill-tag">'+s+'</span>'}).join('')+'</div><div class="text-xs text-neutral-500">'+(p.applicants||[]).length+' müraciət</div>'+(isMine?'':'<button onclick="closeModal();applyProject(\''+p.id+'\')" class="btn-secondary w-full text-center">Müraciət Et</button>')+'</div>')}

// ====================== CONNECTIONS ======================
function sendConn(toId){if(toId===currentUser.id)return;var conns=DB.get('connections');if(conns.find(function(c){return c.from===currentUser.id&&c.to===toId})){toast('Artıq tələb göndərilib.','info');return}var connId=uid();conns.push({id:connId,from:currentUser.id,to:toId,status:'pending',ts:Date.now()});DB.set('connections',conns);var notifs=DB.get('notifications');notifs.push({id:uid(),userId:toId,type:'connection',text:currentUser.name+' sənə əlaqə tələbi göndərdi.',read:false,ts:Date.now(),fromId:currentUser.id,connId:connId});DB.set('notifications',notifs);toast('✅ Əlaqə tələbi göndərildi!','success');navigate(currentRoute)}

// ====================== NOTIFICATIONS ======================
function renderNotifications(){
    var notifs=DB.get('notifications').filter(function(n){return n.userId===currentUser.id}).sort(function(a,b){return b.ts-a.ts});
    var all=DB.get('notifications');all.forEach(function(n){if(n.userId===currentUser.id)n.read=true});DB.set('notifications',all);updateDots();
    if(!notifs.length)return '<div class="mb-6 anim-up"><h1 class="text-2xl font-semibold mb-1">'+t('notifTitle')+'</h1></div><div class="text-center py-20 anim-up"><div class="w-20 h-20 rounded-full bg-white/[.03] flex items-center justify-center mx-auto mb-4"><iconify-icon icon="mdi:bell-off-outline" class="text-4xl text-neutral-700"></iconify-icon></div><p class="text-neutral-500 text-sm mb-2">'+t('noNotifLong')+'</p><p class="text-neutral-600 text-xs">'+t('noNotifSub')+'</p></div>';
    return '<div class="mb-6 anim-up"><h1 class="text-2xl font-semibold mb-1">'+t('notifTitle')+'</h1><p class="text-sm text-neutral-400 font-light">'+notifs.length+' '+t('notifTitle').toLowerCase()+'</p></div><div class="space-y-2">'+notifs.map(function(n,i){
        var icon='mdi:bell',color='text-neutral-400',action='';
        if(n.type==='connection'){icon='mdi:account-plus-outline';color='text-brand-400';var conn=DB.get('connections').find(function(c){return c.id===n.connId});if(conn&&conn.status==='pending'){action='<button onclick="acceptConn(\''+n.connId+'\')" class="btn-secondary btn-xs ml-2">Qəbul Et</button>'}}
        if(n.type==='message'){icon='mdi:message-outline';color='text-cyan-400';action='<button onclick="startChat(\''+n.fromId+'\');navigate(\'chat\')" class="btn-outline btn-xs ml-2">Cavab</button>'}
        if(n.type==='project_apply'){icon='mdi:folder-star-outline';color='text-amber-400';action='<button onclick="viewApplicants(\''+n.projectId+'\')" class="btn-outline btn-xs ml-2">Bax</button>'}
        if(n.type==='project_accepted'){icon='mdi:check-circle-outline';color='text-green-400'}
        if(n.type==='connection_accepted'){icon='mdi:handshake-outline';color='text-green-400'}
        return '<div class="glass-card rounded-xl p-4 flex items-start gap-3 anim-up" style="animation-delay:'+(i*0.04)+'s"><div class="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5"><iconify-icon icon="'+icon+'" class="'+color+' text-lg"></iconify-icon></div><div class="flex-1 min-w-0"><p class="text-sm text-neutral-300 font-light">'+n.text+'</p><span class="text-[10px] text-neutral-600">'+timeAgo(n.ts)+'</span></div>'+action+'</div>';
    }).join('')+'</div>';
}
function acceptConn(connId){var conns=DB.get('connections');var c=conns.find(function(x){return x.id===connId});if(c){c.status='accepted';DB.set('connections',conns);var notifs=DB.get('notifications');notifs.push({id:uid(),userId:c.from,type:'connection_accepted',text:currentUser.name+' əlaqə tələbinizi qəbul etdi!',read:false,ts:Date.now()});DB.set('notifications',notifs);toast('✅ Əlaqə qəbul edildi!','success');navigate('notifications')}}

// ====================== LOGIN / REGISTER ======================
function renderLoginPage(){return '<div class="flex items-center justify-center min-h-[70vh]"><div class="w-full max-w-sm anim-up"><div class="text-center mb-8"><div class="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto mb-4"><iconify-icon icon="mdi:link-variant" class="text-white text-2xl"></iconify-icon></div><h1 class="text-xl font-semibold">'+t('loginTitle')+'</h1><p class="text-sm text-neutral-400 font-light mt-1">'+t('loginSub')+'</p></div><form onsubmit="doLogin(event)" class="space-y-4"><div><label class="text-xs text-neutral-400 mb-1 block">'+t('email')+'</label><input name="email" type="email" class="input-field" placeholder="email@example.com" required></div><div><label class="text-xs text-neutral-400 mb-1 block">'+t('password')+'</label><input name="password" type="password" class="input-field" placeholder="••••••••" required></div><button type="submit" class="btn-primary w-full text-center">'+t('loginBtn')+'</button></form><p class="text-center text-xs text-neutral-500 mt-5">'+t('noAccount')+' <a href="#" onclick="navigate(\'register\')" class="text-brand-400 hover:underline">'+t('register')+'</a></p><div class="mt-4 p-3 rounded-lg bg-white/[.02] border border-white/5"><p class="text-[10px] text-neutral-600 text-center">Demo: <span class="text-neutral-400">ayxan@test.com</span> / <span class="text-neutral-400">12345678</span></p></div></div></div>'}
function renderRegisterPage(){return '<div class="flex items-center justify-center min-h-[70vh]"><div class="w-full max-w-sm anim-up"><div class="text-center mb-8"><div class="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto mb-4"><iconify-icon icon="mdi:link-variant" class="text-white text-2xl"></iconify-icon></div><h1 class="text-xl font-semibold">'+t('registerTitle')+'</h1><p class="text-sm text-neutral-400 font-light mt-1">'+t('registerSub')+'</p></div><form onsubmit="doRegister(event)" class="space-y-4"><div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-neutral-400 mb-1 block">'+t('name')+'</label><input name="name" class="input-field" placeholder="'+t('name')+'" required></div><div><label class="text-xs text-neutral-400 mb-1 block">'+t('surname')+'</label><input name="surname" class="input-field" placeholder="'+t('surname')+'" required></div></div><div><label class="text-xs text-neutral-400 mb-1 block">'+t('email')+'</label><input name="email" type="email" class="input-field" placeholder="email@example.com" required></div><div><label class="text-xs text-neutral-400 mb-1 block">'+t('password')+'</label><input name="password" type="password" class="input-field" placeholder="Minimum 8" required minlength="8"></div><div><label class="text-xs text-neutral-400 mb-1 block">'+t('university')+'</label><select name="university" class="input-field" required><option value="">Seçin...</option><option>ADA Universiteti</option><option>BDU</option><option>ASOIU</option><option>ATU</option><option>ADNSU</option><option>UNEC</option><option>AMSİU</option><option>Universitet oxumur</option><option>Digər</option></select></div><div><label class="text-xs text-neutral-400 mb-1 block">'+t('field')+'</label><input name="field" class="input-field" placeholder="'+t('field')+'..."></div><div><label class="text-xs text-neutral-400 mb-1 block">'+t('level')+'</label><select name="level" class="input-field"><option>'+t('beginner')+'</option><option>'+t('intermediate')+'</option><option>'+t('advanced')+'</option></select></div><button type="submit" class="btn-secondary w-full text-center">'+t('registerBtn')+'</button></form><p class="text-center text-xs text-neutral-500 mt-5">'+t('hasAccount')+' <a href="#" onclick="navigate(\'login\')" class="text-brand-400 hover:underline">'+t('login')+'</a></p></div></div>'}

// ====================== INIT ======================
var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:0.1});
function initScrollObs(){document.querySelectorAll('.section-fade').forEach(function(el){obs.observe(el)})}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal()});
document.addEventListener('click',function(e){
    if(document.getElementById('bellWrap') && !document.getElementById('bellWrap').contains(e.target)){var nd=document.getElementById('notifDrop');if(nd)nd.classList.add('hidden')}
    if(document.getElementById('settingsWrap') && !document.getElementById('settingsWrap').contains(e.target)){var sd=document.getElementById('settingsDrop');if(sd)sd.classList.add('hidden')}
});

// ====================== LANGUAGE ======================
var LANGS = {
    az: {
        code:'AZ', flag:'🇦🇿', name:'Azərbaycan',
        // Nav
        dashboard:'Dashboard', discover:'Kəşf Et', share:'Paylaş', messages:'Mesajlar',
        profile:'Profil', settings:'Ayarlar', language:'Dil', lightMode:'Açıq Mod', darkMode:'Qaranlıq Mod',
        help:'Kömək', liked:'Bəyəndiklərim', logout:'Çıxış',
        notifications:'Bildirimlər', viewAll:'Hamısına Bax', noNotif:'Bildirim yoxdur',
        home:'Ana', explore:'Kəşf',
        // Dashboard
        everyone:'Hamı', following:'İzlədiklərim', noPostsFollowing:'Hələ heç kimi izləmirsən və ya izlədiklərin nəsə paylaşmayıb.', noPosts:'Heç bir paylaşım tapılmadı.',
        profileCompletion:'Profil Tamamlanması', edit:'Düzəlt', allSeen:'— Hamısına baxdın —',
        // Post
        editPost:'Post Redaktə Et', deletePost:'Postu Sil', deletePostConfirm:'Bu əməliyyat geri qaytarıla bilməz.',
        cancel:'Ləğv Et', save:'Yadda Saxla', delete:'Sil', type:'Növ', description:'Açıqlama',
        design:'Dizayn', code:'Kod', project:'Layihə', other:'Digər',
        designPlaceholder:'Dizayn əsəri', codePlaceholder:'Kod / Layihə', projectPlaceholder:'Layihə nəticəsi', otherPlaceholder:'Paylaşım',
        comments:'Şərhlər', noComments:'Hələ şərh yoxdur. İlk şərhi sən yaz!', commentPlaceholder:'Şərh yaz...',
        reply:'Yanıtla', replyingTo:'şərhinə yanıt verilir', hideReplies:'Yanıtları gizlə', seeReplies:'yanıtı gör',
        // Discover
        people:'İnsanlar', projects:'Layihələr',
        discoverTitle:'Kəşf Et', discoverSubPeople:'Bacarıqlı insanları tap və əlaqə qur.', discoverSubProjects:'Yığılan komandalara qoşul və ya öz layihəni yarat.',
        searchPlaceholder:'Bacarıq, ad, sahə axtar...', allLevels:'Bütün səviyyələr', allFields:'Bütün sahələr',
        newest:'Ən Yeni', mostSkills:'Ən Çox Bacarıq', mostViewed:'Ən Çox Baxılıb',
        notFound:'Heç nə tapılmadı.', tryFilter:'Filterləri dəyişdirməyə çalış',
        noBio:'Bio əlavə edilməyib', profileBtn:'Profil',
        createProject:'Layihə Yarat', applyProject:'Müraciət Et', applied:'Göndərilib ✓',
        active:'Aktiv', completed:'Tamamlandı', applications:'Müraciətlər', editProject:'Layihəni Redaktə Et',
        // Profile
        myProfile:'Profilim', myPosts:'Paylaşımlarım', myLiked:'Bəyəndiklərim',
        followers:'İzləyici', followingCount:'İzlədiyi', posts:'Post',
        about:'Haqqında', skills:'Bacarıqlar', links:'Linklər', views:'profil baxışı',
        noBioOwn:'Hələ bio əlavə etməmisən.', noPostsOwn:'Hələ heç nə paylaşmamısan.', noLiked:'Hələ heç bir postu bəyənməmisən.',
        editProfile:'Redaktə Et', fullName:'Ad və Soyad', university:'Universitet', field:'Sahə',
        level:'Təcrübə Səviyyəsi', bio:'Bio', skillsLabel:'Bacarıqlar', linksLabel:'Linklər',
        beginner:'Başlanğıc', intermediate:'Orta', advanced:'Qabaqcıl',
        // User profile
        back:'Geri', follow:'İzlə', following2:'İzlənilir', sendMessage:'Mesaj Göndər', noPosts2:'Heç bir paylaşım yoxdur.',
        // Messages
        messagesTitle:'Mesajlar', conversations:'söhbət', noMessages:'Hələ heç bir söhbət yoxdur.',
        messagePlaceholder:'Mesaj yaz...', typeMessage:'Mesaj yazın...',
        // Notifications
        notifTitle:'Bildirimlər', noNotifLong:'Bildirim yoxdur', noNotifSub:'Yeni fəaliyyətlər burada görünəcək',
        // Login/Register
        loginTitle:'Xoş Gəldin', loginSub:'Hesabına daxil ol', email:'E-poçt', password:'Şifrə',
        loginBtn:'Daxil Ol', noAccount:'Hesabın yoxdur?', register:'Qeydiyyat',
        registerTitle:'Hesab Yarat', registerSub:'LinkUp-a qoşul', name:'Ad', surname:'Soyad',
        registerBtn:'Qeydiyyatdan Keç', hasAccount:'Artıq hesabın var?', login:'Daxil Ol',
        // New post
        newPost:'Yeni Paylaşım', photo:'Şəkil (opsional)', photoHint:'Şəkil seçin və ya buraxın', photoSize:'PNG, JPG (max 3MB)',
        captionLabel:'Açıqlama', captionPlaceholder:'Nə etdin? Nə qədər vaxt apardı? Nə alətlər istifadə etdin?',
        postBtn:'Paylaş',
        // Help
        helpTitle:'Kömək Mərkəzi', helpText:'Sualınız var? Bizimlə əlaqə saxlayın:', close:'Bağla'
    },
    tr: {
        code:'TR', flag:'🇹🇷', name:'Türkçe',
        dashboard:'Dashboard', discover:'Keşfet', share:'Paylaş', messages:'Mesajlar',
        profile:'Profil', settings:'Ayarlar', language:'Dil', lightMode:'Açık Mod', darkMode:'Karanlık Mod',
        help:'Yardım', liked:'Beğendiklerim', logout:'Çıkış',
        notifications:'Bildirimler', viewAll:'Tümünü Gör', noNotif:'Bildirim yok',
        home:'Ana', explore:'Keşif',
        everyone:'Herkes', following:'Takip Ettiklerim', noPostsFollowing:'Henüz kimseyi takip etmiyorsun veya takip ettiklerin paylaşım yapmadı.', noPosts:'Hiç paylaşım bulunamadı.',
        profileCompletion:'Profil Tamamlanması', edit:'Düzenle', allSeen:'— Hepsini gördün —',
        editPost:'Gönderiyi Düzenle', deletePost:'Gönderiyi Sil', deletePostConfirm:'Bu işlem geri alınamaz.',
        cancel:'İptal', save:'Kaydet', delete:'Sil', type:'Tür', description:'Açıklama',
        design:'Tasarım', code:'Kod', project:'Proje', other:'Diğer',
        designPlaceholder:'Tasarım eseri', codePlaceholder:'Kod / Proje', projectPlaceholder:'Proje sonucu', otherPlaceholder:'Paylaşım',
        comments:'Yorumlar', noComments:'Henüz yorum yok. İlk yorumu sen yaz!', commentPlaceholder:'Yorum yaz...',
        reply:'Yanıtla', replyingTo:'yorumuna yanıt veriliyor', hideReplies:'Yanıtları gizle', seeReplies:'yanıtı gör',
        people:'İnsanlar', projects:'Projeler',
        discoverTitle:'Keşfet', discoverSubPeople:'Yetenekli insanları bul ve bağlantı kur.', discoverSubProjects:'Takımlara katıl veya kendi projenizi oluşturun.',
        searchPlaceholder:'Beceri, isim, alan ara...', allLevels:'Tüm seviyeler', allFields:'Tüm alanlar',
        newest:'En Yeni', mostSkills:'En Çok Beceri', mostViewed:'En Çok Görüntülenen',
        notFound:'Hiçbir şey bulunamadı.', tryFilter:'Filtreleri değiştirmeyi dene',
        noBio:'Bio eklenmemiş', profileBtn:'Profil',
        createProject:'Proje Oluştur', applyProject:'Başvur', applied:'Gönderildi ✓',
        active:'Aktif', completed:'Tamamlandı', applications:'Başvurular', editProject:'Projeyi Düzenle',
        myProfile:'Profilim', myPosts:'Paylaşımlarım', myLiked:'Beğendiklerim',
        followers:'Takipçi', followingCount:'Takip Edilen', posts:'Gönderi',
        about:'Hakkında', skills:'Beceriler', links:'Bağlantılar', views:'profil görüntülemesi',
        noBioOwn:'Henüz bio eklemedin.', noPostsOwn:'Henüz hiçbir şey paylaşmadın.', noLiked:'Henüz hiçbir gönderiyi beğenmedin.',
        editProfile:'Düzenle', fullName:'Ad ve Soyad', university:'Üniversite', field:'Alan',
        level:'Deneyim Seviyesi', bio:'Bio', skillsLabel:'Beceriler', linksLabel:'Bağlantılar',
        beginner:'Başlangıç', intermediate:'Orta', advanced:'İleri',
        back:'Geri', follow:'Takip Et', following2:'Takip Ediliyor', sendMessage:'Mesaj Gönder', noPosts2:'Hiç paylaşım yok.',
        messagesTitle:'Mesajlar', conversations:'sohbet', noMessages:'Henüz hiç sohbet yok.',
        messagePlaceholder:'Mesaj yaz...', typeMessage:'Mesaj yazın...',
        notifTitle:'Bildirimler', noNotifLong:'Bildirim yok', noNotifSub:'Yeni etkinlikler burada görünecek',
        loginTitle:'Hoş Geldin', loginSub:'Hesabına giriş yap', email:'E-posta', password:'Şifre',
        loginBtn:'Giriş Yap', noAccount:'Hesabın yok mu?', register:'Kayıt Ol',
        registerTitle:'Hesap Oluştur', registerSub:"LinkUp'a katıl", name:'Ad', surname:'Soyad',
        registerBtn:'Kayıt Ol', hasAccount:'Zaten hesabın var mı?', login:'Giriş Yap',
        newPost:'Yeni Paylaşım', photo:'Fotoğraf (opsiyonel)', photoHint:'Fotoğraf seç veya bırak', photoSize:'PNG, JPG (max 3MB)',
        captionLabel:'Açıklama', captionPlaceholder:'Ne yaptın? Ne kadar sürdü? Hangi araçları kullandın?',
        postBtn:'Paylaş',
        helpTitle:'Yardım Merkezi', helpText:'Sorunuz mu var? Bizimle iletişime geçin:', close:'Kapat'
    },
    en: {
        code:'EN', flag:'🇬🇧', name:'English',
        dashboard:'Dashboard', discover:'Discover', share:'Share', messages:'Messages',
        profile:'Profile', settings:'Settings', language:'Language', lightMode:'Light Mode', darkMode:'Dark Mode',
        help:'Help', liked:'Liked Posts', logout:'Logout',
        notifications:'Notifications', viewAll:'View All', noNotif:'No notifications',
        home:'Home', explore:'Explore',
        everyone:'Everyone', following:'Following', noPostsFollowing:"You don't follow anyone yet or they haven't posted.", noPosts:'No posts found.',
        profileCompletion:'Profile Completion', edit:'Edit', allSeen:'— You saw everything —',
        editPost:'Edit Post', deletePost:'Delete Post', deletePostConfirm:'This action cannot be undone.',
        cancel:'Cancel', save:'Save', delete:'Delete', type:'Type', description:'Description',
        design:'Design', code:'Code', project:'Project', other:'Other',
        designPlaceholder:'Design work', codePlaceholder:'Code / Project', projectPlaceholder:'Project result', otherPlaceholder:'Post',
        comments:'Comments', noComments:'No comments yet. Be the first!', commentPlaceholder:'Write a comment...',
        reply:'Reply', replyingTo:'replying to', hideReplies:'Hide replies', seeReplies:'replies',
        people:'People', projects:'Projects',
        discoverTitle:'Discover', discoverSubPeople:'Find talented people and connect.', discoverSubProjects:'Join teams or create your own project.',
        searchPlaceholder:'Search skill, name, field...', allLevels:'All levels', allFields:'All fields',
        newest:'Newest', mostSkills:'Most Skills', mostViewed:'Most Viewed',
        notFound:'Nothing found.', tryFilter:'Try changing the filters',
        noBio:'No bio added', profileBtn:'Profile',
        createProject:'Create Project', applyProject:'Apply', applied:'Sent ✓',
        active:'Active', completed:'Completed', applications:'Applications', editProject:'Edit Project',
        myProfile:'My Profile', myPosts:'My Posts', myLiked:'Liked Posts',
        followers:'Followers', followingCount:'Following', posts:'Posts',
        about:'About', skills:'Skills', links:'Links', views:'profile views',
        noBioOwn:"You haven't added a bio yet.", noPostsOwn:"You haven't shared anything yet.", noLiked:"You haven't liked any posts yet.",
        editProfile:'Edit', fullName:'Full Name', university:'University', field:'Field',
        level:'Experience Level', bio:'Bio', skillsLabel:'Skills', linksLabel:'Links',
        beginner:'Beginner', intermediate:'Intermediate', advanced:'Advanced',
        back:'Back', follow:'Follow', following2:'Following', sendMessage:'Send Message', noPosts2:'No posts yet.',
        messagesTitle:'Messages', conversations:'conversations', noMessages:'No conversations yet.',
        messagePlaceholder:'Write a message...', typeMessage:'Type a message...',
        notifTitle:'Notifications', noNotifLong:'No notifications', noNotifSub:'New activity will appear here',
        loginTitle:'Welcome Back', loginSub:'Sign in to your account', email:'Email', password:'Password',
        loginBtn:'Sign In', noAccount:"Don't have an account?", register:'Sign Up',
        registerTitle:'Create Account', registerSub:'Join LinkUp', name:'First Name', surname:'Last Name',
        registerBtn:'Sign Up', hasAccount:'Already have an account?', login:'Sign In',
        newPost:'New Post', photo:'Photo (optional)', photoHint:'Select or drop a photo', photoSize:'PNG, JPG (max 3MB)',
        captionLabel:'Caption', captionPlaceholder:'What did you make? How long did it take? What tools did you use?',
        postBtn:'Post',
        helpTitle:'Help Center', helpText:'Have a question? Contact us:', close:'Close'
    },
    ru: {
        code:'RU', flag:'🇷🇺', name:'Русский',
        dashboard:'Главная', discover:'Обзор', share:'Поделиться', messages:'Сообщения',
        profile:'Профиль', settings:'Настройки', language:'Язык', lightMode:'Светлый', darkMode:'Тёмный',
        help:'Помощь', liked:'Понравилось', logout:'Выйти',
        notifications:'Уведомления', viewAll:'Все', noNotif:'Нет уведомлений',
        home:'Главная', explore:'Обзор',
        everyone:'Все', following:'Подписки', noPostsFollowing:'Вы ни на кого не подписаны или они ничего не публиковали.', noPosts:'Публикации не найдены.',
        profileCompletion:'Заполненность профиля', edit:'Изменить', allSeen:'— Вы всё просмотрели —',
        editPost:'Редактировать пост', deletePost:'Удалить пост', deletePostConfirm:'Это действие нельзя отменить.',
        cancel:'Отмена', save:'Сохранить', delete:'Удалить', type:'Тип', description:'Описание',
        design:'Дизайн', code:'Код', project:'Проект', other:'Другое',
        designPlaceholder:'Дизайн-работа', codePlaceholder:'Код / Проект', projectPlaceholder:'Результат проекта', otherPlaceholder:'Публикация',
        comments:'Комментарии', noComments:'Комментариев пока нет. Будьте первым!', commentPlaceholder:'Написать комментарий...',
        reply:'Ответить', replyingTo:'ответ на комментарий', hideReplies:'Скрыть ответы', seeReplies:'ответов',
        people:'Люди', projects:'Проекты',
        discoverTitle:'Обзор', discoverSubPeople:'Найдите талантливых людей и установите связь.', discoverSubProjects:'Присоединяйтесь к командам или создайте свой проект.',
        searchPlaceholder:'Поиск по навыку, имени, области...', allLevels:'Все уровни', allFields:'Все области',
        newest:'Новейшие', mostSkills:'Больше навыков', mostViewed:'Больше просмотров',
        notFound:'Ничего не найдено.', tryFilter:'Попробуйте изменить фильтры',
        noBio:'Биография не добавлена', profileBtn:'Профиль',
        createProject:'Создать проект', applyProject:'Подать заявку', applied:'Отправлено ✓',
        active:'Активный', completed:'Завершён', applications:'Заявки', editProject:'Редактировать проект',
        myProfile:'Мой профиль', myPosts:'Мои публикации', myLiked:'Понравилось',
        followers:'Подписчики', followingCount:'Подписки', posts:'Публикации',
        about:'О себе', skills:'Навыки', links:'Ссылки', views:'просмотров профиля',
        noBioOwn:'Вы ещё не добавили биографию.', noPostsOwn:'Вы ещё ничего не публиковали.', noLiked:'Вы ещё не лайкали публикации.',
        editProfile:'Редактировать', fullName:'Имя и Фамилия', university:'Университет', field:'Область',
        level:'Уровень опыта', bio:'Биография', skillsLabel:'Навыки', linksLabel:'Ссылки',
        beginner:'Начинающий', intermediate:'Средний', advanced:'Продвинутый',
        back:'Назад', follow:'Подписаться', following2:'Подписан', sendMessage:'Отправить сообщение', noPosts2:'Публикаций нет.',
        messagesTitle:'Сообщения', conversations:'бесед', noMessages:'Бесед пока нет.',
        messagePlaceholder:'Написать сообщение...', typeMessage:'Введите сообщение...',
        notifTitle:'Уведомления', noNotifLong:'Уведомлений нет', noNotifSub:'Новая активность появится здесь',
        loginTitle:'Добро пожаловать', loginSub:'Войдите в свой аккаунт', email:'Эл. почта', password:'Пароль',
        loginBtn:'Войти', noAccount:'Нет аккаунта?', register:'Зарегистрироваться',
        registerTitle:'Создать аккаунт', registerSub:'Присоединиться к LinkUp', name:'Имя', surname:'Фамилия',
        registerBtn:'Зарегистрироваться', hasAccount:'Уже есть аккаунт?', login:'Войти',
        newPost:'Новая публикация', photo:'Фото (необязательно)', photoHint:'Выберите или перетащите фото', photoSize:'PNG, JPG (макс 3МБ)',
        captionLabel:'Описание', captionPlaceholder:'Что вы сделали? Сколько времени заняло? Какие инструменты использовали?',
        postBtn:'Опубликовать',
        helpTitle:'Центр помощи', helpText:'Есть вопросы? Свяжитесь с нами:', close:'Закрыть'
    }
};

var _currentLang = localStorage.getItem('lu_lang') || 'az';
function t(key){ return (LANGS[_currentLang] && LANGS[_currentLang][key]) || LANGS['az'][key] || key }

function applyLang(){
    var l = LANGS[_currentLang];
    // Nav links
    document.querySelectorAll('[data-nav]').forEach(function(a){
        var k = a.dataset.nav;
        if(k==='dashboard') a.innerHTML = '<iconify-icon icon="mdi:view-dashboard-outline" class="mr-1"></iconify-icon>'+l.dashboard;
        if(k==='discover') a.innerHTML = '<iconify-icon icon="mdi:compass-outline" class="mr-1"></iconify-icon>'+l.discover;
        if(k==='messages') a.innerHTML = '<iconify-icon icon="mdi:message-outline" class="mr-1"></iconify-icon>'+l.messages+'<span id="msgDot" class="notif-dot hidden"></span>';
    });
    // Mobile nav labels
    document.querySelectorAll('[data-mnav]').forEach(function(b){
        var k = b.dataset.mnav;
        var span = b.querySelector('span');
        if(!span) return;
        if(k==='dashboard') span.textContent = l.home;
        if(k==='discover') span.textContent = l.explore;
        if(k==='messages') span.textContent = l.messages;
        if(k==='profile') span.textContent = l.profile;
    });
    // Lang badge
    var langBadge = document.getElementById('langBadge');
    if(langBadge) langBadge.textContent = l.code;
    updateDots();
}

function changeLanguage(){
    toggleSettingsDrop();
    var current = _currentLang;
    var html = '<div>'+
        '<div class="flex items-center justify-between mb-5">'+
            '<h3 class="text-base font-semibold">'+t('language')+'</h3>'+
            '<button onclick="closeModal()" class="text-neutral-500 hover:text-white"><iconify-icon icon="mdi:close" class="text-xl"></iconify-icon></button>'+
        '</div>'+
        '<div class="space-y-2">'+
        Object.keys(LANGS).map(function(k){
            var l = LANGS[k];
            var isActive = k === current;
            return '<button onclick="setLang(\''+k+'\')" class="w-full flex items-center justify-between p-3 rounded-xl border transition-all '+(isActive?'border-brand-500/40 bg-brand-500/10':'border-white/8 bg-white/[.02] hover:bg-white/5')+'">'+
                '<div class="flex items-center gap-3">'+
                    '<span class="text-xl">'+l.flag+'</span>'+
                    '<div class="text-left"><div class="text-sm font-medium">'+l.name+'</div><div class="text-[10px] text-neutral-500">'+l.code+'</div></div>'+
                '</div>'+
                (isActive ? '<iconify-icon icon="mdi:check-circle" class="text-brand-400 text-lg"></iconify-icon>' : '')+
            '</button>';
        }).join('')+
        '</div></div>';
    openModal(html);
}

function setLang(code){
    _currentLang = code;
    localStorage.setItem('lu_lang', code);
    closeModal();
    applyLang();
    var l = LANGS[code];
    toast(l.flag+' '+l.name+' seçildi','success');
    // Re-render current page to apply language
    navigate(currentRoute);
}

// ====================== SETTINGS ======================
function toggleSettingsDrop(){var d=document.getElementById('settingsDrop');if(d)d.classList.toggle('hidden')}
function toggleTheme(){
    document.body.classList.toggle('light-mode');
    var isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('lu_theme', isLight ? 'light' : 'dark');
    toast(isLight ? '☀️ '+t('lightMode')+' aktiv edildi' : '🌙 '+t('darkMode')+' aktiv edildi', 'info');
    var tt = document.getElementById('themeText'); if(tt) tt.innerText = isLight ? t('darkMode') : t('lightMode');
    var ti = document.getElementById('themeIcon'); if(ti) ti.setAttribute('icon', isLight ? 'mdi:weather-night' : 'mdi:weather-sunny');
    toggleSettingsDrop();
}
function showHelp(){
    openModal('<div class="text-center"><iconify-icon icon="mdi:help-circle-outline" class="text-4xl text-brand-400 mb-4"></iconify-icon><h3 class="text-lg font-semibold mb-2">'+t('helpTitle')+'</h3><p class="text-sm text-neutral-400 mb-6">'+t('helpText')+'<br><a href="mailto:support@linkup.az" class="text-brand-400 hover:underline mt-2 inline-block">support@linkup.az</a></p><button onclick="closeModal()" class="btn-primary w-full max-w-[150px] mx-auto">'+t('close')+'</button></div>');
    toggleSettingsDrop();
}

// ====================== FOLLOW SYSTEM ======================
function toggleFollow(e, targetId){
    if(e) e.stopPropagation();
    if(!currentUser) return navigate('login');
    var users = DB.get('users');
    var meIdx = users.findIndex(function(u){return u.id === currentUser.id});
    var targetIdx = users.findIndex(function(u){return u.id === targetId});
    if(meIdx === -1 || targetIdx === -1) return;

    if(!users[meIdx].following) users[meIdx].following = [];
    if(!users[targetIdx].followers) users[targetIdx].followers = [];

    var isFollowing = users[meIdx].following.indexOf(targetId) !== -1;
    if(isFollowing){
        users[meIdx].following = users[meIdx].following.filter(function(id){return id !== targetId});
        users[targetIdx].followers = users[targetIdx].followers.filter(function(id){return id !== currentUser.id});
        toast('İzləmə dayandırıldı','info');
    } else {
        users[meIdx].following.push(targetId);
        users[targetIdx].followers.push(currentUser.id);
        toast('İzlənilir ✓','success');
        // Notification
        var notifs = DB.get('notifications');
        notifs.push({id:uid(),userId:targetId,type:'follow',text:currentUser.name+' səni izləməyə başladı',read:false,ts:Date.now(),fromId:currentUser.id});
        DB.set('notifications',notifs);updateDots();
    }
    DB.set('users',users);
    currentUser = users[meIdx];
    navigate(currentRoute);
}

function viewFollowList(userId, type){
    var u = getUser(userId);
    if(!u) return;
    var list = (type === 'followers' ? (u.followers||[]) : (u.following||[]));
    var title = (type === 'followers' ? 'İzləyicilər' : 'İzlədikləri');
    
    var html = '<div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold">'+title+' ('+list.length+')</h3><button onclick="closeModal()" class="text-neutral-500 hover:text-white"><iconify-icon icon="mdi:close" class="text-xl"></iconify-icon></button></div>';
    
    if(!list.length){
        html += '<div class="text-center py-10 text-neutral-600 text-sm">Hələ heç kim yoxdur.</div>';
    } else {
        html += '<div class="space-y-4">' + list.map(function(oid){
            var ou = getUser(oid);
            if(!ou) return '';
            var isMe = ou.id === currentUser.id;
            var isFollowing = currentUser.following && currentUser.following.indexOf(ou.id) !== -1;
            var actionBtn = isMe ? '' : (isFollowing ? '<button onclick="toggleFollow(event,\''+ou.id+'\')" class="btn-outline btn-xs">İzlənilir</button>' : '<button onclick="toggleFollow(event,\''+ou.id+'\')" class="btn-secondary btn-xs">İzlə</button>');
            
            return '<div class="flex items-center justify-between gap-3">' +
                '<div class="flex items-center gap-3 cursor-pointer" onclick="closeModal();window._viewUser=\''+ou.id+'\';navigate(\'user\')">' + 
                    avatarHtml(ou,'sm') + 
                    '<div class="min-w-0 flex-1"><div class="text-sm font-medium truncate">'+ou.name+'</div><div class="text-[10px] text-neutral-500 truncate">'+ou.field+'</div></div>' +
                '</div>' +
                actionBtn +
            '</div>';
        }).join('') + '</div>';
    }
    openModal(html);
}

seedIfEmpty();initScrollObs();
if(localStorage.getItem('lu_theme')==='light') document.body.classList.add('light-mode');
// Check token and load current user, then navigate
(async function(){
    if (API._token) {
        var r = await API.getMe()
        if (r.data) { currentUser = normalizeUser(r.data); navigate('dashboard') }
        else { API.setToken(null); navigate('landing') }
    } else {
        navigate('landing')
    }
})();