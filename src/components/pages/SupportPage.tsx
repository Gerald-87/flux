import React from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function SupportPage() {
  const { user } = useAuth();

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Support ticket submitted successfully!');
    (e.target as HTMLFormElement).reset();
  };

  const handleCashierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent to your vendor!');
    (e.target as HTMLFormElement).reset();
  };

  if (user?.role === 'cashier') {
    return (
      <div>
        <PageHeader title="Contact Vendor" subtitle="Send a message to your store manager for assistance." />
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">New Message</h2>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCashierSubmit}>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <input type="text" id="subject" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea id="description" rows={5} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required></textarea>
              </div>
              <Button type="submit">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Support" subtitle="Get help with any issues you are facing." />
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Submit a Support Ticket</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleVendorSubmit}>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input type="text" id="subject" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" rows={5} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required></textarea>
            </div>
            <Button type="submit">Submit Ticket</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
