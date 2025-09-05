import React, { useState } from 'react';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Search, Check, X, MoreVertical } from 'lucide-react';
import { mockData } from '../../../lib/mockData';
import { Vendor } from '../../../types';
import { cn } from '../../../lib/utils';

export function VendorManagementPage() {
    const [vendors, setVendors] = useState<Vendor[]>(mockData.vendors);
    const [searchTerm, setSearchTerm] = useState('');

    const handleApproval = (vendorId: string, isApproved: boolean) => {
        setVendors(vendors.map(v => v.id === vendorId ? { ...v, isApproved } : v));
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusClasses = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        suspended: 'bg-red-100 text-red-800',
        trialing: 'bg-blue-100 text-blue-800',
    };

    return (
        <div>
            <PageHeader title="Vendor Management" subtitle={`Manage all ${vendors.length} vendors.`}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg"
                    />
                </div>
            </PageHeader>

            <Card>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Vendor</th>
                                    <th className="px-6 py-3">Plan</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Approval</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.map(vendor => (
                                    <tr key={vendor.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">
                                            <div>{vendor.name}</div>
                                            <div className="text-xs text-gray-500">{vendor.email}</div>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{vendor.subscriptionPlan}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn('px-2 py-1 text-xs font-semibold rounded-full capitalize', statusClasses[vendor.subscriptionStatus])}>
                                                {vendor.subscriptionStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {vendor.isApproved ? (
                                                <span className="flex items-center text-green-600"><Check className="h-4 w-4 mr-1" /> Approved</span>
                                            ) : (
                                                <div className="flex items-center space-x-1">
                                                    <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-100" onClick={() => handleApproval(vendor.id, true)}><Check className="h-4 w-4" /></Button>
                                                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-100" onClick={() => handleApproval(vendor.id, false)}><X className="h-4 w-4" /></Button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                                        </td>
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
