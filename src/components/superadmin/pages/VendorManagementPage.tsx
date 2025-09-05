import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Search, Check, X, MoreVertical, Trash2, Ban } from 'lucide-react';
import { Vendor } from '../../../types';
import { cn } from '../../../lib/utils';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

export function VendorManagementPage() {
    const { users, updateUser, deleteUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const vendors = useMemo(() => {
        return users.filter(u => u.role === 'vendor') as Vendor[];
    }, [users]);

    const handleApproval = (vendorId: string, isApproved: boolean) => {
        updateUser(vendorId, { isApproved });
        toast.success(`Vendor ${isApproved ? 'approved' : 'approval revoked'}.`);
    };

    const handleDeactivate = (vendorId: string, isActive: boolean) => {
        updateUser(vendorId, { isActive });
        toast.success(`Vendor account has been ${isActive ? 'activated' : 'deactivated'}.`);
    };

    const handleDelete = (vendorId: string) => {
        if (window.confirm('Are you sure you want to permanently delete this vendor and all their data? This action cannot be undone.')) {
            deleteUser(vendorId);
        }
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
                                            <span className={cn('px-2 py-1 text-xs font-semibold rounded-full capitalize', statusClasses[vendor.subscriptionStatus || 'inactive' as keyof typeof statusClasses])}>
                                                {vendor.subscriptionStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {vendor.isApproved ? (
                                                <span className="flex items-center text-green-600 font-medium"><Check className="h-4 w-4 mr-1" /> Approved</span>
                                            ) : (
                                                <div className="flex items-center space-x-1">
                                                    <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApproval(vendor.id, true)}>
                                                        <Check className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleDeactivate(vendor.id, !vendor.isActive)}>
                                                    <Ban className="h-4 w-4" title={vendor.isActive ? 'Deactivate' : 'Activate'} />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(vendor.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
