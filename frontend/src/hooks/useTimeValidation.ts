import { useEffect, useCallback } from 'react';
import { User, WorkSchedule } from '../types';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export function useTimeValidation() {
  const { user, logout } = useAuth();

  const isWithinWorkingHours = useCallback((workSchedule: WorkSchedule): boolean => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Check if today is a working day
    if (!workSchedule.workDays.includes(currentDay)) {
      return false;
    }

    // Check if current time is within working hours
    return currentTime >= workSchedule.checkInTime && currentTime <= workSchedule.checkOutTime;
  }, []);

  const validateCashierAccess = useCallback((cashier: User): { canAccess: boolean; message?: string } => {
    if (cashier.role !== 'cashier' || !cashier.workSchedule) {
      return { canAccess: true }; // No restrictions for non-cashiers or cashiers without schedule
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
  }, []);

  const checkAutoLogout = useCallback(() => {
    if (!user || user.role !== 'cashier' || !user.workSchedule) {
      return;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    // Auto-logout if checkout time is reached
    if (currentTime >= user.workSchedule.checkOutTime) {
      toast.error(`Your shift has ended. You have been automatically logged out.`);
      logout();
    }
  }, [user, logout]);

  // Check for auto-logout every minute
  useEffect(() => {
    if (!user || user.role !== 'cashier' || !user.workSchedule) {
      return;
    }

    const interval = setInterval(checkAutoLogout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, checkAutoLogout]);

  return {
    isWithinWorkingHours,
    validateCashierAccess,
    checkAutoLogout
  };
}
