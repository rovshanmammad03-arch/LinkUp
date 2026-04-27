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
        return { success: true, user: mapUser(data.user) };
    };

    const logout = async () => {
        await supabase.auth.signOut();
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
