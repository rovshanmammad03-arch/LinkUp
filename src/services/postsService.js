import { supabase } from './supabaseClient';
import { uid } from './db';

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
            return data.map(mapPost);
        } catch (err) {
            console.error('postsService.getAll error:', err);
            // Fallback: localStorage
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
        return newPost;
    },

    // Post yenilə (caption, image)
    async update(postId, updates) {
        try {
            const dbUpdates = {};
            if (updates.caption !== undefined) dbUpdates.caption = updates.caption;
            if (updates.image !== undefined) dbUpdates.image = updates.image;
            const { data, error } = await supabase
                .from('posts')
                .update(dbUpdates)
                .eq('id', postId)
                .select()
                .single();
            if (error) throw error;
            return mapPost(data);
        } catch (err) {
            console.error('postsService.update error:', err);
            return null;
        }
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
    },

    // Like toggle
    async toggleLike(postId, userId) {
        try {
            const { data: post, error: fetchErr } = await supabase
                .from('posts')
                .select('likes')
                .eq('id', postId)
                .single();
            if (fetchErr) throw fetchErr;

            const likes = Array.isArray(post.likes) ? post.likes : [];
            const liked = likes.includes(userId);
            const newLikes = liked ? likes.filter(id => id !== userId) : [...likes, userId];

            const { error } = await supabase
                .from('posts')
                .update({ likes: newLikes })
                .eq('id', postId);
            if (error) throw error;

            return { liked: !liked, likes: newLikes };
        } catch (err) {
            console.error('postsService.toggleLike error:', err);
            return null;
        }
    },

    // Şərh əlavə et
    async addComment(postId, comment) {
        try {
            const { data: post, error: fetchErr } = await supabase
                .from('posts')
                .select('comments')
                .eq('id', postId)
                .single();
            if (fetchErr) throw fetchErr;

            const comments = Array.isArray(post.comments) ? post.comments : [];
            const newComments = [...comments, comment];

            const { data, error } = await supabase
                .from('posts')
                .update({ comments: newComments })
                .eq('id', postId)
                .select()
                .single();
            if (error) throw error;
            return mapPost(data);
        } catch (err) {
            console.error('postsService.addComment error:', err);
            return null;
        }
    },

    // Şərh sil
    async deleteComment(postId, commentId) {
        try {
            const { data: post, error: fetchErr } = await supabase
                .from('posts')
                .select('comments')
                .eq('id', postId)
                .single();
            if (fetchErr) throw fetchErr;

            const newComments = (post.comments || []).filter(c => c.id !== commentId);

            const { data, error } = await supabase
                .from('posts')
                .update({ comments: newComments })
                .eq('id', postId)
                .select()
                .single();
            if (error) throw error;
            return mapPost(data);
        } catch (err) {
            console.error('postsService.deleteComment error:', err);
            return null;
        }
    },
};
