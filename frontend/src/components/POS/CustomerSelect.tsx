import React, { useState } from 'react';
import { Search, User, Plus } from 'lucide-react';
import { Customer } from '../../types';

// Mock customer data
const mockCustomers: Customer[] = [
  {
    id: '1',
    vendorId: 'vendor1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    loyaltyPoints: 150,
    totalSpent: 1250.50,
    visitCount: 25,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '2',
    vendorId: 'vendor1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    loyaltyPoints: 320,
    totalSpent: 2100.75,
    visitCount: 42,
    isActive: true,
    createdAt: new Date()
  }
];

interface CustomerSelectProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
}

export function CustomerSelect({ selectedCustomer, onCustomerSelect }: CustomerSelectProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer</h3>
      
      {selectedCustomer ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                <p className="text-sm text-blue-600">
                  {selectedCustomer.loyaltyPoints} loyalty points
                </p>
              </div>
            </div>
            <button
              onClick={() => onCustomerSelect(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus className="h-4 w-4 transform rotate-45" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customer or walk-in"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              <div
                onClick={() => {
                  onCustomerSelect(null);
                  setShowDropdown(false);
                  setSearchTerm('');
                }}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Walk-in Customer</span>
                </div>
              </div>
              
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => {
                    onCustomerSelect(customer);
                    setShowDropdown(false);
                    setSearchTerm('');
                  }}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">{customer.loyaltyPoints} pts</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {searchTerm && filteredCustomers.length === 0 && (
                <div className="p-3 text-center text-gray-500">
                  <p>No customers found</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm mt-1">
                    Add new customer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
