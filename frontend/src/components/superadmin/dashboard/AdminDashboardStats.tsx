import { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, AlertCircle } from 'lucide-react';
import { vendorService, SystemAnalytics } from '../../../services/vendorService';
import { formatCurrency } from '../../../lib/utils';

export function AdminDashboardStats() {
    const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await vendorService.getSystemAnalytics('30d');
                setAnalytics(data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
                setAnalytics(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">Failed to load analytics data</p>
            </div>
        );
    }

    const stats = [
        { title: 'Total Vendors', value: analytics.overview.totalVendors, icon: Building2, color: 'blue' },
        { title: 'Total Revenue', value: formatCurrency(analytics.overview.totalRevenue), icon: DollarSign, color: 'green' },
        { title: 'Active Users', value: analytics.overview.totalUsers, icon: Users, color: 'purple' },
        { title: 'New Vendors (30d)', value: analytics.overview.newVendors, icon: AlertCircle, color: 'red' },
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
