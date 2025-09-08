import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function TimeValidationWrapper({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'cashier' || !user.workSchedule) {
      return;
    }

    const checkAutoLogout = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      // Auto-logout if checkout time is reached
      if (currentTime >= user.workSchedule!.checkOutTime) {
        toast.error(`Your shift has ended. You have been automatically logged out.`);
        logout();
      }
    };

    // Check immediately
    checkAutoLogout();

    // Check every minute
    const interval = setInterval(checkAutoLogout, 60000);
    return () => clearInterval(interval);
  }, [user, logout]);

  return <>{children}</>;
}
