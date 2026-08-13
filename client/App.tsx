import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OwnerOTPModal } from './components/OwnerOTPModal';
import { InvoicePDFModal } from './components/InvoicePDFModal';
import { ToastContainer } from './components/ToastContainer';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { LoginPage } from './pages/LoginPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { DashboardPage } from './pages/DashboardPage';
import { POSPage } from './pages/POSPage';
import { SalesPage } from './pages/SalesPage';
import { PurchasePage } from './pages/PurchasePage';
import { ProductsPage } from './pages/ProductsPage';
import { MastersPage } from './pages/MastersPage';
import { InventoryPage } from './pages/InventoryPage';
import { AccountsPage } from './pages/AccountsPage';
import { GSTPage } from './pages/GSTPage';
import { OutstandingPage } from './pages/OutstandingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { CompanyPage } from './pages/CompanyPage';

const MainLayout: React.FC = () => {
  const { session } = useERP();
  const [activeTab, setActiveTab] = useState<string>(() => session?.userType === 'SUPER_ADMIN' ? 'superadmin' : 'dashboard');

  if (!session) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onOpenQuickInvoice={() => setActiveTab('sales')}
          onOpenQuickPos={() => setActiveTab('pos')}
          onOpenQuickPurchase={() => setActiveTab('purchases')}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950/60">
          {activeTab === 'superadmin' && <SuperAdminPage />}
          {activeTab === 'dashboard' && (
            <DashboardPage 
              onOpenPos={() => setActiveTab('pos')}
              onOpenInvoice={() => setActiveTab('sales')}
              onOpenPurchase={() => setActiveTab('purchases')}
            />
          )}
          {activeTab === 'pos' && <POSPage />}
          {activeTab === 'sales' && <SalesPage />}
          {activeTab === 'purchases' && <PurchasePage />}
          {activeTab === 'products' && <ProductsPage />}
          {activeTab === 'masters' && <MastersPage />}
          {activeTab === 'inventory' && <InventoryPage />}
          {activeTab === 'accounts' && <AccountsPage />}
          {activeTab === 'gst' && <GSTPage />}
          {activeTab === 'outstanding' && <OutstandingPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'company' && <CompanyPage />}
          {activeTab === 'audit-trail' && <AuditTrailPage />}
        </main>
      </div>

      <OwnerOTPModal />
      <InvoicePDFModal />
      <GlobalSearchModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ERPProvider>
      <MainLayout />
    </ERPProvider>
  );
}

export default App;
