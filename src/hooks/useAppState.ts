import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  generateId,
  getDaysOverdue,
  calculateCurrentDebt
} from
  '../utils/helpers';
import {
  Client,
  Credit,
  Payment,
  SavingsGroup,
  SavingsGroupMember,
  SavingsContribution,
  SavingsLoan
} from '../types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useAppState() {
  const { profile, isAdmin, isSystemAdmin } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [savingsGroups, setSavingsGroups] = useState<SavingsGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<SavingsGroupMember[]>([]);
  const [contributions, setContributions] = useState<SavingsContribution[]>([]);
  const [savingsLoans, setSavingsLoans] = useState<SavingsLoan[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
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
      let savingsGroupsQuery = supabase.from('savings_groups').select('*');
      const membersQuery = supabase.from('savings_group_members').select('*');
      const contributionsQuery = supabase.from('savings_contributions').select('*');
      const loansQuery = supabase.from('savings_loans').select('*');
      let companyQuery = supabase.from('companies').select('*');
      const profilesQuery = supabase.from('user_profiles').select('*');

      if (!isSystemAdmin) {
        clientsQuery = clientsQuery.eq('company_id', companyId);
        creditsQuery = creditsQuery.eq('company_id', companyId);
        paymentsQuery = paymentsQuery.eq('company_id', companyId);
        savingsGroupsQuery = savingsGroupsQuery.eq('company_id', companyId);
        companyQuery = companyQuery.eq('id', companyId);
        // Members, contributions, etc. are linked via IDs, company filter applies to base group
      }

      const { data: clientsData } = await clientsQuery;
      const { data: creditsData } = await creditsQuery;
      const { data: paymentsData } = await paymentsQuery;
      const { data: savingsGroupsData } = await savingsGroupsQuery;
      const { data: membersData } = await membersQuery;
      const { data: contributionsData } = await contributionsQuery;
      const { data: loansData } = await loansQuery;
      const { data: companyData } = await companyQuery;
      const { data: profilesData } = await profilesQuery;

      if (companyData && companyData[0]) {
        setCompany(companyData[0]);
      }

      if (profilesData) {
        setAllProfiles(profilesData);
      }

      if (clientsData) {
        setClients(clientsData.map((c: any) => ({
          id: c.id,
          name: c.full_name,
          bi: c.document_id,
          phone: c.phone || '',
          email: c.email || '',
          address: c.address || '',
          neighborhood: c.neighborhood || '',
          photo: c.photo_url,
          biPhoto: c.bi_photo_url,
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
          method: p.payment_method as 'emola' | 'mpesa' | 'bank' | 'cash' || 'cash',
          description: p.notes,
          proof: p.proof_url
        })));
      }

      if (savingsGroupsData) {
        setSavingsGroups(savingsGroupsData.map((g: any) => ({
          id: g.id,
          companyId: g.company_id,
          name: g.name,
          description: g.description,
          contributionAmount: g.contribution_amount,
          periodicity: g.periodicity,
          startDate: g.start_date,
          endDate: g.end_date,
          lateFee: g.late_fee,
          interestRate: g.interest_rate,
          maxLoanPerMember: g.max_loan_per_member,
          memberLimit: g.member_limit,
          status: g.status,
          createdAt: g.created_at,
          createdBy: g.created_by
        })));
      }

      if (membersData) {
        setGroupMembers(membersData.map((m: any) => ({
          id: m.id,
          groupId: m.group_id,
          userId: m.user_id,
          name: m.name,
          role: m.role,
          status: m.status,
          joinedAt: m.joined_at,
          earnedInterest: m.earned_interest || 0,
          initialSavings: m.initial_savings || 0,
          initialDebt: m.initial_debt || 0,
          customInterestRate: m.custom_interest_rate
        })));
      }

      if (contributionsData) {
        setContributions(contributionsData.map((c: any) => ({
          id: c.id,
          memberId: c.member_id,
          amount: c.amount,
          periodIndex: c.period_index,
          paymentDate: c.payment_date,
          status: c.status,
          lateFeePaid: c.late_fee_paid,
          notes: c.notes
        })));
      }

      if (loansData) {
        setSavingsLoans(loansData.map((l: any) => ({
          id: l.id,
          groupId: l.group_id,
          memberId: l.member_id,
          amount: l.amount,
          interestRate: l.interest_rate,
          termMonths: l.term_months,
          status: l.status,
          requestedAt: l.requested_at,
          approvedAt: l.approved_at,
          approvedBy: l.approved_by,
          totalPayable: l.total_payable,
          remainingAmount: l.remaining_amount
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
        neighborhood: clientData.neighborhood,
        photo_url: clientData.photo,
        bi_photo_url: clientData.biPhoto,
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
        payment_method: paymentData.method,
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

  // Savings Actions
  const addSavingsGroup = async (groupData: Omit<SavingsGroup, 'id' | 'createdAt' | 'status' | 'createdBy'>) => {
    try {
      const { data, error } = await supabase.from('savings_groups').insert([{
        company_id: companyId,
        name: groupData.name,
        description: groupData.description,
        contribution_amount: groupData.contributionAmount,
        periodicity: groupData.periodicity,
        start_date: groupData.startDate,
        end_date: groupData.endDate,
        late_fee: groupData.lateFee,
        interest_rate: groupData.interestRate,
        max_loan_per_member: groupData.maxLoanPerMember,
        member_limit: groupData.memberLimit,
        created_by: profile?.id
      }]).select().maybeSingle();

      if (error) throw error;
      if (data) fetchData();
      return data;
    } catch (error) {
      console.error('Error adding savings group:', error);
      throw error;
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!profile) return;
    try {
      const { data, error } = await supabase.from('savings_group_members').insert([{
        group_id: groupId,
        user_id: profile.id,
        name: profile.full_name,
        role: 'member',
        status: 'pending',
        initial_savings: 0,
        initial_debt: 0
      }]).select().maybeSingle();

      if (error) throw error;
      if (data) fetchData();
      return data;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  };

  const manuallyAddMember = async (memberData: {
    groupId: string;
    userId: string;
    name: string;
    initialSavings: number;
    initialDebt: number;
    customInterestRate?: number;
  }) => {
    try {
      const { data, error } = await supabase.from('savings_group_members').insert([{
        group_id: memberData.groupId,
        user_id: memberData.userId,
        name: memberData.name,
        role: 'member',
        status: 'approved',
        initial_savings: memberData.initialSavings,
        initial_debt: memberData.initialDebt,
        custom_interest_rate: memberData.customInterestRate
      }]).select().maybeSingle();

      if (error) throw error;
      if (data) fetchData();
      return data;
    } catch (error) {
      console.error('Error manually adding member:', error);
      throw error;
    }
  };

  const addContribution = async (contributionData: Omit<SavingsContribution, 'id' | 'paymentDate' | 'status'>) => {
    try {
      const { data, error } = await supabase.from('savings_contributions').insert([{
        member_id: contributionData.memberId,
        amount: contributionData.amount,
        period_index: contributionData.periodIndex,
        status: 'paid',
        late_fee_paid: contributionData.lateFeePaid,
        notes: contributionData.notes
      }]).select().maybeSingle();

      if (error) throw error;
      if (data) fetchData();
      return data;
    } catch (error) {
      console.error('Error adding contribution:', error);
      throw error;
    }
  };

  const requestLoan = async (loanData: Omit<SavingsLoan, 'id' | 'requestedAt' | 'status' | 'approvedAt' | 'approvedBy' | 'totalPayable' | 'remainingAmount'>) => {
    try {
      const totalPayable = loanData.amount + (loanData.amount * (loanData.interestRate / 100));
      const { data, error } = await supabase.from('savings_loans').insert([{
        group_id: loanData.groupId,
        member_id: loanData.memberId,
        amount: loanData.amount,
        interest_rate: loanData.interestRate,
        term_months: loanData.termMonths,
        total_payable: totalPayable,
        remaining_amount: totalPayable,
        status: 'pending'
      }]).select().maybeSingle();

      if (error) throw error;
      if (data) fetchData();
      return data;
    } catch (error) {
      console.error('Error requesting loan:', error);
      throw error;
    }
  };

  const approveLoan = async (loanId: string) => {
    try {
      const { error } = await supabase.from('savings_loans').update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: profile?.id
      }).eq('id', loanId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error approving loan:', error);
      throw error;
    }
  };

  const repaySavingsLoan = async (repaymentData: {
    loanId: string;
    amount: number;
    notes?: string;
  }) => {
    try {
      const loan = savingsLoans.find(l => l.id === repaymentData.loanId);
      if (!loan) throw new Error('Empréstimo não encontrado');

      const newRemaining = Math.max(0, loan.remainingAmount - repaymentData.amount);
      const newStatus = newRemaining === 0 ? 'paid' : loan.status;

      const { error: updateError } = await supabase
        .from('savings_loans')
        .update({
          remaining_amount: newRemaining,
          status: newStatus
        })
        .eq('id', loan.id);

      if (updateError) throw updateError;

      // Record repayment entry in savings_loan_installments
      await supabase.from('savings_loan_installments').insert([{
        loan_id: loan.id,
        amount: repaymentData.amount,
        paid_at: new Date().toISOString(),
        status: 'paid'
      }]);

      fetchData();
    } catch (error) {
      console.error('Error repaying savings loan:', error);
      throw error;
    }
  };

  const registerYield = async (yieldData: {
    groupId: string;
    amount: number;
    sourceType: 'loan_interest' | 'extra';
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase.from('savings_yields').insert([{
        group_id: yieldData.groupId,
        amount: yieldData.amount,
        source_type: yieldData.sourceType as 'loan_interest' | 'extra',
        distributed: false
      }]).select().maybeSingle();

      if (error) throw error;
      fetchData();
      return data;
    } catch (error) {
      console.error('Error registering yield:', error);
      throw error;
    }
  };

  const distributeInterest = async (groupId: string, amount: number) => {
    try {
      // 1. Get all members of the group
      const groupMems = groupMembers.filter(m => m.groupId === groupId && m.status === 'approved');
      if (groupMems.length === 0) return;

      // 2. Calculate sum of individual contributions for these members
      const memberContributions = groupMems.map(m => {
        const total = contributions
          .filter(c => c.memberId === m.id)
          .reduce((sum, c) => sum + c.amount, 0);
        return { id: m.id, total };
      });

      const totalGroupSavings = memberContributions.reduce((sum, m) => sum + m.total, 0);
      if (totalGroupSavings === 0) return;

      // 3. Update each member's earned_interest proportionally
      for (const mc of memberContributions) {
        const share = (mc.total / totalGroupSavings) * amount;
        const currentMember = groupMems.find(m => m.id === mc.id);
        const newEarned = (currentMember?.earnedInterest || 0) + share;

        await supabase
          .from('savings_group_members')
          .update({ earned_interest: newEarned })
          .eq('id', mc.id);
      }

      // 4. Record yield
      await supabase.from('savings_yields').insert([{
        group_id: groupId,
        amount: amount,
        source_type: 'loan_interest',
        distributed: true
      }]);

      fetchData();
    } catch (error) {
      console.error('Error distributing interest:', error);
      throw error;
    }
  };

  // Statistics
  const stats = {
    totalClients: clients.length,
    activeCredits: credits.filter(
      (c) => c.status === 'active' || c.status === 'overdue'
    ).length,
    totalLent: credits.reduce((sum, c) => sum + c.amount, 0),
    overdueCredits: credits.filter((c) => c.status === 'overdue').length,
    totalCollected: payments.reduce((sum, p) => sum + p.amount, 0),
    totalSavings: contributions.reduce((sum, c) => sum + c.amount, 0),
    totalInternalLoans: savingsLoans.length,
    activeGroups: savingsGroups.filter(g => g.status === 'active').length,
    pendingContributions: 0,
    monthEntries: contributions
      .filter(c => new Date(c.paymentDate).getMonth() === new Date().getMonth())
      .reduce((sum, c) => sum + c.amount, 0),
    remanescente: contributions.reduce((sum, c) => sum + c.amount, 0) -
      savingsLoans.filter(l => l.status === 'approved' || l.status === 'overdue').reduce((sum, l) => sum + l.amount, 0) +
      0, // Add repayments here when installments are implemented
    totalDebt: savingsLoans
      .filter(l => l.status === 'approved' || l.status === 'overdue')
      .reduce((sum, l) => sum + l.remainingAmount, 0)
  };

  const getMemberFinancials = (clientId: string) => {
    // 1. Find the member record for this client
    const member = groupMembers.find(m => m.userId === clientId || m.id === clientId);
    if (!member) {
      return { totalSaved: 0, totalDebt: 0, interestRate: 10 };
    }

    // 2. Calculate contributions
    const totalSaved = contributions
      .filter(c => c.memberId === member.id)
      .reduce((sum, c) => sum + c.amount, 0) + (member.initialSavings || 0);

    // 3. Calculate debt from loans
    const totalDebt = savingsLoans
      .filter(l => l.memberId === member.id && (l.status === 'approved' || l.status === 'overdue'))
      .reduce((sum, l) => sum + l.remainingAmount, 0);

    return {
      totalSaved,
      totalDebt,
      interestRate: member.customInterestRate || 10
    };
  };

  const ensureMemberForClient = async (clientId: string) => {
    // Check if member already exists
    const existing = groupMembers.find(m => m.userId === clientId);
    if (existing) return existing.id;

    // Check if a default group exists
    let defaultGroup = savingsGroups.find(g => g.name === 'Sistema Koda');
    if (!defaultGroup) {
      const newGroup = await addSavingsGroup({
        name: 'Sistema Koda',
        description: 'Grupo padrão para gestão individual de poupanças.',
        contributionAmount: 0,
        periodicity: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        lateFee: 0,
        interestRate: 10,
        maxLoanPerMember: 1000000
      });
      defaultGroup = newGroup;
    }

    if (!defaultGroup) throw new Error("Não foi possível estabelecer um grupo para o membro.");

    const client = clients.find(c => c.id === clientId);
    const member = await manuallyAddMember({
      groupId: defaultGroup.id,
      userId: clientId,
      name: client?.name || 'Membro Koda',
      initialSavings: 0,
      initialDebt: 0
    });

    return member?.id;
  };

  const addMemberContribution = async (clientId: string, amount: number, notes?: string) => {
    try {
      const memberId = await ensureMemberForClient(clientId);
      if (!memberId) throw new Error("Erro ao identificar registro de membro.");

      await addContribution({
        memberId,
        amount,
        periodIndex: 1, // Individual management doesn't strictly follow periods
        lateFeePaid: 0,
        notes
      });

      toast.success('Poupança registada com sucesso!');
    } catch (error) {
      console.error('Error adding member contribution:', error);
      toast.error('Erro ao registar poupança.');
      throw error;
    }
  };

  const addMemberLoan = async (clientId: string, amount: number, termMonths: number) => {
    try {
      const memberId = await ensureMemberForClient(clientId);
      if (!memberId) throw new Error("Erro ao identificar registro de membro.");

      const defaultGroup = savingsGroups.find(g => g.name === 'Sistema Koda');

      await requestLoan({
        groupId: defaultGroup?.id || '',
        memberId,
        amount,
        interestRate: 10, // Default or pull from member customs
        termMonths
      });

      toast.success('Empréstimo registado com sucesso!');
    } catch (error) {
      console.error('Error adding member loan:', error);
      toast.error('Erro ao registar empréstimo.');
      throw error;
    }
  };

  const state = {
    clients,
    credits,
    payments,
    savingsGroups,
    groupMembers,
    allProfiles,
    contributions,
    savingsLoans,
    loading,
    addClient,
    updateClient,
    deleteClient,
    addCredit,
    updateCreditStatus,
    addPayment,
    addSavingsGroup,
    joinGroup,
    manuallyAddMember,
    addContribution,
    requestLoan,
    approveLoan,
    repaySavingsLoan,
    registerYield,
    distributeInterest,
    addMemberContribution,
    addMemberLoan,
    getMemberFinancials,
    getClientCredits,
    getClientPayments,
    getCreditPayments,
    getCreditWithDetails,
    getOverdueCreditsWithDetails,
    stats,
    isAdmin,
    isSystemAdmin,
    profile,
    company
  };

  return state as any;
}