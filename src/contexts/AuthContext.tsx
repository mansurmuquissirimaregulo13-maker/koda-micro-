import React, { createContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: 'super_admin' | 'admin' | 'user';
    status: 'pending' | 'approved' | 'rejected';
    company_id: string | null;
    created_at: string;
    approved_at: string | null;
    approved_by: string | null;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ user: User | null }>;
    signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    isSystemAdmin: boolean;
    isApproved: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadProfile = async (userId: string) => {
        try {
            console.log('Loading profile for user:', userId);
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Database error loading profile:', error);
                throw error;
            }
            console.log('Profile context loaded:', data ? 'Found' : 'Not Found');
            setProfile(data);
        } catch (error) {
            console.error('Critical error in loadProfile:', error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        console.log('Attempting login for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Auth sign-in error:', error.message);
            throw error;
        }

        console.log('Auth successful, fetching profile...');
        // Check if user is approved (Admins bypass this)
        if (data.user) {
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

            if (profileError) throw profileError;

            if (!profileData) {
                // Se o perfil não existe, mas o e-mail é do Mansur, cria como aprovado
                if (data.user.email === 'mansurmuquissirimaregulo13@gmail.com') {
                    const { error: insertError } = await supabase
                        .from('user_profiles')
                        .insert({
                            id: data.user.id,
                            email: data.user.email!,
                            full_name: 'Mansur Regulo',
                            role: 'super_admin', // Mansur deve ser super_admin
                            status: 'approved',
                            company_id: null
                        });
                    if (insertError) throw insertError;
                } else {
                    // Usuário sem perfil não entra
                    await supabase.auth.signOut();
                    throw new Error('Perfil não encontrado. Por favor, registre-se novamente.');
                }
            }

            if (profileData) {
                if (profileData.status === 'rejected') {
                    await supabase.auth.signOut();
                    throw new Error('Sua conta foi rejeitada e você não pode acessar o sistema.');
                }
                if (profileData.status === 'pending' && profileData.email !== 'mansurmuquissirimaregulo13@gmail.com') {
                    // Critical Security Fix: Force logout and throw error for pending users
                    await supabase.auth.signOut();
                    throw new Error('Conta pendente de aprovação. Aguarde a liberação do administrador.');
                }
            }
        }
        return { user: data.user };
    };

    const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
        try {
            console.log('Starting sign up process for:', email);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        company_name: companyName, // Added to be used by the handle_new_user trigger
                    }
                }
            });

            if (error) {
                console.error('Supabase Auth Error:', error);
                throw error;
            }

            if (data.user) {
                console.log('User created. Database trigger will handle profile and company creation.');

                // 3. Notificar via Edge Function (Centralizado)
                try {
                    const baseUrl = window.location.origin;
                    const emailApiUrl = `${baseUrl}/api/send-email`;

                    await fetch(emailApiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'new_registration',
                            email: email,
                            full_name: fullName,
                            company_name: companyName
                        })
                    }).catch(err => console.warn('PWA notification failed silently:', err));

                } catch (notifyErr) {
                    console.warn('Email notification system error (non-blocking):', notifyErr);
                }
            }
        } catch (error: any) {
            console.error('SignUp Critical Error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const isSystemAdmin = (profile?.role === 'admin' || profile?.role === 'super_admin') && profile?.email === 'mansurmuquissirimaregulo13@gmail.com';
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    const isApproved = profile?.status === 'approved';

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                signIn,
                signUp,
                signOut,
                isAdmin,
                isSystemAdmin,
                isApproved,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
