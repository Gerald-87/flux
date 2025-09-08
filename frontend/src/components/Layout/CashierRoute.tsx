import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface CashierRouteProps {
  children: React.ReactNode;
}

export function CashierRoute({ children }: CashierRouteProps) {
  const { user } = useAuth();

  // Redirect cashiers away from restricted pages
  if (user?.role === 'cashier') {
    return <Navigate to="/pos" replace />;
  }

  return <>{children}</>;
}
