import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { vendorService, SystemAnalytics } from '../../../services/vendorService';

export function VendorGrowthChart() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await vendorService.getSystemAnalytics('30d');
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch growth data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">New Vendor Signups</h3>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || !analytics.growth.length) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">New Vendor Signups</h3>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">No growth data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = analytics.growth.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    vendors: item.count
  }));

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">New Vendor Signups</h3>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="vendors" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
