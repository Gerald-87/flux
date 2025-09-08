import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Sale } from '../../types';
import { format, subDays, subMonths } from 'date-fns';

interface SalesChartProps {
    sales: Sale[];
}

export function SalesChart({ sales }: SalesChartProps) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [metric, setMetric] = useState<'sales' | 'orders'>('sales');

  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const daySales = sales.filter(s => format(s.createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    return {
      name: format(date, 'E'),
      sales: daySales.reduce((sum, s) => sum + s.total, 0),
      orders: daySales.length,
    };
  });

  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthSales = sales.filter(s => format(s.createdAt, 'yyyy-MM') === format(date, 'yyyy-MM'));
    return {
      name: format(date, 'MMM'),
      sales: monthSales.reduce((sum, s) => sum + s.total, 0),
      orders: monthSales.length,
    };
  });

  const data = period === 'week' ? weeklyData : monthlyData;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Sales Analytics</h3>
        <div className="flex space-x-2">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as 'sales' | 'orders')}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="sales">Sales (K)</option>
            <option value="orders">Orders</option>
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'week' | 'month')}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="week">This Week</option>
            <option value="month">Last 6 Months</option>
          </select>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {period === 'week' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={metric} 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey={metric} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
