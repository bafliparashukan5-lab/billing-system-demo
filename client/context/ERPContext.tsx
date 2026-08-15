import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, Branch, Company, Product, Customer, Supplier, 
  SalesInvoice, PurchaseBill, Godown, LedgerVoucher, AuditLog, 
  DashboardMetrics, AuthSession, TenantFeatureToggles 
} from '../../shared/types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

const defaultFeatures: TenantFeatureToggles = {
  posBilling: true,
  salesWorkflow: true,
  purchaseOtp: true,
  productRates: true,
  inventoryGodown: true,
  accountsLedger: true,
  gstStatutory: true,
  outstandingAgeing: true,
  analyticsAi: true
};

interface ERPContextType {
  session: AuthSession | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  tenantFeatures: TenantFeatureToggles;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentBranch: Branch;
  setCurrentBranch: (branch: Branch) => void;
  company: Company | null;
  branches: Branch[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  salesInvoices: SalesInvoice[];
  purchaseBills: PurchaseBill[];
  godowns: Godown[];
  ledgerVouchers: LedgerVoucher[];
  auditLogs: AuditLog[];
  metrics: DashboardMetrics | null;
  activeOtpBill: PurchaseBill | null;
  setActiveOtpBill: (bill: PurchaseBill | null) => void;
  activePdfInvoice: SalesInvoice | null;
  setActivePdfInvoice: (inv: SalesInvoice | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  refreshData: () => Promise<void>;
  createSalesInvoice: (invoice: Partial<SalesInvoice>) => Promise<SalesInvoice | null>;
  createPurchaseBill: (bill: Partial<PurchaseBill>) => Promise<PurchaseBill | null>;
  verifyOwnerOtp: (billId: string, otp: string) => Promise<boolean>;
  convertDocument: (id: string, targetDocType: string) => Promise<void>;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem('apex_erp_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('OWNER');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch>({ id: 'b1', code: 'BR-MUM', name: 'Main Branch - Mumbai', address: '', phone: '', gstin: '', isMain: true });
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [ledgerVouchers, setLedgerVouchers] = useState<LedgerVoucher[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const [activeOtpBill, setActiveOtpBill] = useState<PurchaseBill | null>(null);
  const [activePdfInvoice, setActivePdfInvoice] = useState<SalesInvoice | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const activeTenantId = session?.tenantId || session?.tenant?.id || 't_main';
  const tenantFeatures: TenantFeatureToggles = session?.tenant?.features || defaultFeatures;

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        localStorage.setItem('apex_erp_session', JSON.stringify(data.session));
        addToast('success', `Welcome back, ${data.session.name}!`);
        await refreshData();
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Authentication failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server login request failed' };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('apex_erp_session');
    addToast('info', 'Logged out successfully');
  };

  const refreshData = async () => {
    try {
      const headers = {
        'x-tenant-id': activeTenantId
      };

      const [compRes, branchRes, prodRes, custRes, suppRes, salesRes, purRes, godownRes, logRes, dashRes] = await Promise.all([
        fetch('/api/company', { headers }).then(r => r.json()),
        fetch('/api/branches', { headers }).then(r => r.json()),
        fetch(`/api/products?role=${currentRole}`, { headers }).then(r => r.json()),
        fetch('/api/customers', { headers }).then(r => r.json()),
        fetch('/api/suppliers', { headers }).then(r => r.json()),
        fetch('/api/sales', { headers }).then(r => r.json()),
        fetch('/api/purchases', { headers }).then(r => r.json()),
        fetch('/api/godowns', { headers }).then(r => r.json()),
        fetch('/api/audit-logs', { headers }).then(r => r.json()),
        fetch('/api/dashboard', { headers }).then(r => r.json())
      ]);

      setCompany(compRes);
      setBranches(branchRes);
      if (branchRes.length > 0 && !currentBranch.id) setCurrentBranch(branchRes[0]);
      setProducts(prodRes);
      setCustomers(custRes);
      setSuppliers(suppRes);
      setSalesInvoices(salesRes);
      setPurchaseBills(purRes);
      setGodowns(godownRes);
      setAuditLogs(logRes);
      setMetrics(dashRes.metrics);
    } catch (err) {
      console.error('Failed to load ERP API data', err);
    }
  };

  useEffect(() => {
    if (session) {
      refreshData();
    }
  }, [currentRole, session]);

  const createSalesInvoice = async (invoiceData: Partial<SalesInvoice>): Promise<SalesInvoice | null> => {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId,
          'x-user-name': session?.name || (currentRole === 'OWNER' ? 'Rajesh Sharma (Owner)' : 'Suresh Patil (Sales)')
        },
        body: JSON.stringify(invoiceData)
      });
      const newInv = await res.json();
      addToast('success', `${newInv.docType} ${newInv.invoiceNumber} created successfully! Stock & Ledgers updated.`);
      await refreshData();
      return newInv;
    } catch (err) {
      addToast('error', 'Failed to create invoice');
      return null;
    }
  };

  const createPurchaseBill = async (billData: Partial<PurchaseBill>): Promise<PurchaseBill | null> => {
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId,
          'x-user-name': 'Purchase Agent'
        },
        body: JSON.stringify(billData)
      });
      const newBill = await res.json();
      
      if (newBill.requiresOwnerOtp && newBill.status === 'PENDING_OWNER_OTP') {
        addToast('warning', `Purchase ${newBill.billNumber} exceeds ₹1,00,000 threshold! Owner OTP approval required.`);
        setActiveOtpBill(newBill);
      } else {
        addToast('success', `Purchase Bill ${newBill.billNumber} posted! Stock added.`);
      }

      await refreshData();
      return newBill;
    } catch (err) {
      addToast('error', 'Failed to create purchase bill');
      return null;
    }
  };

  const verifyOwnerOtp = async (billId: string, otp: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/purchases/verify-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId,
          'x-user-name': 'Owner'
        },
        body: JSON.stringify({ billId, otp })
      });
      const result = await res.json();
      if (result.success) {
        addToast('success', result.message);
        setActiveOtpBill(null);
        await refreshData();
        return true;
      } else {
        addToast('error', result.message);
        return false;
      }
    } catch (err) {
      addToast('error', 'OTP verification request failed');
      return false;
    }
  };

  const convertDocument = async (id: string, targetDocType: string) => {
    try {
      const res = await fetch(`/api/sales/convert/${id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify({ targetDocType })
      });
      const data = await res.json();
      addToast('success', `Document converted to ${targetDocType} ${data.converted.invoiceNumber}`);
      await refreshData();
    } catch (err) {
      addToast('error', 'Failed to convert document');
    }
  };

  return (
    <ERPContext.Provider value={{
      session, login, logout, tenantFeatures,
      currentRole, setCurrentRole,
      currentBranch, setCurrentBranch,
      company, branches, products, customers, suppliers,
      salesInvoices, purchaseBills, godowns, ledgerVouchers, auditLogs,
      metrics, activeOtpBill, setActiveOtpBill, activePdfInvoice, setActivePdfInvoice,
      isSearchOpen, setIsSearchOpen, toasts, addToast, refreshData,
      createSalesInvoice, createPurchaseBill, verifyOwnerOtp, convertDocument
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) throw new Error('useERP must be used within an ERPProvider');
  return context;
};
