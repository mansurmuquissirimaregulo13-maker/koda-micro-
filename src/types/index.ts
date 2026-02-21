
export interface Client {
    id: string;
    name: string;
    bi: string;
    phone: string;
    email: string;
    address: string;
    photo?: string;
    registeredAt: string;
    notes?: string;
    residenceProof?: string;
}

export type CreditStatus = 'pending' | 'active' | 'paid' | 'overdue' | 'defaulted' | 'rejected';

export interface Credit {
    id: string;
    clientId: string;
    amount: number;
    interestRate: number;
    termMonths: number;
    numberOfInstallments: number;
    startDate: string;
    endDate: string;
    status: CreditStatus;
    totalToPay: number;
    remainingAmount: number;
    notes?: string;
}

export interface Payment {
    id: string;
    creditId: string;
    amount: number;
    date: string;
    type: 'partial' | 'total';
    description?: string;
    proof?: string;
}

export interface SavingsGroup {
    id: string;
    companyId?: string;
    name: string;
    description?: string;
    contributionAmount: number;
    periodicity: 'weekly' | 'monthly';
    startDate: string;
    endDate?: string;
    lateFee: number;
    interestRate: number;
    maxLoanPerMember: number;
    memberLimit?: number;
    status: 'active' | 'closed';
    createdAt: string;
    createdBy: string;
}

export interface SavingsGroupMember {
    id: string;
    groupId: string;
    userId: string;
    name?: string;
    role: 'admin' | 'member';
    status: 'pending' | 'approved' | 'rejected';
    joinedAt: string;
    earnedInterest?: number;
    initialSavings?: number;
    initialDebt?: number;
    customInterestRate?: number;
}

export interface SavingsContribution {
    id: string;
    memberId: string;
    amount: number;
    periodIndex: number;
    paymentDate: string;
    status: 'paid' | 'overdue';
    lateFeePaid: number;
    notes?: string;
}

export interface SavingsLoan {
    id: string;
    groupId: string;
    memberId: string;
    amount: number;
    interestRate: number;
    termMonths: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid' | 'overdue';
    requestedAt: string;
    approvedAt?: string;
    approvedBy?: string;
    totalPayable: number;
    remainingAmount: number;
}
export interface SavingsLoanPayment {
    id: string;
    loanId: string;
    amount: number;
    paymentDate: string;
    notes?: string;
}

export interface SavingsYield {
    id: string;
    groupId: string;
    amount: number;
    sourceType: string;
    paymentDate?: string;
    distributed: boolean;
    notes?: string;
    createdAt?: string;
}
