import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  generateId,
  getDaysOverdue,
  calculateCurrentDebt
} from
  '../utils/helpers';
import { Client, Credit, Payment } from '../types';
import { useAuth } from './useAuth';

export function useAppState() {
  const { profile, isAdmin, isSystemAdmin } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const companyId = profile?.company_id;

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!companyId && !isSystemAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let clientsQuery = supabase.from('clients').select('*');
      let creditsQuery = supabase.from('credits').select('*');
      let paymentsQuery = supabase.from('payments').select('*');

      if (!isSystemAdmin) {
        clientsQuery = clientsQuery.eq('company_id', companyId);
        creditsQuery = creditsQuery.eq('company_id', companyId);
        paymentsQuery = paymentsQuery.eq('company_id', companyId);
      }

      const { data: clientsData } = await clientsQuery;
      const { data: creditsData } = await creditsQuery;
      const { data: paymentsData } = await paymentsQuery;

      if (clientsData) {
        setClients(clientsData.map((c: any) => ({
          id: c.id,
          name: c.full_name,
          bi: c.document_id,
          phone: c.phone || '',
          email: c.email || '',
          address: c.address || '',
          photo: c.photo_url,
          registeredAt: c.created_at,
          notes: c.notes,
          residenceProof: c.residence_proof_url
        })));
      }

      if (creditsData) {
        setCredits(creditsData.map((c: any) => ({
          id: c.id,
          clientId: c.client_id,
          amount: c.amount,
          interestRate: c.interest_rate,
          termMonths: c.term_months,
          numberOfInstallments: c.number_of_installments,
          startDate: c.start_date,
          endDate: c.end_date,
          status: c.status,
          totalToPay: c.total_payable,
          remainingAmount: c.remaining_amount,
          notes: c.notes
        })));
      }

      if (paymentsData) {
        setPayments(paymentsData.map((p: any) => ({
          id: p.id,
          creditId: p.credit_id,
          amount: p.amount,
          date: p.payment_date,
          type: p.payment_type as 'partial' | 'total',
          description: p.notes,
          proof: p.proof_url
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client Actions
  const addClient = async (clientData: Omit<Client, 'id' | 'registeredAt'>) => {
    // Optimistic update
    const tempId = generateId();
    const newClient: Client = {
      ...clientData,
      id: tempId,
      registeredAt: new Date().toISOString()
    };
    setClients(prev => [newClient, ...prev]);

    try {
      const { data, error } = await supabase.from('clients').insert([{
        full_name: clientData.name,
        document_id: clientData.bi,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address,
        photo_url: clientData.photo,
        notes: clientData.notes,
        residence_proof_url: clientData.residenceProof,
        company_id: companyId
      }]).select().maybeSingle();

      if (error) throw error;

      // Replace temp ID with real ID
      if (data) {
        setClients(prev => prev.map(c => c.id === tempId ? {
          ...newClient,
          id: data.id,
          registeredAt: data.created_at
        } : c));
      }

      return data;
    } catch (error) {
      console.error('Error adding client:', error);
      // Revert on error
      setClients(prev => prev.filter(c => c.id !== tempId));
      throw error;
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    setClients(clients.map((c) => c.id === id ? { ...c, ...data } : c));

    // Map updates back to DB columns
    const dbUpdates: any = {};
    if (data.name) dbUpdates.full_name = data.name;
    if (data.bi) dbUpdates.document_id = data.bi;
    if (data.phone) dbUpdates.phone = data.phone;
    if (data.email) dbUpdates.email = data.email;
    if (data.address) dbUpdates.address = data.address;
    if (data.photo) dbUpdates.photo_url = data.photo;
    if (data.notes) dbUpdates.notes = data.notes;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('clients').update(dbUpdates).eq('id', id);
    }
  };

  const deleteClient = async (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    await supabase.from('clients').delete().eq('id', id);
  };

  // Credit Actions
  const addCredit = async (
    creditData: Omit<Credit, 'id' | 'remainingAmount' | 'status'>) => {
    const totalToPay = creditData.totalToPay;

    // Optimistic
    const tempId = generateId();
    const newCredit: Credit = {
      ...creditData,
      id: tempId,
      status: 'pending',
      remainingAmount: totalToPay
    };
    setCredits([newCredit, ...credits]);

    try {
      const { data, error } = await supabase.from('credits').insert([{
        client_id: creditData.clientId,
        amount: creditData.amount,
        interest_rate: creditData.interestRate,
        term_months: creditData.termMonths,
        number_of_installments: creditData.numberOfInstallments,
        start_date: creditData.startDate,
        end_date: creditData.endDate,
        status: 'pending',
        total_payable: totalToPay,
        remaining_amount: totalToPay,
        notes: creditData.notes,
        company_id: companyId
      }]).select().maybeSingle();

      if (error) throw error;

      // Replace temp ID
      if (data) {
        setCredits(prev => prev.map(c => c.id === tempId ? { ...newCredit, id: data.id } : c));
      }
      return data;
    } catch (error) {
      console.error("Error creating credit", error);
      setCredits(prev => prev.filter(c => c.id !== tempId));
      throw error;
    }
  };

  const updateCreditStatus = async (id: string, status: Credit['status']) => {
    setCredits(credits.map((c) => c.id === id ? { ...c, status } : c));
    await supabase.from('credits').update({ status }).eq('id', id);
  };

  // Payment Actions
  const addPayment = async (paymentData: Omit<Payment, 'id'>) => {
    // 1. Calculate new credit status
    const credit = credits.find((c) => c.id === paymentData.creditId);
    if (!credit) return;

    const newRemaining = Math.max(
      0,
      credit.remainingAmount - paymentData.amount
    );
    const newStatus = newRemaining === 0 ? 'paid' : credit.status;

    // Optimistic Payment
    const tempId = generateId();
    const newPayment: Payment = {
      ...paymentData,
      id: tempId
    };

    setPayments([newPayment, ...payments]);
    setCredits(
      credits.map((c) =>
        c.id === credit.id ?
          { ...c, remainingAmount: newRemaining, status: newStatus } :
          c
      )
    );

    try {
      // Insert Payment
      const { data: paymentRes, error: paymentError } = await supabase.from('payments').insert([{
        credit_id: paymentData.creditId,
        amount: paymentData.amount,
        payment_date: paymentData.date,
        payment_type: paymentData.type,
        notes: paymentData.description,
        proof_url: paymentData.proof,
        company_id: companyId
      }]).select().maybeSingle();

      if (paymentError) throw paymentError;

      // Update Credit
      const { error: creditError } = await supabase.from('credits').update({
        remaining_amount: newRemaining,
        status: newStatus
      }).eq('id', credit.id);

      if (creditError) throw creditError;

      // Update ID
      if (paymentRes) {
        setPayments(prev => prev.map(p => p.id === tempId ? { ...newPayment, id: paymentRes.id } : p));
      }
      return paymentRes;

    } catch (error) {
      console.error("Error processing payment", error);
      // Revert (simplified)
      setPayments(prev => prev.filter(p => p.id !== tempId));
      // Note: Reverting credit state is harder here, effectively we might need a re-fetch or rollback logic
      // For now, assume success or reload page on error
    }
  };

  // Helper Functions
  const getClientCredits = (clientId: string) => {
    return credits.filter((c) => c.clientId === clientId);
  };

  const getClientPayments = (clientId: string) => {
    const clientCreditIds = credits.
      filter((c) => c.clientId === clientId).
      map((c) => c.id);
    return payments.filter((p) => clientCreditIds.includes(p.creditId));
  };

  const getCreditPayments = (creditId: string) => {
    return payments.
      filter((p) => p.creditId === creditId).
      sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getCreditWithDetails = (creditId: string) => {
    const credit = credits.find((c) => c.id === creditId);
    if (!credit) return null;

    const client = clients.find((c) => c.id === credit.clientId);
    const creditPayments = getCreditPayments(creditId);
    const debtInfo = calculateCurrentDebt(credit, creditPayments);

    return {
      ...credit,
      client,
      payments: creditPayments,
      debtInfo
    };
  };

  const getOverdueCreditsWithDetails = () => {
    return credits.
      filter((c) => c.status === 'overdue').
      map((credit) => {
        const client = clients.find((c) => c.id === credit.clientId);
        const daysOverdue = getDaysOverdue(credit.endDate);
        return {
          ...credit,
          clientName: client?.name || 'Desconhecido',
          daysOverdue
        };
      }).
      sort((a, b) => b.daysOverdue - a.daysOverdue); // Sort by most overdue
  };

  // Statistics
  const stats = {
    totalClients: clients.length,
    activeCredits: credits.filter(
      (c) => c.status === 'active' || c.status === 'overdue'
    ).length,
    totalLent: credits.reduce((sum, c) => sum + c.amount, 0),
    overdueCredits: credits.filter((c) => c.status === 'overdue').length,
    totalCollected: payments.reduce((sum, p) => sum + p.amount, 0)
  };

  return {
    clients,
    credits,
    payments,
    loading,
    addClient,
    updateClient,
    deleteClient,
    addCredit,
    updateCreditStatus,
    addPayment,
    getClientCredits,
    getClientPayments,
    getCreditPayments,
    getCreditWithDetails,
    getOverdueCreditsWithDetails,
    stats,
    isAdmin,
    isSystemAdmin
  };
}