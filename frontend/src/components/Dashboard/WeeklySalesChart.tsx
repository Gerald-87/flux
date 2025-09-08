import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { BarChart3 } from 'lucide-react';
import { Sale } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';

interface WeeklySalesChartProps {
  sales: Sale[];
}

export function WeeklySalesChart({ sales }: WeeklySalesChartProps) {
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysOfWeek.map(day => {
      const daySales = sales.filter(sale => isSameDay(new Date(sale.createdAt), day));
      const total = daySales.reduce((sum, sale) => sum + sale.total, 0);
      return {
        day: format(day, 'EEE'),
        date: format(day, 'MMM dd'),
        total,
        count: daySales.length
      };
    });
  }, [sales]);

  const maxSales = Math.max(...weeklyData.map(d => d.total), 1);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Weekly Sales
        </h3>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2 px-4 pb-4">
          {weeklyData.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative flex flex-col items-center justify-end h-48 w-full">
                <div className="text-xs font-medium mb-1 text-center">
                  {formatCurrency(data.total)}
                </div>
                <div
                  className="bg-blue-600 rounded-t transition-all duration-500 w-8 min-h-[4px]"
                  style={{
                    height: maxSales > 0 ? `${Math.max((data.total / maxSales) * 180, 4)}px` : '4px'
                  }}
                />
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-gray-900">{data.day}</div>
                <div className="text-xs text-gray-500">{data.date}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {data.count} {data.count === 1 ? 'sale' : 'sales'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
