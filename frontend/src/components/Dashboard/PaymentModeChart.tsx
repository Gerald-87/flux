import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { CreditCard } from 'lucide-react';
import { Sale } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface PaymentModeChartProps {
  sales: Sale[];
}

export function PaymentModeChart({ sales }: PaymentModeChartProps) {
  const paymentData = useMemo(() => {
    const paymentMethods = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'cash';
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count += 1;
      acc[method].total += sale.total;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

    return Object.entries(paymentMethods).map(([method, data]) => ({
      method: method.charAt(0).toUpperCase() + method.slice(1),
      count: data.count,
      total: data.total,
      percentage: totalSales > 0 ? (data.total / totalSales) * 100 : 0
    })).sort((a, b) => b.total - a.total);
  }, [sales]);

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // yellow
    '#EF4444', // red
    '#6366F1'  // indigo
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Methods
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          {paymentData.length > 0 ? (
            <div className="flex items-center space-x-8">
              {/* Pie Chart */}
              <div className="relative">
                <svg width="200" height="200" className="transform -rotate-90">
                  {paymentData.map((data, index) => {
                    const radius = 80;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDasharray = `${(data.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = paymentData.slice(0, index).reduce((acc, curr) => 
                      acc - (curr.percentage / 100) * circumference, 0
                    );
                    
                    return (
                      <circle
                        key={data.method}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={colors[index % colors.length]}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {paymentData.reduce((sum, data) => sum + data.count, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-3">
                {paymentData.map((data, index) => (
                  <div key={data.method} className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <div>
                      <div className="text-sm font-medium">{data.method}</div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(data.total)} • {data.count} transactions ({data.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payment data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
