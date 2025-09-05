import React from 'react';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Check, Edit } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import { plans } from '../../../lib/plans';

export function SuperAdminPricingPage() {
  return (
    <div>
      <PageHeader
        title="Manage Subscription Plans"
        subtitle="Edit pricing and features for each vendor tier."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className='flex flex-col'
          >
            <CardHeader className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-4xl font-bold">{formatCurrency(plan.price).split('.')[0]}</span>
                <span className="text-gray-500">{plan.duration}</span>
              </p>
              <p className="text-sm text-gray-600 mt-4 h-12">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                        {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="p-6 mt-auto">
              <Button variant="secondary" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
