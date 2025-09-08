import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatCurrency } from '../../lib/utils';
import { plans } from '../../lib/plans';

interface PricingPageProps {
    currentPlanId?: string;
}

export function PricingPage({ currentPlanId }: PricingPageProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Find the Right Plan for Your Business</h2>
        <p className="mt-2 text-gray-600">Flexible pricing for businesses of all sizes. Cancel or upgrade anytime.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'flex flex-col',
              plan.isPopular ? 'border-blue-500 border-2 shadow-lg' : '',
              currentPlanId === plan.id ? 'border-green-500 border-2' : ''
            )}
          >
            {plan.isPopular && (
              <div className="bg-blue-600 text-white text-center text-xs font-bold py-1 rounded-t-lg -mt-px">
                MOST POPULAR
              </div>
            )}
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
                    {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                        <X className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                    )}
                    <span className={cn("text-sm", feature.included ? "text-gray-700" : "text-gray-500 line-through")}>
                        {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="p-6 mt-auto">
              <Button 
                variant={currentPlanId === plan.id ? 'secondary' : plan.variant} 
                className="w-full"
                disabled={currentPlanId === plan.id}
              >
                {currentPlanId === plan.id ? 'Current Plan' : plan.buttonText}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
