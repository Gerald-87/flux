import React from 'react';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';

export function SystemAnalyticsPage() {
    const revenueByPlan = mockData.vendors.reduce((acc, v) => {
        if (v.subscriptionPlan === 'basic') acc.basic = (acc.basic || 0) + 29;
        if (v.subscriptionPlan === 'standard') acc.standard = (acc.standard || 0) + 59;
        if (v.subscriptionPlan === 'premium') acc.premium = (acc.premium || 0) + 99;
        return acc;
    }, {} as Record<string, number>);

    const revenueData = Object.entries(revenueByPlan).map(([name, revenue]) => ({ name, revenue }));

    const vendorsByPlan = mockData.vendors.reduce((acc, v) => {
        acc[v.subscriptionPlan] = (acc[v.subscriptionPlan] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const vendorDistData = Object.entries(vendorsByPlan).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div>
            <PageHeader title="System Analytics" subtitle="Analyze platform-wide performance and trends." />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Revenue by Subscription Plan</h3></CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Bar dataKey="revenue" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Vendor Distribution by Plan</h3></CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={vendorDistData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {vendorDistData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
