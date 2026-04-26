// ====================== LOCAL STORAGE DB ======================
var DB = {
    get: function(k) { try { return JSON.parse(localStorage.getItem('lu_' + k)) || [] } catch(e) { return [] } },
    set: function(k, v) { localStorage.setItem('lu_' + k, JSON.stringify(v)) },
    getOne: function(k) { try { return JSON.parse(localStorage.getItem('lu_' + k)) } catch(e) { return null } },
    setOne: function(k, v) { localStorage.setItem('lu_' + k, JSON.stringify(v)) }
};

// ====================== FAKE API (localStorage-based) ======================
var API = (function(){
    var _token = localStorage.getItem('lu_token') || null;

    function ok(data)  { return Promise.resolve({ data: data }) }
    function err(msg)  { return Promise.resolve({ error: msg }) }
    function uid()     { return Date.now().toString(36) + Math.random().toString(36).slice(2,7) }

    function getMe() {
        var id = localStorage.getItem('lu_me');
        if (!id) return err('Not logged in');
        var u = DB.get('users').find(function(u){ return u.id === id });
        return u ? ok(toServer(u)) : err('User not found');
    }

    // Convert frontend user format to server-like format for normalizeUser()
    function toServer(u) {
        if (!u) return null;
        return {
            id: u.id, name: u.name, email: u.email,
            university: u.university || '', field: u.field || '',
            level: u.level || 'Başlanğıc', bio: u.bio || '',
            avatar: u.avatar || '', grad: u.grad || 'from-brand-500 to-purple-500',
            skills: u.skills || [], links: u.links || [],
            views: u.views || 0, followers: u.followers || [], following: u.following || [],
            onboarding_done: u.onboardingDone || false,
            created_at: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString()
        };
    }
    function toServerPost(p) {
        if (!p) return null;
        return {
            id: p.id, author_id: p.authorId, caption: p.caption,
            type: p.type || 'other', image: p.image || '',
            likes: p.likes || [],
            comments: (p.comments || []).map(function(c){
                return { id:c.id, user_id:c.userId, text:c.text, ts:c.ts, parent_id:c.parentId||null }
            }),
            created_at: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
        };
    }
    function toServerProject(p) {
        if (!p) return null;
        return {
            id: p.id, title: p.title, desc: p.desc, author_id: p.authorId,
            skills: p.skills || [], team: p.team || '', status: p.status || 'active',
            applicants: (p.applicants || []).map(function(a){
                return { user_id: a.userId, msg: a.msg, ts: a.ts }
            }),
            grad: p.grad || 'from-brand-500 to-purple-500',
            created_at: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
        };
    }
    function toServerMsg(m) {
        if (!m) return null;
        return { id:m.id, from_id:m.from, to_id:m.to, text:m.text, read:m.read, created_at: new Date(m.ts).toISOString() }
    }
    function toServerNotif(n) {
        if (!n) return null;
        return { id:n.id, user_id:n.userId, type:n.type, text:n.text, from_id:n.fromId, read:n.read, project_id:n.projectId||null, conn_id:n.connId||null, created_at: new Date(n.ts).toISOString() }
    }

    return {
        get _token() { return _token },

        setToken: function(t) {
            _token = t;
            if (t) localStorage.setItem('lu_token', t);
            else { localStorage.removeItem('lu_token'); localStorage.removeItem('lu_me'); }
        },

        // Auth
        register: function(body) {
            var users = DB.get('users');
            if (users.find(function(u){ return u.email === body.email }))
                return err('Bu e-poçt artıq qeydiyyatdan keçib');
            var GRADS = ['from-brand-500 to-purple-500','from-cyan-500 to-green-500','from-amber-500 to-rose-500','from-pink-500 to-brand-500','from-green-500 to-cyan-500','from-purple-500 to-pink-500'];
            var newUser = {
                id: uid(), name: body.name, email: body.email, pass: body.password,
                university: body.university || '', field: body.field || '',
                level: body.level || 'Başlanğıc', bio: '', avatar: '',
                grad: GRADS[Math.floor(Math.random()*GRADS.length)],
                skills: [], links: [], views: 0, followers: [], following: [],
                onboardingDone: false, createdAt: Date.now()
            };
            users.push(newUser);
            DB.set('users', users);
            localStorage.setItem('lu_me', newUser.id);
            _token = newUser.id;
            localStorage.setItem('lu_token', _token);
            return ok({ token: newUser.id, user: toServer(newUser) });
        },

        login: function(body) {
            var u = DB.get('users').find(function(u){ return u.email === body.email && u.pass === body.password });
            if (!u) return err('E-poçt və ya şifrə yanlışdır');
            localStorage.setItem('lu_me', u.id);
            _token = u.id;
            localStorage.setItem('lu_token', _token);
            return ok({ token: u.id, user: toServer(u) });
        },

        // Users
        getMe: getMe,

        getUsers: function() {
            var id = localStorage.getItem('lu_me');
            var users = DB.get('users').filter(function(u){ return u.id !== id });
            return ok(users.map(toServer));
        },

        getUser: function(id) {
            var users = DB.get('users');
            var idx = users.findIndex(function(u){ return u.id === id });
            if (idx === -1) return err('User not found');
            users[idx].views = (users[idx].views || 0) + 1;
            DB.set('users', users);
            return ok(toServer(users[idx]));
        },

        updateMe: function(body) {
            var myId = localStorage.getItem('lu_me');
            var users = DB.get('users');
            var idx = users.findIndex(function(u){ return u.id === myId });
            if (idx === -1) return err('Not found');
            var allowed = ['name','university','field','level','bio','avatar','skills','links','onboardingDone'];
            allowed.forEach(function(k){
                if (body[k] !== undefined) users[idx][k] = body[k];
                // also handle server-style key
                if (k === 'onboardingDone' && body['onboarding_done'] !== undefined) users[idx].onboardingDone = body['onboarding_done'];
            });
            DB.set('users', users);
            return ok(toServer(users[idx]));
        },

        followUser: function(targetId) {
            var myId = localStorage.getItem('lu_me');
            var users = DB.get('users');
            var meIdx = users.findIndex(function(u){ return u.id === myId });
            var tIdx  = users.findIndex(function(u){ return u.id === targetId });
            if (meIdx === -1 || tIdx === -1) return err('Not found');
            if (!users[meIdx].following) users[meIdx].following = [];
            if (!users[tIdx].followers)  users[tIdx].followers  = [];
            var isFollowing = users[meIdx].following.indexOf(targetId) !== -1;
            if (isFollowing) {
                users[meIdx].following = users[meIdx].following.filter(function(x){ return x !== targetId });
                users[tIdx].followers  = users[tIdx].followers.filter(function(x){ return x !== myId });
            } else {
                users[meIdx].following.push(targetId);
                users[tIdx].followers.push(myId);
                var notifs = DB.get('notifications');
                notifs.push({ id:uid(), userId:targetId, type:'follow', text:users[meIdx].name+' səni izləməyə başladı', fromId:myId, read:false, ts:Date.now() });
                DB.set('notifications', notifs);
            }
            DB.set('users', users);
            return ok({ following: !isFollowing });
        },

        // Posts
        getPosts: function() {
            return ok(DB.get('posts').map(toServerPost));
        },

        createPost: function(body) {
            var myId = localStorage.getItem('lu_me');
            var posts = DB.get('posts');
            var p = { id:uid(), authorId:myId, caption:body.caption, type:body.type||'other', image:body.image||'', likes:[], comments:[], createdAt:Date.now() };
            posts.unshift(p);
            DB.set('posts', posts);
            return ok(toServerPost(p));
        },

        updatePost: function(id, body) {
            var posts = DB.get('posts');
            var idx = posts.findIndex(function(p){ return p.id === id });
            if (idx === -1) return err('Not found');
            if (body.caption !== undefined) posts[idx].caption = body.caption;
            if (body.type    !== undefined) posts[idx].type    = body.type;
            DB.set('posts', posts);
            return ok(toServerPost(posts[idx]));
        },

        deletePost: function(id) {
            DB.set('posts', DB.get('posts').filter(function(p){ return p.id !== id }));
            return ok({ success: true });
        },

        likePost: function(id) {
            var myId = localStorage.getItem('lu_me');
            var posts = DB.get('posts');
            var idx = posts.findIndex(function(p){ return p.id === id });
            if (idx === -1) return err('Not found');
            var likes = posts[idx].likes || [];
            var liked = likes.indexOf(myId) !== -1;
            posts[idx].likes = liked ? likes.filter(function(x){ return x !== myId }) : likes.concat([myId]);
            DB.set('posts', posts);
            return ok(toServerPost(posts[idx]));
        },

        addComment: function(id, body) {
            var myId = localStorage.getItem('lu_me');
            var posts = DB.get('posts');
            var idx = posts.findIndex(function(p){ return p.id === id });
            if (idx === -1) return err('Not found');
            var c = { id:uid(), userId:myId, text:body.text, ts:Date.now(), parentId:body.parent_id||null };
            if (!posts[idx].comments) posts[idx].comments = [];
            posts[idx].comments.push(c);
            DB.set('posts', posts);
            // notification
            var targetId = body.parent_id
                ? (posts[idx].comments.find(function(x){ return x.id === body.parent_id }) || {}).userId
                : posts[idx].authorId;
            if (targetId && targetId !== myId) {
                var me = DB.get('users').find(function(u){ return u.id === myId });
                var notifs = DB.get('notifications');
                notifs.push({ id:uid(), userId:targetId, type:'comment', text:(me?me.name:'Biri')+(body.parent_id?' şərhinə cavab verdi':' postuna şərh yazdı')+': "'+body.text.slice(0,40)+'"', fromId:myId, read:false, ts:Date.now() });
                DB.set('notifications', notifs);
            }
            return ok(toServerPost(posts[idx]));
        },

        deleteComment: function(postId, commentId) {
            var posts = DB.get('posts');
            var idx = posts.findIndex(function(p){ return p.id === postId });
            if (idx === -1) return err('Not found');
            posts[idx].comments = (posts[idx].comments || []).filter(function(c){ return c.id !== commentId });
            DB.set('posts', posts);
            return ok(toServerPost(posts[idx]));
        },

        // Projects
        getProjects: function() {
            return ok(DB.get('projects').map(toServerProject));
        },

        createProject: function(body) {
            var myId = localStorage.getItem('lu_me');
            var GRADS = ['from-brand-500 to-purple-500','from-cyan-500 to-green-500','from-amber-500 to-rose-500','from-pink-500 to-brand-500','from-green-500 to-cyan-500','from-purple-500 to-pink-500'];
            var p = { id:uid(), title:body.title, desc:body.desc, authorId:myId, skills:body.skills||[], team:body.team||'3-5 nəfər', status:body.status||'active', applicants:[], grad:GRADS[Math.floor(Math.random()*GRADS.length)], createdAt:Date.now() };
            var projs = DB.get('projects');
            projs.unshift(p);
            DB.set('projects', projs);
            return ok(toServerProject(p));
        },

        updateProject: function(id, body) {
            var projs = DB.get('projects');
            var idx = projs.findIndex(function(p){ return p.id === id });
            if (idx === -1) return err('Not found');
            ['title','desc','skills','team','status'].forEach(function(k){ if(body[k]!==undefined) projs[idx][k]=body[k]; });
            DB.set('projects', projs);
            return ok(toServerProject(projs[idx]));
        },

        deleteProject: function(id) {
            DB.set('projects', DB.get('projects').filter(function(p){ return p.id !== id }));
            return ok({ success: true });
        },

        applyProject: function(id, body) {
            var myId = localStorage.getItem('lu_me');
            var projs = DB.get('projects');
            var idx = projs.findIndex(function(p){ return p.id === id });
            if (idx === -1) return err('Not found');
            if (!projs[idx].applicants) projs[idx].applicants = [];
            if (projs[idx].applicants.find(function(a){ return a.userId === myId }))
                return err('Already applied');
            projs[idx].applicants.push({ userId:myId, msg:body.msg||'', ts:Date.now() });
            DB.set('projects', projs);
            var me = DB.get('users').find(function(u){ return u.id === myId });
            var notifs = DB.get('notifications');
            notifs.push({ id:uid(), userId:projs[idx].authorId, type:'project_apply', text:(me?me.name:'Biri')+' "'+projs[idx].title+'" layihəsinə müraciət etdi.', fromId:myId, read:false, projectId:id, ts:Date.now() });
            DB.set('notifications', notifs);
            return ok(toServerProject(projs[idx]));
        },

        // Messages
        getMessages: function() {
            var myId = localStorage.getItem('lu_me');
            var msgs = DB.get('messages').filter(function(m){ return m.from === myId || m.to === myId });
            return ok(msgs.map(toServerMsg));
        },

        sendMessage: function(body) {
            var myId = localStorage.getItem('lu_me');
            var m = { id:uid(), from:myId, to:body.to_id, text:body.text, read:false, ts:Date.now() };
            var msgs = DB.get('messages');
            msgs.push(m);
            DB.set('messages', msgs);
            var me = DB.get('users').find(function(u){ return u.id === myId });
            var notifs = DB.get('notifications');
            notifs.push({ id:uid(), userId:body.to_id, type:'message', text:(me?me.name:'Biri')+' sənə mesaj göndərdi', fromId:myId, read:false, ts:Date.now() });
            DB.set('notifications', notifs);
            return ok(toServerMsg(m));
        },

        markRead: function(fromId) {
            var myId = localStorage.getItem('lu_me');
            var msgs = DB.get('messages').map(function(m){
                if (m.from === fromId && m.to === myId) m.read = true;
                return m;
            });
            DB.set('messages', msgs);
            return ok({ success: true });
        },

        // Notifications
        getNotifs: function() {
            var myId = localStorage.getItem('lu_me');
            var notifs = DB.get('notifications').filter(function(n){ return n.userId === myId });
            notifs.sort(function(a,b){ return b.ts - a.ts });
            return ok(notifs.map(toServerNotif));
        },

        readAllNotifs: function() {
            var myId = localStorage.getItem('lu_me');
            var notifs = DB.get('notifications').map(function(n){
                if (n.userId === myId) n.read = true;
                return n;
            });
            DB.set('notifications', notifs);
            return ok({ success: true });
        }
    };
})();
