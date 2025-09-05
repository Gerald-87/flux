import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { Sale } from '../../../types';
import { Button } from '../../ui/Button';
import { ArrowLeft } from 'lucide-react';

export function ProfitAndLossPage() {
    const { sales, products } = mockData;

    const calculateCOGS = (sale: Sale) => {
        return sale.items.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            return sum + (product ? product.costPrice * item.quantity : 0);
        }, 0);
    };

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCOGS = sales.reduce((sum, sale) => sum + calculateCOGS(sale), 0);
    const grossProfit = totalRevenue - totalCOGS;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return (
        <div>
            <PageHeader title="Profit & Loss Report" subtitle="Monitor revenue, costs, and overall profitability.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Total Revenue</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Cost of Goods Sold (COGS)</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-red-600">{formatCurrency(totalCOGS)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Gross Profit</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-blue-600">{formatCurrency(grossProfit)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Profit Margin</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-purple-600">{profitMargin.toFixed(2)}%</p></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><h3 className="font-semibold">Summary</h3></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">Total Revenue</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(totalRevenue)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">Cost of Goods Sold</td>
                                    <td className="px-6 py-4 text-right">({formatCurrency(totalCOGS)})</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-lg">Gross Profit</td>
                                    <td className="px-6 py-4 text-right font-bold text-lg">{formatCurrency(grossProfit)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
