import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { POSTerminal } from './components/POS/POSTerminal';
import { SalesPage } from './components/pages/SalesPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { CustomersPage } from './components/pages/CustomersPage';
import { ProductsPage } from './components/pages/ProductsPage';
import { StockTakingPage } from './components/pages/StockTakingPage';
import { PurchasesPage } from './components/pages/PurchasesPage';
import { SuppliersPage } from './components/pages/SuppliersPage';
import { TransfersPage } from './components/pages/TransfersPage';
import { CashiersPage } from './components/pages/CashiersPage';
import { SubscriptionPage } from './components/pages/SubscriptionPage';
import { HelpPage } from './components/pages/HelpPage';
import { SupportPage } from './components/pages/SupportPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Report Pages
import { SalesReportsPage } from './components/pages/reports/SalesReportsPage';
import { InventoryReportsPage } from './components/pages/reports/InventoryReportsPage';
import { CustomerReportsPage } from './components/pages/reports/CustomerReportsPage';
import { ProfitAndLossPage } from './components/pages/reports/ProfitAndLossPage';
import { ProductReportsPage } from './components/pages/reports/ProductReportsPage';
import { StockTakeReportsPage } from './components/pages/reports/StockTakeReportsPage';
import { PurchaseReportsPage } from './components/pages/reports/PurchaseReportsPage';
import { SupplierReportsPage } from './components/pages/reports/SupplierReportsPage';
import { TransferReportsPage } from './components/pages/reports/TransferReportsPage';
import { CashierReportsPage } from './components/pages/reports/CashierReportsPage';


// Super Admin Pages
import { SuperAdminLayout } from './components/superadmin/SuperAdminLayout';
import { SuperAdminDashboard } from './components/superadmin/dashboard/SuperAdminDashboard';
import { VendorManagementPage } from './components/superadmin/pages/VendorManagementPage';
import { SystemAnalyticsPage } from './components/superadmin/pages/SystemAnalyticsPage';
import { SuperAdminSupportPage } from './components/superadmin/pages/SuperAdminSupportPage';
import { SuperAdminPricingPage } from './components/superadmin/pages/SuperAdminPricingPage';

// New Pages
import { StockTakeSessionPage } from './components/pages/stock-taking/StockTakeSessionPage';


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Vendor/Cashier Routes */}
            <Route path="/*" element={<ProtectedRoute allowedRoles={['vendor', 'cashier']}><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="pos" element={<POSTerminal />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/sales" element={<SalesReportsPage />} />
              <Route path="reports/inventory" element={<InventoryReportsPage />} />
              <Route path="reports/products" element={<ProductReportsPage />} />
              <Route path="reports/customers" element={<CustomerReportsPage />} />
              <Route path="reports/profit-loss" element={<ProfitAndLossPage />} />
              <Route path="reports/stock-takes" element={<StockTakeReportsPage />} />
              <Route path="reports/purchases" element={<PurchaseReportsPage />} />
              <Route path="reports/suppliers" element={<SupplierReportsPage />} />
              <Route path="reports/transfers" element={<TransferReportsPage />} />
              <Route path="reports/cashiers" element={<CashierReportsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="stock-taking" element={<StockTakingPage />} />
              <Route path="stock-taking/:id" element={<StockTakeSessionPage />} />
              <Route path="purchases" element={<PurchasesPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="transfers" element={<TransfersPage />} />
              <Route path="cashiers" element={<CashiersPage />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/superadmin/*" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminLayout /></ProtectedRoute>}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="vendors" element={<VendorManagementPage />} />
              <Route path="analytics" element={<SystemAnalyticsPage />} />
              <Route path="support" element={<SuperAdminSupportPage />} />
              <Route path="pricing" element={<SuperAdminPricingPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
