import React, { useState } from 'react';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { SupportTicket } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

export function SuperAdminSupportPage() {
    const [tickets] = useState<SupportTicket[]>(mockData.supportTickets);

    const statusClasses = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        closed: 'bg-green-100 text-green-800',
    };

    const priorityClasses = {
        low: 'text-gray-500',
        medium: 'text-orange-500',
        high: 'text-red-500',
    };

    return (
        <div>
            <PageHeader title="Support Tickets" subtitle="Manage and respond to vendor support requests." />
            <Card>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Subject</th>
                                    <th className="px-6 py-3">Vendor</th>
                                    <th className="px-6 py-3">Priority</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{ticket.subject}</td>
                                        <td className="px-6 py-4">{ticket.vendorName}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn('font-medium capitalize', priorityClasses[ticket.priority])}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn('px-2 py-1 text-xs font-semibold rounded-full capitalize', statusClasses[ticket.status])}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{formatDate(ticket.updatedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
