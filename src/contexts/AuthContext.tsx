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
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (error) throw error;

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
                    await fetch(`${API_URL}/api/send-email`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: 'mansurmuquissirimaregulo13@gmail.com', // Notify admin
                            subject: 'Nova Empresa Registrada',
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h1>Nova Empresa Registrada</h1>
                                    <p><strong>Nome da Empresa:</strong> ${companyName}</p>
                                    <p><strong>Usuário:</strong> ${fullName} (${email})</p>
                                    <p>Verifique o painel administrativo para aprovar ou rejeitar.</p>
                                </div>
                            `
                        })
                    });

                    // 4. Notificar o Usuário sobre o status pendente
                    await fetch(`${API_URL}/api/send-email`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email, // Notify the new user
                            subject: 'Cadastro Realizado - Aguardando Aprovação',
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h1 style="color: #ca8a04;">Aguardando Aprovação</h1>
                                    <p>Olá ${fullName},</p>
                                    <p>Seu cadastro para a empresa <strong>${companyName}</strong> foi recebido com sucesso.</p>
                                    <p>Sua conta está atualmente <strong>pendente de aprovação</strong> pelo administrador.</p>
                                    <p>Você receberá um novo e-mail assim que sua conta for ativada.</p>
                                </div>
                            `
                        })
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
