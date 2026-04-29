import { supabase } from './supabaseClient';
import { DB, uid } from './db';

// Supabase formatını lokal formata çevir
const mapPost = (p) => ({
    id: p.id,
    authorId: p.author_id,
    caption: p.caption || '',
    image: p.image || '',
    type: p.type || 'other',
    metadata: p.metadata || {},
    likes: Array.isArray(p.likes) ? p.likes : [],
    comments: Array.isArray(p.comments) ? p.comments : [],
    createdAt: p.created_at,
});

// Lokal formatı Supabase formatına çevir
const mapPostToDb = (p) => ({
    id: p.id,
    author_id: p.authorId,
    caption: p.caption || '',
    image: p.image || '',
    type: p.type || 'other',
    metadata: p.metadata || {},
    likes: p.likes || [],
    comments: p.comments || [],
    created_at: p.createdAt || Date.now(),
});

export const postsService = {
    // Bütün postları çək
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            const posts = data.map(mapPost);
            DB.set('posts', posts);
            return posts;
        } catch (err) {
            console.error('postsService.getAll error:', err);
            return DB.get('posts');
        }
    },

    // Post yarat
    async create(postData) {
        const newPost = {
            id: 'post_' + uid(),
            authorId: postData.authorId,
            caption: postData.caption || '',
            image: postData.image || '',
            type: postData.type || 'other',
            metadata: postData.metadata || {},
            likes: [],
            comments: [],
            createdAt: Date.now(),
        };
        try {
            const { error } = await supabase
                .from('posts')
                .insert([mapPostToDb(newPost)]);
            if (error) throw error;
        } catch (err) {
            console.error('postsService.create error:', err);
        }
        // localStorage-a da yaz
        const posts = DB.get('posts');
        DB.set('posts', [newPost, ...posts]);
        return newPost;
    },

    // Post yenilə (caption, image)
    async update(postId, updates) {
        try {
            const dbUpdates = {};
            if (updates.caption !== undefined) dbUpdates.caption = updates.caption;
            if (updates.image !== undefined) dbUpdates.image = updates.image;
            const { error } = await supabase
                .from('posts')
                .update(dbUpdates)
                .eq('id', postId);
            if (error) throw error;
        } catch (err) {
            console.error('postsService.update error:', err);
        }
        const posts = DB.get('posts');
        const idx = posts.findIndex(p => p.id === postId);
        if (idx !== -1) {
            posts[idx] = { ...posts[idx], ...updates };
            DB.set('posts', posts);
            return posts[idx];
        }
        return null;
    },

    // Post sil
    async delete(postId) {
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);
            if (error) throw error;
        } catch (err) {
            console.error('postsService.delete error:', err);
        }
        const posts = DB.get('posts').filter(p => p.id !== postId);
        DB.set('posts', posts);
    },

    // Like toggle
    async toggleLike(postId, userId) {
        const posts = DB.get('posts');
        const p = posts.find(x => x.id === postId);
        if (!p) return null;

        const liked = p.likes.includes(userId);
        const newLikes = liked
            ? p.likes.filter(id => id !== userId)
            : [...p.likes, userId];

        try {
            const { error } = await supabase
                .from('posts')
                .update({ likes: newLikes })
                .eq('id', postId);
            if (error) throw error;
        } catch (err) {
            console.error('postsService.toggleLike error:', err);
        }

        const idx = posts.findIndex(x => x.id === postId);
        posts[idx] = { ...posts[idx], likes: newLikes };
        DB.set('posts', posts);
        return { liked: !liked, likes: newLikes };
    },

    // Şərh əlavə et
    async addComment(postId, comment) {
        const posts = DB.get('posts');
        const p = posts.find(x => x.id === postId);
        if (!p) return null;

        const newComments = [...(p.comments || []), comment];

        try {
            const { error } = await supabase
                .from('posts')
                .update({ comments: newComments })
                .eq('id', postId);
            if (error) throw error;
        } catch (err) {
            console.error('postsService.addComment error:', err);
        }

        const idx = posts.findIndex(x => x.id === postId);
        posts[idx] = { ...posts[idx], comments: newComments };
        DB.set('posts', posts);
        return posts[idx];
    },

    // Şərh sil
    async deleteComment(postId, commentId) {
        const posts = DB.get('posts');
        const p = posts.find(x => x.id === postId);
        if (!p) return null;

        const newComments = p.comments.filter(c => c.id !== commentId);

        try {
            const { error } = await supabase
                .from('posts')
                .update({ comments: newComments })
                .eq('id', postId);
            if (error) throw error;
        } catch (err) {
            console.error('postsService.deleteComment error:', err);
        }

        const idx = posts.findIndex(x => x.id === postId);
        posts[idx] = { ...posts[idx], comments: newComments };
        DB.set('posts', posts);
        return posts[idx];
    },
};
