import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings, Wifi, WifiOff, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Header() {
  const { user, users, login, logout } = useAuth();
  const { isOnline, pendingActions } = useOfflineSync();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleLoginAsVendor = () => {
    if (user?.role === 'cashier' && user.vendorId) {
        const vendorUser = users.find(u => u.id === user.vendorId && u.role === 'vendor');
        if (vendorUser && vendorUser.password) {
            toast.success(`Switching to ${vendorUser.name}'s account...`);
            login({ email: vendorUser.email, password: vendorUser.password });
        } else {
            toast.error('Could not find vendor account to switch to.');
        }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, customers, or orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Login as Vendor */}
          {user?.role === 'cashier' && (
            <button
                onClick={handleLoginAsVendor}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 font-medium"
            >
                <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Login as Vendor</span>
                <span className="sm:hidden">Vendor</span>
            </button>
          )}

          {/* Connection Status */}
          <div className={cn(
            "flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium",
            isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}>
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            {pendingActions.length > 0 && (
              <span className="bg-orange-500 text-white px-1 rounded-full text-xs">
                {pendingActions.length}
              </span>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {/* Notification items */}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Role'}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Settings className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
