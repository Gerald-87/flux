import { useState, useEffect } from 'react';
import { PageHeader } from '../../ui/PageHeader';
import { AdminDashboardStats } from './AdminDashboardStats';
import { VendorGrowthChart } from './VendorGrowthChart';
import { RecentVendors } from './RecentVendors';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { vendorService, SupportTicket } from '../../../services/vendorService';

export function SuperAdminDashboard() {
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupportTickets = async () => {
      try {
        const response = await vendorService.getSupportTickets({ limit: 5, status: 'OPEN' });
        setSupportTickets(response.data);
      } catch (error) {
        console.error('Failed to fetch support tickets:', error);
        setSupportTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportTickets();
  }, []);

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
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : supportTickets.length > 0 ? (
                supportTickets.map((ticket: SupportTicket) => (
                  <div key={ticket.id} className="py-2 border-b last:border-none">
                    <p className="font-medium text-sm">{ticket.subject}</p>
                    <p className="text-xs text-gray-500">From: {ticket.vendorName}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No open support tickets</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <RecentVendors />
    </div>
  );
}
