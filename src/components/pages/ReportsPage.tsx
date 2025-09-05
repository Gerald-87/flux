import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { BarChart3, Package, Users, DollarSign, ArrowRight } from 'lucide-react';

const reportTypes = [
  { title: 'Sales Reports', description: 'Analyze sales trends, peak hours, and payment methods.', icon: BarChart3, color: 'text-blue-500', path: '/reports/sales' },
  { title: 'Inventory Reports', description: 'Track stock levels, turnover rates, and low-stock items.', icon: Package, color: 'text-green-500', path: '/reports/inventory' },
  { title: 'Customer Reports', description: 'Understand customer behavior, loyalty, and purchase history.', icon: Users, color: 'text-purple-500', path: '/reports/customers' },
  { title: 'Profit & Loss', description: 'Monitor revenue, costs, and overall profitability.', icon: DollarSign, color: 'text-orange-500', path: '/reports/profit-loss' },
];

export function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Gain insights into your business performance." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Icon className={`h-8 w-8 ${report.color}`} />
                  <h2 className="text-lg font-semibold">{report.title}</h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 h-12">{report.description}</p>
                <Link to={report.path} className="font-medium text-blue-600 hover:text-blue-700 flex items-center">
                  View Reports <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
