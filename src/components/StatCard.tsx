import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: any;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'bg-blue-500'
}: StatCardProps) {
  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[10px] md:text-[11px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full ${trend === 'up' ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'} backdrop-blur-sm border border-white/20 whitespace-nowrap`}>
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendValue}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-[11px] md:text-sm font-medium text-gray-500 mb-0.5 md:mb-1 uppercase tracking-wider">{title}</h3>
        <p className="text-lg md:text-2xl font-bold text-[#1B1B1B] font-montserrat truncate">
          {value}
        </p>
      </div>
    </div>
  );
}