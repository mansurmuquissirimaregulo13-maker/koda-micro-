import { Credit, Payment, CreditStatus } from '../types';


export const formatMZN = (value: number): string => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const calculateInterest = (
  principal: number,
  rate: number,
  _months: number)
  : number => {
  // Simple interest calculation: Principal * Rate * Time
  // Or flat rate on principal as requested: Principal + (Principal * Rate/100)
  // Let's stick to the flat rate model often used in microcredit
  const interestAmount = principal * (rate / 100);
  return principal + interestAmount;
};

export const calculateMonthlyInterest = (
  principal: number,
  monthlyRate: number,
  months: number)
  : number => {
  // Compound interest: P * (1 + r/100)^n
  // Not used in the main flow yet, but available if needed
  const amount = principal * Math.pow(1 + monthlyRate / 100, months);
  return amount;
};

export const calculateInstallmentValue = (
  totalToPay: number,
  installments: number)
  : number => {
  if (installments <= 0) return totalToPay;
  return totalToPay / installments;
};

export const calculateCurrentDebt = (credit: Credit, payments: Payment[]) => {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const interestAmount = credit.totalToPay - credit.amount;
  const interestPercentage = interestAmount / credit.amount * 100;

  return {
    originalAmount: credit.amount,
    interestAmount,
    interestPercentage,
    totalWithInterest: credit.totalToPay,
    totalPaid,
    currentBalance: credit.remainingAmount
  };
};

export const generateInstallmentSchedule = (
  totalToPay: number,
  installments: number,
  startDate: string) => {
  const installmentValue = calculateInstallmentValue(totalToPay, installments);
  const start = new Date(startDate);
  const schedule = [];

  for (let i = 1; i <= installments; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      number: i,
      dueDate: dueDate.toISOString().split('T')[0],
      amount: installmentValue,
      status: 'pending' // In a real app, we'd calculate this based on payments
    });
  }
  return schedule;
};

export const getDaysOverdue = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);

  if (today <= due) return 0;

  const diffTime = Math.abs(today.getTime() - due.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getStatusColor = (status: CreditStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'rejected':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: CreditStatus): string => {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'active':
      return 'Aprovado';
    case 'paid':
      return 'Pago';
    case 'overdue':
      return 'Atrasado';
    case 'rejected':
      return 'Rejeitado';
    default:
      return status;
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};