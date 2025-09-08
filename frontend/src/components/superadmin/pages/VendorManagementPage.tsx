import { useState, useEffect } from 'react';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Pagination } from '../../ui/Pagination';
import { Search, Check, Ban, Plus, Edit, Users, Building } from 'lucide-react';
import { vendorService, Vendor } from '../../../services/vendorService';
import { cn } from '../../../lib/utils';
import { VendorModal } from '../modals/VendorModal';
import toast from 'react-hot-toast';

type TabType = 'vendors' | 'cashiers';

interface Cashier {
  id: string;
  name: string;
  email: string;
  vendorName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export function VendorManagementPage() {
    const [activeTab, setActiveTab] = useState<TabType>('vendors');
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [cashiers, setCashiers] = useState<Cashier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    useEffect(() => {
        if (activeTab === 'vendors') {
            fetchVendors();
        } else {
            fetchCashiers();
        }
    }, [currentPage, searchTerm, activeTab]);

    useEffect(() => {
        setCurrentPage(1);
        setSearchTerm('');
    }, [activeTab]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await vendorService.getVendors({
                page: currentPage,
                limit: 10,
                search: searchTerm || undefined
            });
            setVendors(response.data);
            setTotal(response.pagination.total);
            setTotalPages(response.pagination.pages);
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    const fetchCashiers = async () => {
        try {
            setLoading(true);
            const response = await vendorService.getCashiers({
                page: currentPage,
                limit: 10,
                search: searchTerm || undefined
            });
            setCashiers(response.data);
            setTotal(response.pagination.total);
            setTotalPages(response.pagination.pages);
        } catch (error) {
            console.error('Failed to fetch cashiers:', error);
            toast.error('Failed to load cashiers');
            // Fallback to mock data for now
            setCashiers([]);
            setTotal(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (vendorId: string, isApproved: boolean) => {
        try {
            await vendorService.updateVendorStatus(vendorId, { 
                subscriptionStatus: isApproved ? 'ACTIVE' : 'SUSPENDED' 
            });
            await fetchVendors();
            toast.success(`Vendor ${isApproved ? 'approved' : 'approval revoked'}.`);
        } catch (error) {
            toast.error('Failed to update vendor status');
        }
    };

    const handleStatusChange = async (vendorId: string, status: string) => {
        try {
            await vendorService.updateVendorStatus(vendorId, { subscriptionStatus: status });
            await fetchVendors();
            toast.success('Vendor status updated successfully');
        } catch (error) {
            toast.error('Failed to update vendor status');
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const statusClasses = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        suspended: 'bg-red-100 text-red-800',
        trialing: 'bg-blue-100 text-blue-800',
    };

    const renderVendorsTable = () => (
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
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
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
                                <td className="px-6 py-4 font-medium">
                                    <div>{vendor.name}</div>
                                    <div className="text-xs text-gray-500">{vendor.email}</div>
                                </td>
                                <td className="px-6 py-4 capitalize">{vendor.subscriptionPlan.toLowerCase()}</td>
                                <td className="px-6 py-4">
                                    <span className={cn('px-2 py-1 text-xs font-semibold rounded-full capitalize', 
                                        statusClasses[vendor.subscriptionStatus.toLowerCase() as keyof typeof statusClasses] || statusClasses.inactive)}>
                                        {vendor.subscriptionStatus.toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {vendor.isApproved ? (
                                        <span className="flex items-center text-green-600 font-medium">
                                            <Check className="h-4 w-4 mr-1" /> Approved
                                        </span>
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
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => {
                                                setSelectedVendor(vendor);
                                                setShowVendorModal(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleStatusChange(vendor.id, vendor.subscriptionStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                                        >
                                            <Ban className="h-4 w-4" />
                                        </Button>
                                    </div>
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
    );

    const renderCashiersTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                        <th className="px-6 py-3">Cashier</th>
                        <th className="px-6 py-3">Vendor</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Last Login</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b animate-pulse">
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                            </tr>
                        ))
                    ) : cashiers.length > 0 ? (
                        cashiers.map((cashier: Cashier) => (
                            <tr key={cashier.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">
                                    <div>{cashier.name}</div>
                                    <div className="text-xs text-gray-500">{cashier.email}</div>
                                </td>
                                <td className="px-6 py-4">{cashier.vendorName}</td>
                                <td className="px-6 py-4 capitalize">{cashier.role.toLowerCase()}</td>
                                <td className="px-6 py-4">
                                    <span className={cn('px-2 py-1 text-xs font-semibold rounded-full', 
                                        cashier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                        {cashier.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {cashier.lastLogin ? new Date(cashier.lastLogin).toLocaleDateString() : 'Never'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                No cashiers found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div>
            <PageHeader 
                title={activeTab === 'vendors' ? 'Vendor Management' : 'Cashier Management'} 
                subtitle={`Manage all ${total} ${activeTab}.`}
            >
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                    {activeTab === 'vendors' && (
                        <Button onClick={() => {
                            setSelectedVendor(null);
                            setShowVendorModal(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Vendor
                        </Button>
                    )}
                </div>
            </PageHeader>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('vendors')}
                            className={cn(
                                'flex items-center py-2 px-1 border-b-2 font-medium text-sm',
                                activeTab === 'vendors'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                        >
                            <Building className="h-4 w-4 mr-2" />
                            Vendors
                        </button>
                        <button
                            onClick={() => setActiveTab('cashiers')}
                            className={cn(
                                'flex items-center py-2 px-1 border-b-2 font-medium text-sm',
                                activeTab === 'cashiers'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Cashiers
                        </button>
                    </nav>
                </div>
            </div>

            <Card>
                <CardContent>
                    {activeTab === 'vendors' ? renderVendorsTable() : renderCashiersTable()}
                    
                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </CardContent>
            </Card>
            
            <VendorModal
                isOpen={showVendorModal}
                onClose={() => {
                    setShowVendorModal(false);
                    setSelectedVendor(null);
                }}
                onSuccess={fetchVendors}
                vendor={selectedVendor}
            />
        </div>
    );
}
