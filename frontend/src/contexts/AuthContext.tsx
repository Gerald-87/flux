import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { getAuthToken, setAuthToken } from '../lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessType: string;
}

interface AuthContextType {
    user: User | null;
    users: User[];
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    register: (vendorData: RegisterData) => Promise<void>;
    addCashier: (cashierData: any) => Promise<void>;
    updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    setLoading(true);
                    const user = await authService.getCurrentUser();
                    setCurrentUser(user);
                } catch (error) {
                    console.error('Failed to get current user:', error);
                    // Clear invalid token
                    setAuthToken(null);
                    setCurrentUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            setLoading(true);
            const response = await authService.login(credentials);
            const user = response.user;

            // Time validation for cashiers
            if (user.role === 'CASHIER' && user.workSchedule) {
                const timeValidation = validateCashierAccess(user);
                if (!timeValidation.canAccess) {
                    toast.error(timeValidation.message || 'Access denied');
                    authService.logout();
                    return;
                }
            }

            setCurrentUser(user);
            toast.success(`Welcome back, ${user.name}!`);
            
            // Navigate based on role
            if (user.role === 'SUPERADMIN') {
                navigate('/superadmin');
            } else if (user.role === 'CASHIER') {
                navigate('/pos');
            } else {
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Time validation helper function
    const validateCashierAccess = (cashier: User): { canAccess: boolean; message?: string } => {
        if (cashier.role !== 'CASHIER' || !cashier.workSchedule) {
            return { canAccess: true };
        }

        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.toTimeString().slice(0, 5);

        // Check if today is a working day
        if (!cashier.workSchedule.workDays.includes(currentDay)) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const workDayNames = cashier.workSchedule.workDays.map(day => dayNames[day]).join(', ');
            return {
                canAccess: false,
                message: `You can only access the system on: ${workDayNames}`
            };
        }

        // Check if current time is before check-in time
        if (currentTime < cashier.workSchedule.checkInTime) {
            return {
                canAccess: false,
                message: `You can only check in at ${cashier.workSchedule.checkInTime} or later`
            };
        }

        // Check if current time is after check-out time
        if (currentTime > cashier.workSchedule.checkOutTime) {
            return {
                canAccess: false,
                message: `Your shift ended at ${cashier.workSchedule.checkOutTime}. Please contact your supervisor.`
            };
        }

        return { canAccess: true };
    };

    const register = async (vendorData: RegisterData) => {
        try {
            setLoading(true);
            const response = await authService.register(vendorData);
            setCurrentUser(response.user);
            toast.success('Registration successful! Welcome to Flux POS.');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const addCashier = async (cashierData: any) => {
        try {
            if (!currentUser || currentUser.role !== 'VENDOR') {
                toast.error('You must be a vendor to add a cashier.');
                return;
            }

            const newCashier = await userService.createUser({
                ...cashierData,
                role: 'CASHIER' as const
            });
            
            setUsers(prev => [...prev, newCashier]);
            toast.success('Cashier added successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add cashier');
        }
    };

    const updateUser = async (userId: string, updates: Partial<User>) => {
        try {
            const updatedUser = await userService.updateUser(userId, updates);
            setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
            
            if (currentUser && currentUser.id === userId) {
                setCurrentUser(updatedUser);
            }
            
            toast.success('User updated successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user');
        }
    };

    const deleteUser = async (userId: string) => {
        try {
            await userService.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            toast.success('User deleted successfully.');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        }
    };

    const logout = () => {
        authService.logout();
        setCurrentUser(null);
        setUsers([]);
        navigate('/login');
    };

    const refreshUser = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
        } catch (error) {
            console.error('Failed to refresh user:', error);
            logout();
        }
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
        refreshUser,
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
