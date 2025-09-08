import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, ClipboardList, ChevronDown, Package } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { Product } from '../../types';
import { formatDate, cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const CurrentStockLevels = ({ products, locations }: { products: Product[], locations: string[] }) => {
    return (
        <Card>
            <CardHeader>
                <h2 className="text-lg font-semibold flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Current Stock Levels
                </h2>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                {locations.map(loc => (
                                    <th key={loc} className="px-6 py-3 text-center">{loc}</th>
                                ))}
                                <th className="px-6 py-3 text-center font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.slice(0, 20).map(p => (
                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{p.name}</td>
                                    {locations.map(loc => (
                                        <td key={loc} className="px-6 py-4 text-center">{p.stockByLocation[loc] || 0}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center font-bold">{p.stock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {products.length > 20 && <p className="text-center text-xs text-gray-500 py-2">Showing 20 of {products.length} products.</p>}
                </div>
            </CardContent>
        </Card>
    );
};


export function StockTakingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'take' | 'history'>('take');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const vendorData = useMemo(() => {
    if (!user?.vendorId) return { products: [], stockTakes: [], locations: [] };
    
    const products = mockData.products.filter(p => p.vendorId === user.vendorId);
    const stockTakes = mockData.stockTakes.filter(st => st.vendorId === user.vendorId);
    const locations = [...new Set(products.flatMap(p => Object.keys(p.stockByLocation)))];
    
    return { products, stockTakes, locations };
  }, [user]);

  const stockTakeHistory = useMemo(() => {
    if (user?.role === 'cashier') {
      return vendorData.stockTakes.filter(st => st.createdBy === user.id);
    }
    return vendorData.stockTakes;
  }, [user, vendorData.stockTakes]);

  const handleStartNewStockTake = (location: string) => {
    if (!location) {
        toast.error("No location assigned to this cashier.");
        return;
    }
    const newStockTakeId = `ST-${new Date().getTime()}`;
    toast.success(`Starting new stock take for ${location}...`);
    navigate(`/stock-taking/${newStockTakeId}`, { state: { location } });
    setIsLocationDropdownOpen(false);
  };
  
  const StartStockTakeButton = () => {
      if (user?.role === 'vendor') {
          return (
            <div className="relative inline-block text-left">
                <div>
                    <Button onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Stock Take
                        <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                </div>
                {isLocationDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                            {vendorData.locations.map(location => (
                                <a key={location} href="#" onClick={(e) => { e.preventDefault(); handleStartNewStockTake(location); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    {location}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          );
      }
      return (
         <Button onClick={() => handleStartNewStockTake(user!.terminalId!)}>
            <Plus className="h-4 w-4 mr-2" />
            Start Stock Take ({user?.terminalId})
        </Button>
      );
  };

  return (
    <div>
      <PageHeader title="Stock Taking" subtitle="Perform inventory audits and reconcile stock." />

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('take')}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'take'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Stock Levels & Actions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Stock Take History
          </button>
        </nav>
      </div>
      
      <div>
        {activeTab === 'take' && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-end">
                    <StartStockTakeButton />
                </div>
                <CurrentStockLevels products={vendorData.products} locations={vendorData.locations} />
            </div>
        )}

        {activeTab === 'history' && (
            <div className="animate-fade-in">
                 <Card>
                    <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center">
                        <ClipboardList className="h-5 w-5 mr-2" />
                        Stock Take History
                    </h2>
                    </CardHeader>
                    <CardContent>
                    {stockTakeHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3">Date Completed</th>
                                <th className="px-6 py-3">Created By</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {stockTakeHistory.map(st => (
                                <tr key={st.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{st.id}</td>
                                <td className="px-6 py-4">{st.location}</td>
                                <td className="px-6 py-4">{st.completedAt ? formatDate(st.completedAt) : 'N/A'}</td>
                                <td className="px-6 py-4">{mockData.users.find(c => c.id === st.createdBy)?.name || 'System'}</td>
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
                    ) : (
                        <div className="text-center py-12">
                        <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-xl font-semibold text-gray-900">No Stock Take History</h3>
                        <p className="mt-1 text-sm text-gray-500">Your completed stock takes will appear here.</p>
                        </div>
                    )}
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}
