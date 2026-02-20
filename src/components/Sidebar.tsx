import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAppState } from '../hooks/useAppState';
import { PiggyBank } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: () => void;
  isOpen: boolean;
}

export function Sidebar({ currentPage, onNavigate, isOpen }: SidebarProps) {
  const { signOut, isSystemAdmin } = useAuth();
  const { company } = useAppState();
  const navigate = useNavigate();

  const isSavings = company?.type === 'savings';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      path: '/clients',
    },
    {
      id: 'credits',
      label: 'Créditos',
      icon: CreditCard,
      path: '/credits',
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      path: '/reports',
    },
    {
      id: 'messages',
      label: 'Mensagens',
      icon: MessageSquare,
      path: '/messages',
    },
    {
      id: 'savings-groups',
      label: isSavings ? 'Membros' : 'Grupos de Poupança',
      icon: Users,
      path: '/savings-groups',
    },
  ].filter(item => {
    if (isSavings) {
      // Hide Credits for Savings groups
      return item.id !== 'credits';
    } else {
      // Hide Savings Groups for Microcredit
      return item.id !== 'savings-groups';
    }
  });

  const otherItems = [
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      path: '/settings',
    },
    {
      id: 'support',
      label: 'Suporte',
      icon: HelpCircle,
      path: '/support',
    },
  ];

  const adminItems = isSystemAdmin
    ? [
      {
        id: 'admin/dashboard',
        label: 'Painel de Gestão',
        icon: Shield,
        path: '/admin/dashboard',
      },
    ]
    : [];

  const finalMenuItems = isSystemAdmin ? [] : menuItems;
  const finalOtherItems = isSystemAdmin ? [] : otherItems;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1B3A2D] text-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}
    >
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-inner">
            {isSavings ? <PiggyBank className="w-6 h-6 text-white" /> : <CreditCard className="w-6 h-6 text-white" />}
          </div>
          <div>
            <span className="text-xl font-bold font-montserrat tracking-tight block">
              <span>Koda</span>
            </span>
            <span className={`text-[10px] ${isSavings ? 'text-emerald-300' : 'text-green-300'} font-medium uppercase tracking-[0.2em]`}>
              <span>{isSavings ? 'Poupança' : 'Microcrédito'}</span>
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {/* Main Menu */}
          {!isSystemAdmin && (
            <div className="pt-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4 px-4 opacity-70">
                Menu Principal
              </h3>
              <nav className="space-y-2">
                {finalMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={onNavigate}
                      className={`
                        w-full flex items-center justify-between px-5 py-4 lg:py-3.5 rounded-xl text-sm font-bold transition-all
                        ${isActive
                          ? 'bg-[#40916C] text-white shadow-xl shadow-green-950/40 translate-x-1'
                          : 'text-green-100/70 hover:bg-[#2D6A4F] hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-green-300'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Admin Menu */}
          {isSystemAdmin && adminItems.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4 px-4 opacity-70">
                Administração
              </h3>
              <nav className="space-y-2">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={onNavigate}
                      className={`
                        w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 translate-x-1'
                          : 'text-gray-300 hover:bg-purple-600/20 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Others Menu */}
          {!isSystemAdmin && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                Outros
              </h3>
              <nav className="space-y-1">
                {finalOtherItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={onNavigate}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-[#40916C] text-white shadow-sm'
                          : 'text-gray-300 hover:bg-[#2D6A4F] hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </div>
    </aside>
  );
}