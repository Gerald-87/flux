import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Users } from 'lucide-react';
import { Sale } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { mockData } from '../../lib/mockData';

interface TopCashiersChartProps {
  sales: Sale[];
}

export function TopCashiersChart({ sales }: TopCashiersChartProps) {
  const cashierData = useMemo(() => {
    const cashierSales = sales.reduce((acc, sale) => {
      const cashierId = sale.cashierId;
      if (!cashierId) return acc;
      
      if (!acc[cashierId]) {
        acc[cashierId] = { count: 0, total: 0 };
      }
      acc[cashierId].count += 1;
      acc[cashierId].total += sale.total;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const maxSales = Math.max(...Object.values(cashierSales).map(c => c.total));

    return Object.entries(cashierSales)
      .map(([cashierId, data]) => {
        const cashier = mockData.users.find(u => u.id === cashierId);
        return {
          id: cashierId,
          name: cashier?.name || 'Unknown Cashier',
          count: data.count,
          total: data.total,
          percentage: maxSales > 0 ? (data.total / maxSales) * 100 : 0
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 cashiers
  }, [sales]);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Top Cashiers
        </h3>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-3 px-4 pb-4">
          {cashierData.length > 0 ? (
            cashierData.map((cashier, index) => (
              <div key={cashier.id} className="flex flex-col items-center flex-1">
                <div className="relative flex flex-col items-center justify-end h-48 w-full">
                  <div className="text-xs font-medium mb-1 text-center">
                    {formatCurrency(cashier.total)}
                  </div>
                  <div
                    className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-500 w-12 min-h-[8px]"
                    style={{
                      height: `${Math.max(cashier.percentage * 1.6, 8)}px`
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="text-xs font-medium text-gray-900 max-w-16 truncate">
                    {cashier.name.split(' ')[0]}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {cashier.count} {cashier.count === 1 ? 'sale' : 'sales'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 w-full">
              No cashier data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
