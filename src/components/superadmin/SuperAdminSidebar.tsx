import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2,
  BarChartBig,
  LifeBuoy,
  Shield,
  ChevronLeft,
  ChevronRight,
  Tags,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/superadmin' },
  { icon: Building2, label: 'Vendors', path: '/superadmin/vendors' },
  { icon: BarChartBig, label: 'Analytics', path: '/superadmin/analytics' },
  { icon: Tags, label: 'Pricing', path: '/superadmin/pricing' },
  { icon: LifeBuoy, label: 'Support', path: '/superadmin/support' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SuperAdminSidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={cn(
      "bg-slate-800 text-white transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className={cn("flex items-center space-x-2", collapsed && "justify-center")}>
          <Shield className="h-8 w-8 text-blue-400" />
          {!collapsed && (
            <span className="text-xl font-bold">FluxPOS Admin</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/superadmin' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"
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
