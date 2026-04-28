import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const mapUser = (user) => {
        if (!user) return null;
        return {
            ...user,
            ...user.user_metadata,
        };
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setCurrentUser(mapUser(session?.user));
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(mapUser(session?.user));
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true, user: mapUser(data.user) };
    };

    const register = async (email, password, additionalData) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: additionalData
            }
        });

        if (error) {
            return { success: false, message: error.message };
        }
        
        const mappedUser = mapUser(data.user);
        
        const newUserProfile = {
            id: mappedUser.id,
            email: mappedUser.email,
            name: mappedUser.name || 'İstifadəçi',
            university: mappedUser.university || '',
            field: mappedUser.field || '',
            level: mappedUser.level || 'Başlanğıc',
            bio: '',
            grad: 'from-brand-500 to-purple-500',
            skills: [],
            links: [],
            views: 0,
            followers: [],
            following: [],
            verified: false,
            createdAt: Date.now()
        };

        // Supabase profiles cədvəlinə əlavə edirik (qlobal olması üçün)
        try {
            await supabase.from('profiles').insert([newUserProfile]);
        } catch (err) {
            console.error('Supabase profile insert error:', err);
        }

        // Yerli testlər üçün də localStorage-a əlavə edirik
        try {
            const users = JSON.parse(localStorage.getItem('lu_users')) || [];
            if (!users.find(u => u.id === mappedUser.id)) {
                users.push(newUserProfile);
                localStorage.setItem('lu_users', JSON.stringify(users));
            }
        } catch (err) {
            console.error('LocalStorage update error:', err);
        }

        return { success: true, user: mappedUser, session: data.session };
    };

    const logout = async () => {
        setCurrentUser(null);
        localStorage.removeItem('currentRoute');
        localStorage.removeItem('routeParams');
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const refreshUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(mapUser(user));
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, login, register, logout, refreshUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
