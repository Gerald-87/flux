import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, Vendor } from '../types';
import { mockData as initialMockData } from '../lib/mockData';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    users: User[];
    loading: boolean;
    login: (credentials: Pick<User, 'email' | 'password'>) => void;
    logout: () => void;
    register: (vendorData: Pick<User, 'name' | 'email' | 'password'>, planId: string) => void;
    addCashier: (cashierData: Omit<User, 'id' | 'role' | 'vendorId' | 'createdAt'>) => void;
    updateUser: (userId: string, updates: Partial<User>) => void;
    deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useLocalStorage<User[]>('fluxpos-users', initialMockData.users);
    const [vendors, setVendors] = useLocalStorage<Vendor[]>('fluxpos-vendors', initialMockData.vendors);
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('fluxpos-current-user', null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const login = (credentials: Pick<User, 'email' | 'password'>) => {
        setLoading(true);
        setTimeout(() => {
            const foundUser = users.find(u => u.email === credentials.email && u.password === credentials.password);
            
            if (foundUser) {
                let userToSet = { ...foundUser };
                
                if (foundUser.vendorId) {
                    const vendorDetails = vendors.find(v => v.id === foundUser.vendorId);
                    if (vendorDetails) {
                        userToSet = { 
                            ...userToSet, 
                            isApproved: vendorDetails.isApproved,
                            subscriptionPlan: vendorDetails.subscriptionPlan,
                            subscriptionStatus: vendorDetails.subscriptionStatus,
                            subscriptionExpiry: vendorDetails.subscriptionExpiry,
                        };

                        if (!vendorDetails.isApproved) {
                            toast.error('Your account is pending approval by an administrator.');
                            setCurrentUser(null);
                            setLoading(false);
                            return;
                        }
                    }
                }

                if (!userToSet.isActive) {
                    toast.error('Your account is inactive. Please contact support.');
                    setCurrentUser(null);
                } else {
                    toast.success(`Welcome back, ${userToSet.name}!`);
                    setCurrentUser(userToSet);
                    if (userToSet.role === 'superadmin') {
                        navigate('/superadmin');
                    } else {
                        navigate('/');
                    }
                }
            } else {
                toast.error('Invalid email or password.');
                setCurrentUser(null);
            }
            setLoading(false);
        }, 500);
    };

    const register = (vendorData: Pick<User, 'name' | 'email' | 'password'>, planId: string) => {
        setLoading(true);
        setTimeout(() => {
            if (users.some(u => u.email === vendorData.email)) {
                toast.error('An account with this email already exists.');
                setLoading(false);
                return;
            }

            const newVendorId = `vendor-${Date.now()}`;
            const isTrial = planId === 'trial';
            const expiryDate = new Date();
            if (isTrial) {
                expiryDate.setDate(expiryDate.getDate() + 7); // 7-day trial
            } else {
                expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month for paid plans
            }

            const newVendorUser: User = {
                id: newVendorId,
                vendorId: newVendorId,
                role: 'vendor',
                ...vendorData,
                isActive: true,
                createdAt: new Date(),
            };
            
            const newVendorDetails: Vendor = {
                id: newVendorId,
                name: vendorData.name,
                email: vendorData.email,
                isApproved: false,
                phone: '',
                address: '',
                businessType: 'Unknown',
                subscriptionPlan: planId as Vendor['subscriptionPlan'],
                subscriptionStatus: isTrial ? 'trialing' : 'active',
                subscriptionExpiry: expiryDate,
                settings: initialMockData.vendors[0].settings,
                createdAt: new Date(),
            };

            setUsers(prev => [...prev, newVendorUser]);
            setVendors(prev => [...prev, newVendorDetails]);
            
            toast.success('Registration successful! Please log in while we review your account.');
            navigate('/login');
            setLoading(false);
        }, 500);
    };

    const addCashier = (cashierData: Omit<User, 'id' | 'role' | 'vendorId' | 'createdAt'>) => {
        if (!currentUser || currentUser.role !== 'vendor') {
            toast.error('You must be a vendor to add a cashier.');
            return;
        }

        const newCashier: User = {
            id: `cashier-${Date.now()}`,
            role: 'cashier',
            vendorId: currentUser.id,
            createdAt: new Date(),
            ...cashierData,
        };
        
        setUsers(prev => [...prev, newCashier]);
    };

    const updateUser = (userId: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    };

    const deleteUser = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setVendors(prev => prev.filter(v => v.id !== userId));
        toast.success('User and associated vendor data deleted.');
    };

    const logout = () => {
        setCurrentUser(null);
        navigate('/login');
    };

    const value = {
        user: currentUser,
        users,
        loading,
        login,
        logout,
        register,
        addCashier,
        updateUser,
        deleteUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
