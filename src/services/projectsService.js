import { supabase } from './supabaseClient';
import { uid } from './db';

// Supabase formatını lokal formata çevir
const mapProject = (p) => ({
    id: p.id,
    title: p.title,
    desc: p.description || '',
    authorId: p.author_id,
    skills: Array.isArray(p.skills) ? p.skills : [],
    team: p.team || '',
    status: p.status || 'active',
    applicants: Array.isArray(p.applicants) ? p.applicants : [],
    roleSlots: Array.isArray(p.role_slots) ? p.role_slots : [],
    grad: p.grad || 'from-brand-500 to-purple-500',
    createdAt: p.created_at,
});

// Lokal formatı Supabase formatına çevir
const mapProjectToDb = (p) => ({
    id: p.id,
    title: p.title,
    description: p.desc || '',
    author_id: p.authorId,
    skills: p.skills || [],
    team: p.team || '',
    status: p.status || 'active',
    applicants: p.applicants || [],
    role_slots: p.roleSlots || [],
    grad: p.grad || 'from-brand-500 to-purple-500',
    created_at: p.createdAt || Date.now(),
});

export const projectsService = {
    // Bütün layihələri çək
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data.map(mapProject);
        } catch (err) {
            console.error('projectsService.getAll error:', err);
            return [];
        }
    },

    // Layihə yarat
    async create(projectData) {
        const newProject = {
            id: 'p_' + uid(),
            title: projectData.title,
            desc: projectData.desc || '',
            authorId: projectData.authorId,
            skills: projectData.skills || [],
            team: projectData.team || '',
            status: 'active',
            applicants: [],
            roleSlots: projectData.roleSlots || [],
            grad: projectData.grad || 'from-brand-500 to-purple-500',
            createdAt: Date.now(),
        };
        try {
            const { error } = await supabase
                .from('projects')
                .insert([mapProjectToDb(newProject)]);
            if (error) throw error;
        } catch (err) {
            console.error('projectsService.create error:', err);
        }
        return newProject;
    },

    // Layihəni yenilə
    async update(projectId, updates) {
        const dbUpdates = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.desc !== undefined) dbUpdates.description = updates.desc;
        if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
        if (updates.team !== undefined) dbUpdates.team = updates.team;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.applicants !== undefined) dbUpdates.applicants = updates.applicants;
        if (updates.roleSlots !== undefined) dbUpdates.role_slots = updates.roleSlots;

        try {
            const { data, error } = await supabase
                .from('projects')
                .update(dbUpdates)
                .eq('id', projectId)
                .select()
                .single();
            if (error) throw error;
            return mapProject(data);
        } catch (err) {
            console.error('projectsService.update error:', err);
            return null;
        }
    },

    // Layihəni sil
    async delete(projectId) {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);
            if (error) throw error;
        } catch (err) {
            console.error('projectsService.delete error:', err);
        }
    },

    // Müraciət et
    async apply(projectId, applicant) {
        try {
            const { data: project, error: fetchErr } = await supabase
                .from('projects')
                .select('applicants')
                .eq('id', projectId)
                .single();
            if (fetchErr) throw fetchErr;

            const applicants = Array.isArray(project.applicants) ? project.applicants : [];
            const alreadyApplied = applicants.some(a =>
                (typeof a === 'object' ? a.id : a) === applicant.id
            );
            if (alreadyApplied) return null;

            const newApplicants = [...applicants, applicant];
            const { data, error } = await supabase
                .from('projects')
                .update({ applicants: newApplicants })
                .eq('id', projectId)
                .select()
                .single();
            if (error) throw error;
            return mapProject(data);
        } catch (err) {
            console.error('projectsService.apply error:', err);
            return null;
        }
    },
};
