import { Search, Bell, Menu } from 'lucide-react';
interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
  onSearch?: (term: string) => void;
  onNotification?: () => void;
}

export function TopBar({ onMenuClick, title = 'Dashboard', onSearch, onNotification }: TopBarProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600">
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-bold text-[#1B1B1B] font-montserrat hidden sm:block">
          Koda Microcrédito
        </h1>
        <p className="text-sm text-gray-500 hidden sm:block">{title}</p>
      </div>


      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar..."
            className="pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-green-500 w-32 md:w-64 transition-all"
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={onNotification}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-8 rounded-full bg-[#1B3A2D] text-white flex items-center justify-center text-sm font-medium ring-2 ring-gray-100">
          AD
        </div>
      </div>
    </header >);
}