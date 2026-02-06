
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
