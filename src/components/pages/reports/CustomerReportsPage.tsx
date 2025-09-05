import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { Customer } from '../../../types';
import { subMonths } from 'date-fns';
import { Button } from '../../ui/Button';
import { ArrowLeft } from 'lucide-react';

export function CustomerReportsPage() {
    const { customers } = mockData;
    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => c.createdAt > subMonths(new Date(), 1)).length;
    const topSpenders = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

    return (
        <div>
            <PageHeader title="Customer Reports" subtitle="Understand customer behavior, loyalty, and purchase history.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Total Customers</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{totalCustomers}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">New Customers (Last 30 days)</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{newCustomers}</p></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><h3 className="font-semibold">Top 5 Spenders</h3></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Total Spent</th>
                                    <th className="px-6 py-3">Visits</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSpenders.map((customer: Customer) => (
                                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{customer.name}</td>
                                        <td className="px-6 py-4">{customer.email}</td>
                                        <td className="px-6 py-4 font-medium">{formatCurrency(customer.totalSpent)}</td>
                                        <td className="px-6 py-4">{customer.visitCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
