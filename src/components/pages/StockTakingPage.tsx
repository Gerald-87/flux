import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, ClipboardList } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { StockTake } from '../../types';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export function StockTakingPage() {
  const [stockTakes, setStockTakes] = useState<StockTake[]>(mockData.stockTakes);
  const navigate = useNavigate();

  const handleStartNewStockTake = () => {
    const newStockTakeId = `ST-${new Date().getTime()}`;
    // In a real app, you'd save this to a backend. Here we just navigate.
    toast.success('Starting new stock take...');
    navigate(`/stock-taking/${newStockTakeId}`);
  };

  return (
    <div>
      <PageHeader title="Stock Taking" subtitle="Perform inventory audits and reconcile stock.">
        <Button onClick={handleStartNewStockTake}>
          <Plus className="h-4 w-4 mr-2" />
          Start New Stock Take
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Past Stock Takes
          </h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Date Completed</th>
                  <th className="px-6 py-3">Created By</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stockTakes.map(st => (
                  <tr key={st.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{st.id}</td>
                    <td className="px-6 py-4">{st.completedAt ? formatDate(st.completedAt) : 'N/A'}</td>
                    <td className="px-6 py-4">{mockData.cashiers.find(c => c.id === st.createdBy)?.name || 'System'}</td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {st.status}
                        </span>
                    </td>
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
