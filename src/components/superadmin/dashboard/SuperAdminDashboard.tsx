import React from 'react';
import { PageHeader } from '../../ui/PageHeader';
import { AdminDashboardStats } from './AdminDashboardStats';
import { VendorGrowthChart } from './VendorGrowthChart';
import { RecentVendors } from './RecentVendors';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';

export function SuperAdminDashboard() {
  const openTickets = mockData.supportTickets.filter(t => t.status === 'open');

  return (
    <div className="space-y-6">
      <PageHeader title="Super Admin Dashboard" subtitle="System-wide overview and metrics." />
      <AdminDashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VendorGrowthChart />
        </div>
        <div>
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Open Support Tickets</h3>
            </CardHeader>
            <CardContent>
              {openTickets.slice(0, 5).map(ticket => (
                <div key={ticket.id} className="py-2 border-b last:border-none">
                  <p className="font-medium text-sm">{ticket.subject}</p>
                  <p className="text-xs text-gray-500">From: {ticket.vendorName}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <RecentVendors />
    </div>
  );
}
