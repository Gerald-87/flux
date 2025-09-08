import React from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { mockData } from '../../lib/mockData';
import { plans } from '../../lib/plans';
import { PricingPage } from './PricingPage';

export function SubscriptionPage() {
  const currentVendor = mockData.vendors[0];
  const currentPlan = plans.find(p => p.id === currentVendor.subscriptionPlan) || plans[0];

  return (
    <div>
      <PageHeader title="Subscription & Plans" subtitle="Manage your plan and billing details." />
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold">Current Plan: <span className="text-blue-600">{currentPlan.name}</span></h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Plan Details</h3>
              <ul className="space-y-2 text-sm">
                {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        {feature.included ? <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : <XCircle className="h-4 w-4 text-red-400 mr-2" />}
                        {feature.text}
                    </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Billing Information</h3>
              <p className="text-sm">Renews on: {currentVendor.subscriptionExpiry.toLocaleDateString()}</p>
              <p className="text-sm">Price: {formatCurrency(currentPlan.price)}/month</p>
              <p className="text-sm">Payment Method: Visa **** 1234</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">You can upgrade or downgrade your plan at any time.</p>
          <Button variant="ghost">Update Payment Method</Button>
        </CardFooter>
      </Card>

      <PricingPage currentPlanId={currentPlan.id} />
    </div>
  );
}
