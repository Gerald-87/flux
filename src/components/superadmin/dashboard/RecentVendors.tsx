import React from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatDate } from '../../../lib/utils';
import { Vendor } from '../../../types';

export function RecentVendors() {
    const recentVendors = [...mockData.vendors]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <h3 className="font-semibold">Recent Vendor Signups</h3>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Vendor Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Plan</th>
                                <th className="px-6 py-3">Joined On</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentVendors.map((vendor: Vendor) => (
                                <tr key={vendor.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{vendor.name}</td>
                                    <td className="px-6 py-4">{vendor.email}</td>
                                    <td className="px-6 py-4 capitalize">{vendor.subscriptionPlan}</td>
                                    <td className="px-6 py-4">{formatDate(vendor.createdAt)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vendor.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {vendor.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
