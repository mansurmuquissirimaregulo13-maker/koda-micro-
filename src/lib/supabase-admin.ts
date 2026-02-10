import { supabase } from './supabase';

export interface UserProfile {
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

export interface Company {
    id: string;
    name: string;
    owner_id: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export async function getPendingUsers(companyId?: string): Promise<UserProfile[]> {
    let query = supabase
        .from('user_profiles')
        .select('*')
        .eq('status', 'pending');

    if (companyId) {
        query = query.eq('company_id', companyId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getAllUsers(companyId?: string): Promise<any[]> {
    let query = supabase
        .from('user_profiles')
        .select(`
            *,
            company:companies (
                name
            )
        `);

    if (companyId) {
        query = query.eq('company_id', companyId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function approveUser(userId: string, adminId: string): Promise<void> {
    // 1. Get user details for notification
    const { data: userData } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('id', userId)
        .maybeSingle();

    const { error } = await supabase
        .from('user_profiles')
        .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: adminId,
        })
        .eq('id', userId);

    if (error) throw error;

    // 2. Notify by email
    if (userData?.email) {
        await notifyStatusChange(userData.email, userData.full_name || 'Usuário', 'approved');
    }
}

export async function rejectUser(userId: string, _adminId?: string): Promise<void> {
    // 1. Get user details for email notification
    const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('id', userId)
        .maybeSingle();

    if (fetchError) throw fetchError;

    // 2. Update status to rejected
    const { error } = await supabase
        .from('user_profiles')
        .update({
            status: 'rejected',
            approved_at: null,
            approved_by: null
        })
        .eq('id', userId);

    if (error) throw error;

    // 3. Notify user about rejection
    if (profile?.email) {
        await notifyStatusChange(profile.email, profile.full_name || 'Usuário', 'rejected');
    }
}

export async function updateUserRole(
    userId: string,
    role: 'admin' | 'user'
): Promise<void> {
    const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);

    if (error) throw error;
}

// Company management (Super Admin)
export async function getPendingCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getAllCompanies(): Promise<any[]> {
    const { data, error } = await supabase
        .from('companies')
        .select(`
            *,
            owner:user_profiles (
                email,
                full_name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function approveCompany(companyId: string): Promise<void> {
    // 1. Get the company to find the owner_id
    const { data: company, error: fetchError } = await supabase
        .from('companies')
        .select('owner_id')
        .eq('id', companyId)
        .maybeSingle();

    if (fetchError) throw fetchError;
    if (!company) throw new Error('Empresa não encontrada.');

    // 2. Approve the company
    const { error: companyError } = await supabase
        .from('companies')
        .update({ status: 'approved' })
        .eq('id', companyId);

    if (companyError) throw companyError;

    // 3. Automatically approve the owner if they exist
    if (company?.owner_id) {
        const { data: ownerData } = await supabase
            .from('user_profiles')
            .update({ status: 'approved' })
            .eq('id', company.owner_id)
            .select('email, full_name')
            .maybeSingle();

        if (ownerData?.email) {
            await notifyStatusChange(ownerData.email, ownerData.full_name || 'Dono de Empresa', 'approved');
        }
    }
}

export async function rejectCompany(companyId: string): Promise<void> {
    // 1. Get owner details for notification
    const { data: companyData } = await supabase
        .from('companies')
        .select('owner_id')
        .eq('id', companyId)
        .maybeSingle();

    const { error } = await supabase
        .from('companies')
        .update({ status: 'rejected' })
        .eq('id', companyId);

    if (error) throw error;

    // 2. Notify owner if found
    if (companyData?.owner_id) {
        const { data: ownerData } = await supabase
            .from('user_profiles')
            .select('email, full_name')
            .eq('id', companyData.owner_id)
            .maybeSingle();

        if (ownerData?.email) {
            await notifyStatusChange(ownerData.email, ownerData.full_name || 'Dono de Empresa', 'rejected');
        }
    }
}

export async function deleteCompany(companyId: string): Promise<void> {
    const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

    if (error) throw error;
}

export async function deleteUser(userId: string): Promise<void> {
    // 1. Get user details for notification before deleting
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('id', userId)
        .maybeSingle();

    // 2. Notify user about removal (Email)
    if (profile?.email) {
        await notifyStatusChange(profile.email, profile.full_name || 'Usuário', 'removed');
    }

    // 3. Delete from Auth via Edge Function (This will cascade delete the profile record)
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'delete_user',
                user_id: userId
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Falha ao remover usuário da Auth');
        }

        console.log('User deleted successfully from Auth and Database');
    } catch (err) {
        console.error('Error deleting user:', err);
        throw err;
    }
}

// Helper to call notification Edge Function
async function notifyStatusChange(email: string, fullName: string, status: 'approved' | 'rejected' | 'removed') {
    try {
        const baseUrl = window.location.origin;
        const emailApiUrl = `${baseUrl}/api/send-email`;

        // Map status to Edge Function type
        const type = status === 'removed' ? 'removed' : 'status_update';

        const response = await fetch(emailApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type,
                email,
                full_name: fullName,
                status
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Failed to send status notification:', errorData);
            return;
        }

        const data = await response.json();
        console.log('Status notification successful:', data);
    } catch (err) {
        console.warn('Failed to call notification service:', err);
    }
}
