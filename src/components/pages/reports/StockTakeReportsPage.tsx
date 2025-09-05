import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { StockTake } from '../../../types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';

export function StockTakeReportsPage() {
    const { stockTakes } = mockData;

    return (
        <div>
            <PageHeader title="Stock Take Reports" subtitle="Review history and accuracy of inventory counts.">
                 <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>
            <Card>
                <CardHeader><h3 className="font-semibold">Stock Take History</h3></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Location</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Created By</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockTakes.map((st: StockTake) => (
                                    <tr key={st.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{st.id}</td>
                                        <td className="px-6 py-4">{st.location}</td>
                                        <td className="px-6 py-4">{formatDate(st.completedAt || st.createdAt)}</td>
                                        <td className="px-6 py-4">{mockData.cashiers.find(c => c.id === st.createdBy)?.name || 'System'}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">{st.status}</span></td>
                                        <td className="px-6 py-4">{st.notes}</td>
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
