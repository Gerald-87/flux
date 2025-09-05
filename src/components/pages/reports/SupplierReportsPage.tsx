import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';

export function SupplierReportsPage() {
    const { suppliers, purchases } = mockData;

    const supplierPerformance = suppliers.map(supplier => {
        const supplierPurchases = purchases.filter(p => p.supplierId === supplier.id);
        const totalSpend = supplierPurchases.reduce((sum, p) => sum + p.total, 0);
        const purchaseCount = supplierPurchases.length;
        const avgPoValue = purchaseCount > 0 ? totalSpend / purchaseCount : 0;
        return { ...supplier, totalSpend, purchaseCount, avgPoValue };
    }).sort((a,b) => b.totalSpend - a.totalSpend);

    return (
        <div>
            <PageHeader title="Supplier Reports" subtitle="Evaluate supplier reliability and total spend.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>
            <Card>
                <CardHeader><h3 className="font-semibold">Supplier Performance</h3></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Supplier</th>
                                    <th className="px-6 py-3 text-right">Total Spend</th>
                                    <th className="px-6 py-3 text-right"># of POs</th>
                                    <th className="px-6 py-3 text-right">Avg. PO Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierPerformance.map(s => (
                                    <tr key={s.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{s.name}</td>
                                        <td className="px-6 py-4 text-right font-medium">{formatCurrency(s.totalSpend)}</td>
                                        <td className="px-6 py-4 text-right">{s.purchaseCount}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(s.avgPoValue)}</td>
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
