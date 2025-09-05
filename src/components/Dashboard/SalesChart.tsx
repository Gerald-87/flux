import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const salesData = [
  { name: 'Mon', sales: 2400, orders: 24 },
  { name: 'Tue', sales: 1398, orders: 18 },
  { name: 'Wed', sales: 9800, orders: 45 },
  { name: 'Thu', sales: 3908, orders: 32 },
  { name: 'Fri', sales: 4800, orders: 38 },
  { name: 'Sat', sales: 3800, orders: 35 },
  { name: 'Sun', sales: 4300, orders: 41 }
];

const monthlyData = [
  { name: 'Jan', sales: 45000, orders: 450 },
  { name: 'Feb', sales: 52000, orders: 520 },
  { name: 'Mar', sales: 48000, orders: 480 },
  { name: 'Apr', sales: 61000, orders: 610 },
  { name: 'May', sales: 55000, orders: 550 },
  { name: 'Jun', sales: 67000, orders: 670 }
];

export function SalesChart() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [metric, setMetric] = useState<'sales' | 'orders'>('sales');

  const data = period === 'week' ? salesData : monthlyData;

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
            <option value="sales">Sales ($)</option>
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
