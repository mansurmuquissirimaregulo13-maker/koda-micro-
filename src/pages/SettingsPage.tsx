import { User, Bell, Globe, Shield } from 'lucide-react';
import { WhatsAppSettings } from '../components/WhatsAppSettings';
export function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[#1B1B1B] font-montserrat">
          Configurações
        </h2>
        <p className="text-gray-500 text-sm">
          Gerencie suas preferências e conta.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {/* Profile Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Perfil do Administrador
              </h3>
              <p className="text-sm text-gray-500">Informações da sua conta</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                defaultValue="Administrador Koda"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none" />

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                defaultValue="admin@kodamicro.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none" />

            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Notificações
              </h3>
              <p className="text-sm text-gray-500">Gerencie seus alertas</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* WhatsApp Integration Component */}
            <WhatsAppSettings />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Alertas por WhatsApp
                </p>
                <p className="text-xs text-gray-500">
                  Receber resumo diário no WhatsApp
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked />

                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#40916C]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Alertas de Atraso</p>
                <p className="text-xs text-gray-500">
                  Notificar quando um crédito vencer
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked />

                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#40916C]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sistema</h3>
              <p className="text-sm text-gray-500">Configurações regionais</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Moeda</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none bg-white">
                <option>Metical (MZN)</option>
                <option>Dólar (USD)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Idioma
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none bg-white">
                <option>Português (Moçambique)</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-[#1B3A2D] text-white rounded-lg font-medium hover:bg-[#2D6A4F] shadow-lg shadow-green-900/20">
          Salvar Alterações
        </button>
      </div>
    </div>);

}