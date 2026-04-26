import React, { createContext, useContext, useState, useEffect } from 'react';
import { DB, seedIfEmpty, hashPassword } from '../services/db';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        seedIfEmpty();
        const session = DB.getOne('session');
        if (session) {
            const user = DB.get('users').find(u => u.id === session.userId);
            if (user) {
                setCurrentUser(user);
            } else {
                DB.setOne('session', null);
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const hashedInput = hashPassword(password);
        const user = DB.get('users').find(u => u.email === email && u.password === hashedInput);
        if (user) {
            // Prevent login for unverified accounts (Requirements 5.5, 8.1)
            if (user.verified === false) {
                return { success: false, needsVerification: true, email: user.email, message: 'Please verify your email address first.' };
            }
            DB.setOne('session', { userId: user.id });
            setCurrentUser(user);
            return { success: true, user };
        }
        return { success: false, message: 'E-poçt və ya şifrə yanlışdır!' };
    };

    const logout = () => {
        DB.setOne('session', null);
        setCurrentUser(null);
    };

    const refreshUser = () => {
        if (!currentUser) return;
        const user = DB.get('users').find(u => u.id === currentUser.id);
        if (user) setCurrentUser(user);
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout, refreshUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
