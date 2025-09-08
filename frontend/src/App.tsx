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
import { CashierRoute } from './components/Layout/CashierRoute';

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
import { SupportTicketsPage } from './components/superadmin/pages/SupportTicketsPage';
import { PricingPlansPage } from './components/superadmin/pages/PricingPlansPage';

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
            <Route path="/*" element={<ProtectedRoute allowedRoles={['VENDOR', 'CASHIER']}><Layout /></ProtectedRoute>}>
              <Route index element={<CashierRoute><Dashboard /></CashierRoute>} />
              <Route path="pos" element={<POSTerminal />} />
              <Route path="sales" element={<CashierRoute><SalesPage /></CashierRoute>} />
              <Route path="reports" element={<CashierRoute><ReportsPage /></CashierRoute>} />
              <Route path="reports/sales" element={<CashierRoute><SalesReportsPage /></CashierRoute>} />
              <Route path="reports/inventory" element={<CashierRoute><InventoryReportsPage /></CashierRoute>} />
              <Route path="reports/products" element={<CashierRoute><ProductReportsPage /></CashierRoute>} />
              <Route path="reports/customers" element={<CashierRoute><CustomerReportsPage /></CashierRoute>} />
              <Route path="reports/profit-loss" element={<CashierRoute><ProfitAndLossPage /></CashierRoute>} />
              <Route path="reports/stock-takes" element={<CashierRoute><StockTakeReportsPage /></CashierRoute>} />
              <Route path="reports/purchases" element={<CashierRoute><PurchaseReportsPage /></CashierRoute>} />
              <Route path="reports/suppliers" element={<CashierRoute><SupplierReportsPage /></CashierRoute>} />
              <Route path="reports/transfers" element={<CashierRoute><TransferReportsPage /></CashierRoute>} />
              <Route path="reports/cashiers" element={<CashierRoute><CashierReportsPage /></CashierRoute>} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="products" element={<CashierRoute><ProductsPage /></CashierRoute>} />
              <Route path="stock-taking" element={<CashierRoute><StockTakingPage /></CashierRoute>} />
              <Route path="stock-taking/:id" element={<CashierRoute><StockTakeSessionPage /></CashierRoute>} />
              <Route path="purchases" element={<CashierRoute><PurchasesPage /></CashierRoute>} />
              <Route path="suppliers" element={<CashierRoute><SuppliersPage /></CashierRoute>} />
              <Route path="transfers" element={<CashierRoute><TransfersPage /></CashierRoute>} />
              <Route path="cashiers" element={<CashierRoute><CashiersPage /></CashierRoute>} />
              <Route path="subscription" element={<CashierRoute><SubscriptionPage /></CashierRoute>} />
              <Route path="help" element={<HelpPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="settings" element={<CashierRoute><SettingsPage /></CashierRoute>} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/superadmin/*" element={<ProtectedRoute allowedRoles={['SUPERADMIN']}><SuperAdminLayout /></ProtectedRoute>}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="vendors" element={<VendorManagementPage />} />
              <Route path="analytics" element={<SystemAnalyticsPage />} />
              <Route path="support" element={<SupportTicketsPage />} />
              <Route path="pricing" element={<PricingPlansPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
