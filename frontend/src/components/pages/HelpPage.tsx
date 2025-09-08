import React from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: "How do I add a new product?", a: "Navigate to the Products page and click the 'Add Product' button. Fill in the required details and save." },
  { q: "How do I process a refund?", a: "From the Sales page, find the transaction and use the action menu to process a full or partial refund." },
  { q: "Can I use FluxPOS offline?", a: "Yes, FluxPOS has offline support. Sales made offline will automatically sync when you reconnect to the internet." },
];

export function HelpPage() {
  return (
    <div>
      <PageHeader title="How to Use" subtitle="Find answers to common questions." />
      <Card>
        <CardContent>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group border-b pb-4">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
