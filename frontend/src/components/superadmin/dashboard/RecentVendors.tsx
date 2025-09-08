import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { vendorService, Vendor } from '../../../services/vendorService';
import { formatDate } from '../../../lib/utils';

export function RecentVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentVendors = async () => {
            try {
                const response = await vendorService.getVendors({ limit: 5, page: 1 });
                setVendors(response.data);
            } catch (error) {
                console.error('Failed to fetch recent vendors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentVendors();
    }, []);

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
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="border-b animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                    </tr>
                                ))
                            ) : vendors.length > 0 ? (
                                vendors.map((vendor: Vendor) => (
                                    <tr key={vendor.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{vendor.name}</td>
                                        <td className="px-6 py-4">{vendor.email}</td>
                                        <td className="px-6 py-4 capitalize">{vendor.subscriptionPlan.toLowerCase()}</td>
                                        <td className="px-6 py-4">{formatDate(new Date(vendor.createdAt))}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vendor.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {vendor.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        No vendors found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
