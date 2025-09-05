import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Store, Shield } from 'lucide-react';

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: 'vendor' | 'superadmin') => {
    login(role);
    if (role === 'vendor') {
      navigate('/');
    } else {
      navigate('/superadmin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Store className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Welcome to FluxPOS</h1>
          <p className="mt-2 text-sm text-gray-600">Please select your role to log in.</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            size="lg" 
            className="w-full" 
            onClick={() => handleLogin('vendor')}
            disabled={loading}
          >
            <Store className="h-5 w-5 mr-2" />
            {loading ? 'Logging in...' : 'Login as Vendor'}
          </Button>
          <Button 
            size="lg" 
            variant="secondary" 
            className="w-full" 
            onClick={() => handleLogin('superadmin')}
            disabled={loading}
          >
            <Shield className="h-5 w-5 mr-2" />
            {loading ? 'Logging in...' : 'Login as Super Admin'}
          </Button>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
                This is a demonstration. No email or password required.
            </p>
        </div>
      </div>
    </div>
  );
}
