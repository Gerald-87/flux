import React from 'react';
import { Building2, Users, DollarSign, AlertCircle } from 'lucide-react';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';

export function AdminDashboardStats() {
    const { vendors } = mockData;
    const totalVendors = vendors.length;
    const pendingApproval = vendors.filter(v => !v.isApproved).length;
    const totalRevenue = vendors.reduce((acc, v) => {
        if (v.subscriptionPlan === 'basic') return acc + 29;
        if (v.subscriptionPlan === 'standard') return acc + 59;
        if (v.subscriptionPlan === 'premium') return acc + 99;
        return acc;
    }, 0);

    const stats = [
        { title: 'Total Vendors', value: totalVendors, icon: Building2, color: 'blue' },
        { title: 'Monthly Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'green' },
        { title: 'Active Users', value: '1,250', icon: Users, color: 'purple' }, // Mocked value
        { title: 'Pending Approval', value: pendingApproval, icon: AlertCircle, color: 'red' },
    ];

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        red: 'bg-red-100 text-red-600'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.title} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                );
            })}
        </div>
    );
}
