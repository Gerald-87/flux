import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatDate } from '../../../lib/utils';
import { StockMovement } from '../../../types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function TransferReportsPage() {
    const transfers = mockData.stockMovements.filter(m => m.type === 'transfer');

    const transfersByLocation = transfers.reduce((acc, t) => {
        const location = t.to || 'Unknown';
        acc[location] = (acc[location] || 0) + t.quantity;
        return acc;
    }, {} as Record<string, number>);

    const locationData = Object.entries(transfersByLocation).map(([name, quantity]) => ({ name, quantity }));

    return (
        <div>
            <PageHeader title="Transfer Reports" subtitle="Track all stock movements between your locations.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Items Transferred by Location</h3></CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={locationData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="quantity" name="Items Transferred" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Summary</h3></CardHeader>
                    <CardContent className="flex flex-col justify-center h-80">
                        <div className="space-y-4">
                            <div className="flex justify-between text-lg">
                                <span className="font-medium">Total Transfers:</span>
                                <span className="font-bold">{transfers.length}</span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span className="font-medium">Total Items Transferred:</span>
                                <span className="font-bold">{transfers.reduce((sum, t) => sum + t.quantity, 0)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><h3 className="font-semibold">Detailed Transfer History</h3></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3 text-right">Quantity</th>
                                    <th className="px-6 py-3">From</th>
                                    <th className="px-6 py-3">To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfers.map((t: StockMovement) => (
                                    <tr key={t.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{formatDate(t.createdAt)}</td>
                                        <td className="px-6 py-4 font-medium">{mockData.products.find(p => p.id === t.productId)?.name}</td>
                                        <td className="px-6 py-4 text-right">{t.quantity}</td>
                                        <td className="px-6 py-4">{t.from}</td>
                                        <td className="px-6 py-4">{t.to}</td>
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
