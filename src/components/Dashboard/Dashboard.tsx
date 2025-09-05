import React from 'react';
import { DashboardStats } from './DashboardStats';
import { SalesChart } from './SalesChart';
import { RecentSales } from './RecentSales';
import { LowStockAlerts } from './LowStockAlerts';
import { TopProducts } from './TopProducts';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>
        <div className="space-y-6">
          <LowStockAlerts />
          <TopProducts />
        </div>
      </div>

      <RecentSales />
    </div>
  );
}
