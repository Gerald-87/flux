import React, { useMemo } from 'react';
import { DashboardStats } from './DashboardStats';
import { SalesChart } from './SalesChart';
import { RecentSales } from './RecentSales';
import { LowStockAlerts } from './LowStockAlerts';
import { TopProducts } from './TopProducts';
import { useAuth } from '../../hooks/useAuth';
import { mockData } from '../../lib/mockData';
import { Sale } from '../../types';

export function Dashboard() {
  const { user } = useAuth();

  const scopedData = useMemo(() => {
    if (!user) return { sales: [], products: [], customers: [] };
    
    const vendorId = user.vendorId;
    let sales: Sale[] = mockData.sales.filter(s => s.vendorId === vendorId);
    
    if (user.role === 'cashier') {
      sales = sales.filter(s => s.cashierId === user.id);
    }
    
    const products = mockData.products.filter(p => p.vendorId === vendorId);
    const customers = mockData.customers.filter(c => c.vendorId === vendorId);

    return { sales, products, customers };
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <DashboardStats sales={scopedData.sales} customers={scopedData.customers} products={scopedData.products} />

      <div className="grid grid-cols-1 gap-6">
        <SalesChart sales={scopedData.sales} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LowStockAlerts products={scopedData.products} />
            <TopProducts sales={scopedData.sales} products={scopedData.products} />
        </div>
      </div>

      <RecentSales sales={scopedData.sales} />
    </div>
  );
}
