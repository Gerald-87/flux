import { useState, useEffect } from 'react';
import { DashboardStats } from './DashboardStats';
import { SalesChart } from './SalesChart';
import { RecentSales } from './RecentSales';
import { LowStockAlerts } from './LowStockAlerts';
import { TopProducts } from './TopProducts';
import { WeeklySalesChart } from './WeeklySalesChart';
import { PaymentModeChart } from './PaymentModeChart';
import { TopCashiersChart } from './TopCashiersChart';
import { useAuth } from '../../contexts/AuthContext';
import { useSales } from '../../hooks/useSales';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';

export function Dashboard() {
  const { user } = useAuth();
  const { sales, loading: salesLoading } = useSales();
  const { products, loading: productsLoading } = useProducts();
  const { customers, loading: customersLoading } = useCustomers();
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      
      try {
        setAnalyticsLoading(true);
        // Fetch last 30 days analytics
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const { getSalesAnalytics } = useSales();
        const analyticsData = await getSalesAnalytics(startDate, endDate);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const loading = salesLoading || productsLoading || customersLoading || analyticsLoading;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-xs sm:text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <DashboardStats 
        sales={sales} 
        products={products} 
        customers={customers}
      /> 

      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        {user?.role === 'VENDOR' ? (
          <>
            {/* Sales Analytics Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Sales Analytics</h2>
              
              {/* Main Sales Chart and Weekly Sales - Same Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <SalesChart sales={sales} />
                <WeeklySalesChart sales={sales} />
              </div>
              
              {/* Payment Methods and Top Cashiers - Two per row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <PaymentModeChart sales={sales} />
                <TopCashiersChart sales={sales} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <LowStockAlerts products={products} />
              <TopProducts sales={sales} products={products} />
            </div>
          </>
        ) : (
          <>
            <SalesChart sales={sales} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <LowStockAlerts products={products} />
              <TopProducts sales={sales} products={products} />
            </div>
          </>
        )}
      </div>

      <RecentSales sales={sales} />
    </div>
  );
}
