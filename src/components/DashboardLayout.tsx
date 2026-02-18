import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DashboardPage } from '../pages/DashboardPage';
import { ClientsPage } from '../pages/ClientsPage';
import { CreditsPage } from '../pages/CreditsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { SupportPage } from '../pages/SupportPage';
import { MessagesPage } from '../pages/MessagesPage';
import { SavingsGroupsPage } from '../pages/SavingsGroupsPage';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import { LoadingScreen } from './LoadingScreen';
import { Modal } from './Modal';
import { ClientForm } from './ClientForm';
import { CreditForm } from './CreditForm';
import { useAppState } from '../hooks/useAppState';
import { toast } from 'sonner';

export function DashboardLayout() {
    const location = useLocation();
    const { addClient, addCredit, clients, isSystemAdmin, loading } = useAppState();

    // Determine current path
    let currentPath = location.pathname.replace('/', '');
    if (!currentPath && isSystemAdmin) {
        currentPath = 'admin/dashboard';
    } else if (!currentPath) {
        currentPath = 'dashboard';
    }

    // Fallback para caminhos antigos ou tratamentos especiais
    if (currentPath === 'admin/companies') {
        currentPath = 'admin/dashboard';
    }

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleNewClient = (data: any) => {
        addClient(data);
        setIsClientModalOpen(false);
    };

    const handleNewCredit = (data: any) => {
        addCredit(data);
        setIsCreditModalOpen(false);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const handleNotificationClick = () => {
        toast.info('Nenhuma notificação nova no momento.');
    };

    const renderPage = () => {
        switch (currentPath) {
            case 'dashboard':
                return (
                    <DashboardPage
                        onNewClient={() => setIsClientModalOpen(true)}
                        onNewCredit={() => setIsCreditModalOpen(true)}
                    />
                );
            case 'clients':
                return <ClientsPage searchTerm={searchTerm} />;
            case 'credits':
                return <CreditsPage searchTerm={searchTerm} />;
            case 'reports':
                return <ReportsPage />;
            case 'settings':
                return <SettingsPage />;
            case 'support':
                return <SupportPage />;
            case 'messages':
                return <MessagesPage />;
            case 'savings-groups':
                return <SavingsGroupsPage />;
            case 'admin/dashboard':
                return <SuperAdminDashboard />;
            case 'admin/users':
                return <AdminUsersPage />;
            default:
                return (
                    <DashboardPage
                        onNewClient={() => setIsClientModalOpen(true)}
                        onNewCredit={() => setIsCreditModalOpen(true)}
                    />
                );
        }
    };

    const getPageTitle = () => {
        switch (currentPath) {
            case 'dashboard':
                return 'Dashboard';
            case 'clients':
                return 'Clientes';
            case 'credits':
                return 'Créditos';
            case 'reports':
                return 'Relatórios';
            case 'settings':
                return 'Configurações';
            case 'support':
                return 'Suporte';
            case 'messages':
                return 'Centro de Mensagens';
            case 'savings-groups':
                return 'Grupos de Poupança';
            case 'admin/dashboard':
                return 'Painel de Gestão Admin';
            case 'admin/users':
                return 'Gerenciar Usuários';
            default:
                return 'Dashboard';
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-[#F7F7F2] flex font-sans text-[#1B1B1B]">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                currentPage={currentPath}
                onNavigate={() => setIsSidebarOpen(false)}
                isOpen={isSidebarOpen}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title={getPageTitle()}
                    onSearch={handleSearch}
                    onNotification={handleNotificationClick}
                />

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-[calc(100vh-4rem)]">
                    <div className="max-w-7xl mx-auto">{renderPage()}</div>
                </main>
            </div>

            {/* Global Quick Action Modals */}
            <Modal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                title="Novo Cliente"
            >
                <ClientForm
                    onSubmit={handleNewClient}
                    onCancel={() => setIsClientModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isCreditModalOpen}
                onClose={() => setIsCreditModalOpen(false)}
                title="Novo Crédito"
            >
                <CreditForm
                    clients={clients}
                    onSubmit={handleNewCredit}
                    onCancel={() => setIsCreditModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
