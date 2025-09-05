import React from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';

export function SupportPage() {
  return (
    <div>
      <PageHeader title="Support" subtitle="Get help with any issues you are facing." />
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Submit a Support Ticket</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input type="text" id="subject" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" rows={5} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
            </div>
            <Button type="submit">Submit Ticket</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
