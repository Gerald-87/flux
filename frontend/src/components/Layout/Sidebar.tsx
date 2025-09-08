import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  BarChart3, 
  Users, 
  Package, 
  Clipboard, 
  ShoppingBag, 
  Truck, 
  ArrowLeftRight, 
  UserCheck, 
  CreditCard, 
  HelpCircle, 
  Headphones, 
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

const vendorMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingCart, label: 'POS Terminal', path: '/pos' },
  { icon: Receipt, label: 'Sales', path: '/sales' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Clipboard, label: 'Stock Taking', path: '/stock-taking' },
  { icon: ShoppingBag, label: 'Purchases', path: '/purchases' },
  { icon: Truck, label: 'Suppliers', path: '/suppliers' },
  { icon: ArrowLeftRight, label: 'Transfers', path: '/transfers' },
  { icon: UserCheck, label: 'Cashiers', path: '/cashiers' },
  { icon: CreditCard, label: 'Subscription', path: '/subscription' },
  { icon: HelpCircle, label: 'Help / FAQ', path: '/help' },
  { icon: Headphones, label: 'Support', path: '/support' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

const cashierMenuItems = [
  { icon: ShoppingCart, label: 'POS Terminal', path: '/pos' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: HelpCircle, label: 'Help / FAQ', path: '/help' },
  { icon: Headphones, label: 'Support', path: '/support' },
];


interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = user?.role === 'cashier' ? cashierMenuItems : vendorMenuItems;

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      "fixed lg:relative z-30 h-full",
      collapsed ? "w-16" : "w-64 lg:w-64",
      "lg:translate-x-0",
      collapsed ? "translate-x-0" : "translate-x-0"
    )}>
      {/* Header */}
      <div className="p-2 sm:p-4 border-b border-gray-200 flex items-center justify-between h-[69px]">
        <div className={cn("flex items-center space-x-2", collapsed && "justify-center w-full")}>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900">FluxPOS</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className={cn("p-1 rounded-lg hover:bg-gray-100 transition-colors", collapsed && "absolute left-1/2 -translate-x-1/2 top-[76px] bg-white border rounded-full shadow-md")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
              )} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
