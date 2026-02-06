import React from 'react';
import { TrendingUp, TrendingDown, BoxIcon } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string;
  icon: BoxIcon;
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
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend &&
        <div
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>

            {trend === 'up' ?
          <TrendingUp className="w-3 h-3" /> :

          <TrendingDown className="w-3 h-3" />
          }
            {trendValue}
          </div>
        }
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-[#1B1B1B] font-montserrat">
          {value}
        </p>
      </div>
    </div>);

}