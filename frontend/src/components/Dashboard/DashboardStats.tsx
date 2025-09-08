import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, UserCheck } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Sale, Customer, Product } from '../../types';
import { isToday } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { mockData } from '../../lib/mockData';

interface DashboardStatsProps {
    sales: Sale[];
    customers: Customer[];
    products: Product[];
}

export function DashboardStats({ sales, customers, products }: DashboardStatsProps) {
    const { user } = useAuth();
    const todaySales = sales.filter(s => isToday(s.createdAt)).reduce((sum, s) => sum + s.total, 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalCosts = sales.reduce((sum, s) => sum + (s.total * 0.6), 0); // Assuming 60% cost ratio
    const profit = totalRevenue - totalCosts;
    const loss = profit < 0 ? Math.abs(profit) : 0;
    const todayOrders = sales.filter(s => isToday(s.createdAt)).length;
    const newCustomers = customers.filter(c => isToday(c.createdAt)).length;
    const lowStockItems = products.filter(p => p.stock < p.minStock).length;
    
    // Get cashier count for vendors
    const cashierCount = user?.role === 'vendor' 
        ? mockData.users.filter(u => u.role === 'cashier' && u.vendorId === user.id).length 
        : 0;

    // Different stats for vendors vs cashiers
    const statsData = user?.role === 'vendor' ? [
      {
        title: 'Total Revenue',
        value: totalRevenue,
        change: '+12.5%',
        changeType: 'increase' as const,
        icon: DollarSign,
        color: 'blue'
      },
      {
        title: 'Total Products',
        value: products.length,
        change: '+5',
        changeType: 'increase' as const,
        icon: Package,
        color: 'green'
      },
      {
        title: 'Total Customers',
        value: customers.length,
        change: '+8',
        changeType: 'increase' as const,
        icon: Users,
        color: 'purple'
      },
      {
        title: 'Total Cashiers',
        value: cashierCount,
        change: '+2',
        changeType: 'increase' as const,
        icon: UserCheck,
        color: 'indigo'
      },
      {
        title: 'Total Profit',
        value: profit > 0 ? profit : 0,
        change: profit > 0 ? '+15.2%' : '0%',
        changeType: profit > 0 ? 'increase' as const : 'decrease' as const,
        icon: TrendingUp,
        color: 'emerald'
      },
      {
        title: 'Total Loss',
        value: loss,
        change: loss > 0 ? '-5.1%' : '0%',
        changeType: 'decrease' as const,
        icon: TrendingDown,
        color: 'red'
      }
    ] : [
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
        title: 'Customers Served',
        value: newCustomers,
        change: '+3',
        changeType: 'increase' as const,
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
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      emerald: 'bg-emerald-100 text-emerald-600'
    };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${user?.role === 'vendor' ? 'lg:grid-cols-3 xl:grid-cols-6' : 'lg:grid-cols-4'} gap-4 lg:gap-6`}>
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const displayValue = stat.title.includes('Revenue') || stat.title.includes('Profit') || stat.title.includes('Loss') || stat.title.includes('Sales') ? formatCurrency(stat.value) : stat.value.toLocaleString();
        return (
          <div key={stat.title} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{displayValue}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
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
