import { Client, Credit, Payment } from '../types';


export const mockClients: Client[] = [
  {
    id: '1',
    name: 'João Macamo',
    bi: '11029384750B',
    phone: '+258 84 123 4567',
    email: 'joao.macamo@email.com',
    address: 'Bairro Central, Maputo',
    registeredAt: '2023-11-15',
    notes: 'Cliente VIP. Fiador: António Silva (Pai)',
    residenceProof: 'comprovativo_agua_nov23.pdf'
  },
  {
    id: '2',
    name: 'Maria Sitoe',
    bi: '22039485761C',
    phone: '+258 82 987 6543',
    email: 'maria.sitoe@email.com',
    address: 'Matola Rio, Maputo',
    registeredAt: '2023-12-01',
    notes: 'Bom histórico de pagamentos.'
  },
  {
    id: '3',
    name: 'Carlos Mondlane',
    bi: '33049586772D',
    phone: '+258 86 555 4444',
    email: 'carlos.m@email.com',
    address: 'Zimpeto, Maputo',
    registeredAt: '2024-01-10',
    notes: 'Requer atenção nos prazos.'
  },
  {
    id: '4',
    name: 'Ana Cossa',
    bi: '44059687783E',
    phone: '+258 84 222 3333',
    email: 'ana.cossa@email.com',
    address: 'Polana Cimento, Maputo',
    registeredAt: '2024-02-05'
  },
  {
    id: '5',
    name: 'Pedro Nhaca',
    bi: '55069788794F',
    phone: '+258 87 111 9999',
    email: 'pedro.nhaca@email.com',
    address: 'Costa do Sol, Maputo',
    registeredAt: '2024-02-20'
  }];


export const mockCredits: Credit[] = [
  {
    id: '101',
    clientId: '1',
    amount: 25000,
    interestRate: 15,
    termMonths: 3,
    numberOfInstallments: 3,
    startDate: '2023-12-01',
    endDate: '2024-03-01',
    status: 'paid',
    totalToPay: 28750,
    remainingAmount: 0
  },
  {
    id: '102',
    clientId: '2',
    amount: 50000,
    interestRate: 10,
    termMonths: 6,
    numberOfInstallments: 6,
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    status: 'active',
    totalToPay: 55000,
    remainingAmount: 35000
  },
  {
    id: '103',
    clientId: '3',
    amount: 10000,
    interestRate: 20,
    termMonths: 1,
    numberOfInstallments: 1,
    startDate: '2024-02-01',
    endDate: '2024-03-01',
    status: 'overdue',
    totalToPay: 12000,
    remainingAmount: 12000
  },
  {
    id: '104',
    clientId: '4',
    amount: 100000,
    interestRate: 12,
    termMonths: 12,
    numberOfInstallments: 12,
    startDate: '2024-02-10',
    endDate: '2025-02-10',
    status: 'pending',
    totalToPay: 112000,
    remainingAmount: 112000
  }];


export const mockPayments: Payment[] = [
  {
    id: 'p1',
    creditId: '101',
    amount: 10000,
    date: '2024-01-01',
    type: 'partial',
    description: 'Pagamento inicial via M-Pesa'
  },
  {
    id: 'p2',
    creditId: '101',
    amount: 18750,
    date: '2024-02-01',
    type: 'total',
    description: 'Quitação antecipada em dinheiro'
  },
  {
    id: 'p3',
    creditId: '102',
    amount: 20000,
    date: '2024-02-15',
    type: 'partial',
    description: 'Parcela 1 e 2 via transferência'
  }];