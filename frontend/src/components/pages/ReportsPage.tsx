import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { BarChart3, Package, Users, DollarSign, ArrowRight, ClipboardList, ShoppingBag, Truck, ArrowLeftRight, UserCheck } from 'lucide-react';

const reportTypes = [
  { title: 'Sales Reports', description: 'Analyze sales trends, peak hours, and payment methods.', icon: BarChart3, color: 'text-blue-500', path: '/reports/sales' },
  { title: 'Inventory Reports', description: 'Track stock levels, turnover rates, and low-stock items.', icon: Package, color: 'text-green-500', path: '/reports/inventory' },
  { title: 'Product Reports', description: 'Detailed analysis of product performance and profitability.', icon: Package, color: 'text-teal-500', path: '/reports/products' },
  { title: 'Customer Reports', description: 'Understand customer behavior, loyalty, and purchase history.', icon: Users, color: 'text-purple-500', path: '/reports/customers' },
  { title: 'Profit & Loss', description: 'Monitor revenue, costs, and overall profitability.', icon: DollarSign, color: 'text-orange-500', path: '/reports/profit-loss' },
  { title: 'Stock Take Reports', description: 'Review history and accuracy of inventory counts.', icon: ClipboardList, color: 'text-indigo-500', path: '/reports/stock-takes' },
  { title: 'Purchase Reports', description: 'Analyze spending, supplier performance, and purchase history.', icon: ShoppingBag, color: 'text-rose-500', path: '/reports/purchases' },
  { title: 'Supplier Reports', description: 'Evaluate supplier reliability and total spend.', icon: Truck, color: 'text-cyan-500', path: '/reports/suppliers' },
  { title: 'Transfer Reports', description: 'Track all stock movements between your locations.', icon: ArrowLeftRight, color: 'text-yellow-500', path: '/reports/transfers' },
  { title: 'Cashier Reports', description: 'Monitor performance and sales activity by cashier.', icon: UserCheck, color: 'text-pink-500', path: '/reports/cashiers' },
];

export function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Gain insights into every aspect of your business performance." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Link to={report.path} key={report.title} className="block hover:shadow-lg transition-shadow rounded-lg">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-8 w-8 ${report.color}`} />
                    <h2 className="text-lg font-semibold">{report.title}</h2>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <p className="text-sm text-gray-600 mb-4 h-12">{report.description}</p>
                  <div className="font-medium text-blue-600 hover:text-blue-700 flex items-center">
                    View Reports <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
