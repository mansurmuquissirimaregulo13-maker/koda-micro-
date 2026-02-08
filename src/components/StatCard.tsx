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
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full ${trend === 'up' ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'} backdrop-blur-sm border border-white/20`}>
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
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-[#1B1B1B] font-montserrat">
          {value}
        </p>
      </div>
    </div>
  );
}