import { useState, useEffect } from 'react';
import { User } from '../types';
import { useLocalStorage } from './useLocalStorage';

const vendorUser: User = {
  id: 'mock-user-vendor-1',
  email: 'vendor@example.com',
  role: 'vendor',
  vendorId: 'vendor1',
  name: 'Flux Demo User',
  isActive: true,
  createdAt: new Date(),
};

const superAdminUser: User = {
    id: 'mock-user-superadmin-1',
    email: 'superadmin@example.com',
    role: 'superadmin',
    name: 'Super Admin',
    isActive: true,
    createdAt: new Date(),
};

export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>('fluxpos-user', null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This simulates checking an auth session on component mount
    setLoading(false);
  }, []);

  const login = (role: 'vendor' | 'superadmin') => {
    setLoading(true);
    setTimeout(() => { // Simulate API call
      if (role === 'vendor') {
        setUser(vendorUser);
      } else {
        setUser(superAdminUser);
      }
      setLoading(false);
    }, 500);
  };

  const logout = () => {
    setUser(null);
  };

  return { user, loading, login, logout };
}
