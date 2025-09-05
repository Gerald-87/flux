import React, { useState } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Settings, Bell, Shield, CreditCard, Save } from 'lucide-react';

const tabs = [
  { name: 'General', icon: Settings },
  { name: 'Notifications', icon: Bell },
  { name: 'Security', icon: Shield },
  { name: 'Billing', icon: CreditCard },
];

const GeneralSettings = () => (
    <div className="animate-fade-in">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">General Settings</h3>
        <form className="space-y-6">
            <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">Store Name</label>
                <input type="text" id="storeName" defaultValue="FluxPOS Demo" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                <select id="currency" defaultValue="USD" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                </select>
            </div>
            <div>
                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">Default Tax Rate (%)</label>
                <input type="number" id="taxRate" defaultValue="10" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
        </form>
    </div>
);

const NotificationsSettings = () => (
    <div className="animate-fade-in">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Notification Settings</h3>
        <form className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <span className="text-sm font-medium text-gray-800">Email on new sale</span>
                    <p className="text-xs text-gray-500">Receive an email for every completed transaction.</p>
                </div>
                <input type="checkbox" className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <span className="text-sm font-medium text-gray-800">Low stock alerts</span>
                    <p className="text-xs text-gray-500">Get notified when product stock falls below the threshold.</p>
                </div>
                <input type="checkbox" className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500" defaultChecked />
            </div>
            <div>
                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                <input type="number" id="lowStockThreshold" defaultValue="10" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
        </form>
    </div>
);

const SecuritySettings = () => (
    <div className="animate-fade-in">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Security Settings</h3>
        <form className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" placeholder="••••••••" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" placeholder="••••••••" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex items-center p-4 border rounded-lg">
                <input type="checkbox" id="2fa" className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 mr-3" />
                <div>
                    <label htmlFor="2fa" className="text-sm font-medium text-gray-800">Enable Two-Factor Authentication</label>
                    <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
                </div>
            </div>
        </form>
    </div>
);

const BillingSettings = () => (
    <div className="animate-fade-in">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Billing Settings</h3>
        <div className="p-4 border rounded-lg bg-gray-50">
            <p className="font-medium">You are currently on the <span className="text-blue-600 font-bold">Premium</span> plan.</p>
            <p className="text-sm text-gray-600 mt-2">Your plan renews on February 28, 2026.</p>
            <Button size="sm" className="mt-4">Change Plan</Button>
        </div>
        <div className="mt-6">
             <h4 className="font-semibold text-gray-800 mb-4">Payment Method</h4>
             <div className="flex items-center justify-between p-4 border rounded-lg">
                <p className="text-sm">Visa ending in 1234</p>
                <Button variant="secondary" size="sm">Update</Button>
             </div>
        </div>
    </div>
);

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return <GeneralSettings />;
      case 'Notifications':
        return <NotificationsSettings />;
      case 'Security':
        return <SecuritySettings />;
      case 'Billing':
        return <BillingSettings />;
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your system preferences." />
      <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
        <div className="lg:w-1/4">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.name ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>
        <div className="lg:w-3/4">
          <Card>
            <CardContent className="p-6 min-h-[400px]">
              {renderContent()}
            </CardContent>
            <CardFooter className="bg-gray-50 flex justify-end">
                <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
