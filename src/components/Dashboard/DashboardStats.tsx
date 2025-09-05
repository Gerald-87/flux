import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Sale, Customer, Product } from '../../types';
import { isToday } from 'date-fns';

interface DashboardStatsProps {
    sales: Sale[];
    customers: Customer[];
    products: Product[];
}

export function DashboardStats({ sales, customers, products }: DashboardStatsProps) {
    const todaySales = sales.filter(s => isToday(s.createdAt)).reduce((sum, s) => sum + s.total, 0);
    const todayOrders = sales.filter(s => isToday(s.createdAt)).length;
    const newCustomers = customers.filter(c => isToday(c.createdAt)).length;
    const lowStockItems = products.filter(p => p.stock < p.minStock).length;

    const statsData = [
      {
        title: 'Today\'s Sales',
        value: todaySales,
        change: '+12.5%',
        changeType: 'increase' as const,
        icon: DollarSign,
        color: 'blue'
      },
      {
        title: 'Today\'s Orders',
        value: todayOrders,
        change: '+8.2%',
        changeType: 'increase' as const,
        icon: ShoppingCart,
        color: 'green'
      },
      {
        title: 'New Customers',
        value: newCustomers,
        change: '-2.1%',
        changeType: 'decrease' as const,
        icon: Users,
        color: 'purple'
      },
      {
        title: 'Low Stock Items',
        value: lowStockItems,
        change: '+3',
        changeType: 'increase' as const,
        icon: Package,
        color: 'red'
      }
    ];

    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600'
    };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const displayValue = stat.title.includes('Sales') ? formatCurrency(stat.value) : stat.value.toLocaleString();
        return (
          <div key={stat.title} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{displayValue}</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
