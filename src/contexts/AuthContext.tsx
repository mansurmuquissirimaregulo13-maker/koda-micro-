import React, { createContext, useEffect, useState } from 'react';
import { API_URL } from '../config';
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
                // Se o perfil não existe, podemos estar em um estado inconsistente.
                // Para o admin do sistema, vamos permitir o acesso ou criar um perfil básico.
                if (data.user.email === 'mansurmuquissirimaregulo13@gmail.com') {
                    // Criar perfil básico de admin se não existir
                    const { error: insertError } = await supabase
                        .from('user_profiles')
                        .insert({
                            id: data.user.id,
                            email: data.user.email!,
                            full_name: 'Mansur Regulo',
                            role: 'admin',
                            status: 'approved',
                            company_id: null
                        });
                    if (insertError) throw insertError;
                }
            }

            if (profileData) {
                if (profileData.status === 'rejected') {
                    await supabase.auth.signOut();
                    throw new Error('Sua conta foi rejeitada ou desativada. Entre em contato com o suporte.');
                }
                if (profileData.status === 'pending') {
                    // The UI will handle the redirect based on profile status
                    return { user: data.user };
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
                    }
                }
            });

            if (error) {
                console.error('Supabase Auth Error:', error);
                throw error;
            }

            if (data.user && companyName) {
                console.log('User created, creating company:', companyName);
                let companyId = null;

                // 1. Criar a empresa
                const { data: companyData, error: companyError } = await supabase
                    .from('companies')
                    .insert({
                        name: companyName,
                        owner_id: data.user.id,
                        status: 'pending'
                    })
                    .select()
                    .maybeSingle();

                if (companyError) {
                    console.error('Company Creation Error:', companyError);
                    throw companyError;
                }
                companyId = companyData.id;

                // 2. Atualizar o perfil
                const { error: updateError } = await supabase
                    .from('user_profiles')
                    .update({
                        company_id: companyId,
                        role: 'admin'
                    })
                    .eq('id', data.user.id);

                if (updateError) {
                    console.error('Profile Update Error:', updateError);
                    throw updateError;
                }

                // 3. Notificar via Email (Fail-safe)
                try {
                    const emailApiUrl = `${API_URL || ''}/api/send-email`;
                    console.log('Sending emails via:', emailApiUrl);

                    // Notificar Admin
                    await fetch(emailApiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: 'mansurmuquissirimaregulo13@gmail.com',
                            subject: 'Nova Empresa Registrada',
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h1>Nova Empresa Registrada</h1>
                                    <p><strong>Nome da Empresa:</strong> ${companyName}</p>
                                    <p><strong>Usuário:</strong> ${fullName} (${email})</p>
                                </div>
                            `
                        })
                    }).catch(err => console.warn('Admin email failed silentely:', err));

                    // Notificar Usuário
                    await fetch(emailApiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: email,
                            subject: 'Cadastro Realizado - Aguardando Aprovação',
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h1 style="color: #ca8a04;">Aguardando Aprovação</h1>
                                    <p>Olá ${fullName},</p>
                                    <p>Seu cadastro para a empresa <strong>${companyName}</strong> foi recebido.</p>
                                    <p>Aguarde a ativação da sua conta.</p>
                                </div>
                            `
                        })
                    }).catch(err => console.warn('User email failed silentely:', err));

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
