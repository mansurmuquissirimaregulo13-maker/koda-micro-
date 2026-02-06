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
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

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
                } else {
                    throw new Error('Perfil de usuário não encontrado. Por favor, entre em contato com o suporte.');
                }
            } else if (profileData.role !== 'admin' && profileData.status !== 'approved') {
                await supabase.auth.signOut();
                throw new Error('Sua conta ainda não foi aprovada pelo administrador.');
            }
        }

        return { user: data.user };
    };

    const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            // Se for erro de limite de taxa de email, mas o usuário foi criado, ignoramos o erro
            if (error) {
                if (error.message.includes('rate limit') || error.message.includes('taxa')) {
                    console.warn('Email rate limit hit, but checking if user exists...');
                    if (!data?.user) {
                        // Se realmente não criou o usuário, aí sim lançamos o erro
                        throw error;
                    }
                } else {
                    throw error;
                }
            }

            if (data.user && companyName) {
                let companyId = null;

                // 1. Criar a empresa (o perfil já foi criado pelo trigger no DB)
                const { data: companyData, error: companyError } = await supabase
                    .from('companies')
                    .insert({
                        name: companyName,
                        owner_id: data.user.id,
                        status: 'pending'
                    })
                    .select()
                    .maybeSingle();

                if (companyError) throw companyError;
                companyId = companyData.id;

                // 2. Atualizar o perfil com o ID da empresa criada
                const { error: updateError } = await supabase
                    .from('user_profiles')
                    .update({
                        company_id: companyId,
                        role: 'admin'
                    })
                    .eq('id', data.user.id);

                if (updateError) throw updateError;

                // 3. Notificar o Admin (Mansur) sobre o novo cadastro
                try {
                    await supabase.functions.invoke('send-notification-email', {
                        body: {
                            type: 'new_registration',
                            email: email,
                            full_name: fullName,
                            company_name: companyName
                        }
                    });
                } catch (notifyErr) {
                    console.warn('Falha ao notificar admin, mas cadastro concluído:', notifyErr);
                }
            }
        } catch (error: any) {
            console.error('SignUp Error:', error);
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
