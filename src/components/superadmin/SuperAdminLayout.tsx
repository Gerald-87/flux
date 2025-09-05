import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminHeader } from './SuperAdminHeader';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function SuperAdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('superadmin-sidebar-collapsed', false);

  return (
    <div className="h-screen flex bg-gray-50">
      <SuperAdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
