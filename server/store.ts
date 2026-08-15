import fs from 'fs';
import path from 'path';
import { 
  Company, Branch, User, Product, Customer, Supplier, 
  SalesInvoice, PurchaseBill, Godown, StockTransfer, BatchItem, 
  LedgerAccount, LedgerVoucher, AuditLog, DashboardMetrics, Tenant, TenantFeatureToggles 
} from '../shared/types.js';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

const DEFAULT_COMPANY_TEMPLATE: Company = {
  name: 'Apex ERP Business',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60',
  tagline: 'Enterprise Billing & Management',
  address: 'Headquarters Address',
  cityState: 'Mumbai, Maharashtra',
  pincode: '400001',
  phone: '+91 98765 43210',
  email: 'contact@apexerp.com',
  website: 'www.apexerp.com',
  gstin: '27AAACA1234A1Z5',
  pan: 'AAACA1234A',
  cin: 'U72200MH2021PTC350000',
  bankName: 'HDFC Bank Ltd',
  accountNo: '50200048291045',
  ifscCode: 'HDFC0000240',
  branchName: 'Main Branch, Mumbai',
  upiId: 'apexerp@hdfcbank',
  currencySymbol: '₹',
  termsAndConditions: [
    '1. Goods once sold will not be taken back without valid return approval.',
    '2. Interest @ 18% p.a. will be charged on overdue payments exceeding credit terms.',
    '3. All disputes subject to Mumbai Jurisdiction only.'
  ]
};

class ERPDataStore {
  tenantCompanies: { [tenantId: string]: Company };
  branches: Branch[];
  users: User[];
  tenants: Tenant[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  salesInvoices: SalesInvoice[];
  purchaseBills: PurchaseBill[];
  godowns: Godown[];
  stockTransfers: StockTransfer[];
  batches: BatchItem[];
  ledgerAccounts: LedgerAccount[];
  ledgerVouchers: LedgerVoucher[];
  auditLogs: AuditLog[];
  ownerOtpCode: string;

  constructor() {
    this.ownerOtpCode = process.env.OWNER_OTP_DEFAULT || '889900';

    this.tenants = [
      {
        id: 't_main',
        code: 'TENANT-001',
        companyName: 'Main Enterprise Account',
        email: 'client@apexerp.com',
        password: 'client123',
        phone: '+91 98765 43210',
        gstin: '27AAACA1234A1Z5',
        active: true,
        createdAt: new Date().toISOString(),
        features: {
          posBilling: true,
          salesWorkflow: true,
          purchaseOtp: true,
          productRates: true,
          inventoryGodown: true,
          accountsLedger: true,
          gstStatutory: true,
          outstandingAgeing: true,
          analyticsAi: true
        }
      }
    ];

    this.tenantCompanies = {
      't_main': { ...DEFAULT_COMPANY_TEMPLATE, tenantId: 't_main', name: 'Apex ERP Technologies Pvt Ltd' }
    };

    this.branches = [
      { id: 'b1', tenantId: 't_main', code: 'BR-MAIN', name: 'Main Branch - Head Office', address: 'Headquarters', phone: '+91 98765 43210', gstin: '27AAACA1234A1Z5', isMain: true }
    ];

    this.users = [
      { id: 'u1', tenantId: 't_main', name: 'System Owner', email: 'owner@apexerp.com', role: 'OWNER' }
    ];

    this.godowns = [
      { id: 'g1', tenantId: 't_main', code: 'GDN-MAIN', name: 'Main Warehouse Godown', location: 'Central Logistics Hub', capacity: '10,000 Sq.Ft' }
    ];

    this.products = [];
    this.customers = [];
    this.suppliers = [];
    this.salesInvoices = [];
    this.purchaseBills = [];
    this.stockTransfers = [];
    this.batches = [];
    this.ledgerVouchers = [];
    this.auditLogs = [];

    this.ledgerAccounts = [
      { id: 'la1', tenantId: 't_main', code: '1001', name: 'Cash Account (Counter)', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la2', tenantId: 't_main', code: '1002', name: 'Operating Bank Account', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la3', tenantId: 't_main', code: '1100', name: 'Trade Receivables (Sundry Debtors)', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la4', tenantId: 't_main', code: '1200', name: 'Closing Merchandise Inventory', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la5', tenantId: 't_main', code: '2001', name: 'Trade Payables (Sundry Creditors)', group: 'LIABILITY', balance: 0, debitCredit: 'Cr' },
      { id: 'la6', tenantId: 't_main', code: '2101', name: 'CGST Output Payable', group: 'LIABILITY', balance: 0, debitCredit: 'Cr' },
      { id: 'la7', tenantId: 't_main', code: '2102', name: 'SGST Output Payable', group: 'LIABILITY', balance: 0, debitCredit: 'Cr' },
      { id: 'la8', tenantId: 't_main', code: '2103', name: 'IGST Output Payable', group: 'LIABILITY', balance: 0, debitCredit: 'Cr' },
      { id: 'la9', tenantId: 't_main', code: '2104', name: 'CGST Input Tax Credit (ITC)', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la10', tenantId: 't_main', code: '2105', name: 'SGST Input Tax Credit (ITC)', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la11', tenantId: 't_main', code: '3001', name: 'Sales Account (Domestic)', group: 'INCOME', balance: 0, debitCredit: 'Cr' },
      { id: 'la12', tenantId: 't_main', code: '4001', name: 'Purchase Account', group: 'EXPENSE', balance: 0, debitCredit: 'Dr' }
    ];

    this.loadFromDisk();
  }

  // --- Persistence Handlers ---

  saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dataToSave = {
        tenantCompanies: this.tenantCompanies,
        branches: this.branches,
        tenants: this.tenants,
        products: this.products,
        customers: this.customers,
        suppliers: this.suppliers,
        salesInvoices: this.salesInvoices,
        purchaseBills: this.purchaseBills,
        godowns: this.godowns,
        stockTransfers: this.stockTransfers,
        batches: this.batches,
        ledgerAccounts: this.ledgerAccounts,
        ledgerVouchers: this.ledgerVouchers,
        auditLogs: this.auditLogs
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save ERP store to disk:', err);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileData = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileData);
        if (parsed.tenantCompanies) this.tenantCompanies = parsed.tenantCompanies;
        if (parsed.branches) this.branches = parsed.branches;
        if (parsed.tenants) this.tenants = parsed.tenants;
        if (parsed.products) this.products = parsed.products;
        if (parsed.customers) this.customers = parsed.customers;
        if (parsed.suppliers) this.suppliers = parsed.suppliers;
        if (parsed.salesInvoices) this.salesInvoices = parsed.salesInvoices;
        if (parsed.purchaseBills) this.purchaseBills = parsed.purchaseBills;
        if (parsed.godowns) this.godowns = parsed.godowns;
        if (parsed.stockTransfers) this.stockTransfers = parsed.stockTransfers;
        if (parsed.batches) this.batches = parsed.batches;
        if (parsed.ledgerAccounts) this.ledgerAccounts = parsed.ledgerAccounts;
        if (parsed.ledgerVouchers) this.ledgerVouchers = parsed.ledgerVouchers;
        if (parsed.auditLogs) this.auditLogs = parsed.auditLogs;
        console.log('✅ Loaded persisted ERP database from server/data/store.json');
      }
    } catch (err) {
      console.error('Failed to load ERP store from disk:', err);
    }
  }

  // --- Multi-Tenant Helper Filters ---

  getTenantCompany(tenantId?: string): Company {
    const tid = tenantId || 't_main';
    if (!this.tenantCompanies[tid]) {
      const tenant = this.tenants.find(t => t.id === tid);
      this.tenantCompanies[tid] = {
        ...DEFAULT_COMPANY_TEMPLATE,
        tenantId: tid,
        name: tenant?.companyName || 'Apex ERP Enterprise',
        email: tenant?.email || 'contact@apexerp.com',
        phone: tenant?.phone || '+91 98765 43210',
        gstin: tenant?.gstin || '27AAACA1234A1Z5'
      };
    }
    return this.tenantCompanies[tid];
  }

  updateCompanyProfile(tenantId: string | undefined, data: Partial<Company>): Company {
    const tid = tenantId || 't_main';
    const current = this.getTenantCompany(tid);
    this.tenantCompanies[tid] = {
      ...current,
      ...data,
      tenantId: tid
    };
    this.logAudit('OWNER', 'Company Admin', 'UPDATE_COMPANY_PROFILE', 'Company', `Updated company profile & bank details for tenant ${tid}`, tid);
    this.saveToDisk();
    return this.tenantCompanies[tid];
  }

  getProductsForTenant(tenantId?: string): Product[] {
    const tid = tenantId || 't_main';
    return this.products.filter(p => (p.tenantId || 't_main') === tid);
  }

  getCustomersForTenant(tenantId?: string): Customer[] {
    const tid = tenantId || 't_main';
    return this.customers.filter(c => (c.tenantId || 't_main') === tid);
  }

  getSuppliersForTenant(tenantId?: string): Supplier[] {
    const tid = tenantId || 't_main';
    return this.suppliers.filter(s => (s.tenantId || 't_main') === tid);
  }

  getSalesInvoicesForTenant(tenantId?: string, docType?: string): SalesInvoice[] {
    const tid = tenantId || 't_main';
    const list = this.salesInvoices.filter(i => (i.tenantId || 't_main') === tid);
    if (docType) {
      return list.filter(i => i.docType === docType);
    }
    return list;
  }

  getPurchaseBillsForTenant(tenantId?: string): PurchaseBill[] {
    const tid = tenantId || 't_main';
    return this.purchaseBills.filter(b => (b.tenantId || 't_main') === tid);
  }

  getGodownsForTenant(tenantId?: string): Godown[] {
    const tid = tenantId || 't_main';
    const list = this.godowns.filter(g => (g.tenantId || 't_main') === tid);
    if (list.length === 0) {
      const defaultGodown: Godown = {
        id: 'g_' + tid,
        tenantId: tid,
        code: 'GDN-MAIN',
        name: 'Main Warehouse Godown',
        location: 'Central Logistics Hub',
        capacity: '10,000 Sq.Ft'
      };
      this.godowns.unshift(defaultGodown);
      this.saveToDisk();
      return [defaultGodown];
    }
    return list;
  }

  getStockTransfersForTenant(tenantId?: string): StockTransfer[] {
    const tid = tenantId || 't_main';
    return this.stockTransfers.filter(t => (t.tenantId || 't_main') === tid);
  }

  getLedgerAccountsForTenant(tenantId?: string): LedgerAccount[] {
    const tid = tenantId || 't_main';
    return this.ledgerAccounts.filter(l => (l.tenantId || 't_main') === tid);
  }

  getLedgerVouchersForTenant(tenantId?: string): LedgerVoucher[] {
    const tid = tenantId || 't_main';
    return this.ledgerVouchers.filter(v => (v.tenantId || 't_main') === tid);
  }

  getAuditLogsForTenant(tenantId?: string): AuditLog[] {
    const tid = tenantId || 't_main';
    return this.auditLogs.filter(a => (a.tenantId || 't_main') === tid);
  }

  // --- Deletion Methods with Automatic Inventory Adjustment & Disk Persistence ---

  deleteProduct(id: string, tenantId?: string): boolean {
    const tid = tenantId || 't_main';
    const idx = this.products.findIndex(p => p.id === id && (p.tenantId || 't_main') === tid);
    if (idx !== -1) {
      const deleted = this.products.splice(idx, 1)[0];
      this.logAudit('ADMIN', 'Admin User', 'DELETE_PRODUCT', 'Master Data', `Deleted product ${deleted.name} (${deleted.code})`, tid);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  deleteCustomer(id: string, tenantId?: string): boolean {
    const tid = tenantId || 't_main';
    const idx = this.customers.findIndex(c => c.id === id && (c.tenantId || 't_main') === tid);
    if (idx !== -1) {
      const deleted = this.customers.splice(idx, 1)[0];
      this.logAudit('ADMIN', 'Admin User', 'DELETE_CUSTOMER', 'Master Data', `Deleted customer ${deleted.name} (${deleted.code})`, tid);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  deleteSupplier(id: string, tenantId?: string): boolean {
    const tid = tenantId || 't_main';
    const idx = this.suppliers.findIndex(s => s.id === id && (s.tenantId || 't_main') === tid);
    if (idx !== -1) {
      const deleted = this.suppliers.splice(idx, 1)[0];
      this.logAudit('ADMIN', 'Admin User', 'DELETE_SUPPLIER', 'Master Data', `Deleted supplier ${deleted.name} (${deleted.code})`, tid);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  deleteSalesInvoice(id: string, tenantId?: string): boolean {
    const tid = tenantId || 't_main';
    const idx = this.salesInvoices.findIndex(i => i.id === id && (i.tenantId || 't_main') === tid);
    if (idx !== -1) {
      const deleted = this.salesInvoices.splice(idx, 1)[0];
      
      // Automatic Stock Restoration: Add sold quantities back to inventory
      if (deleted.docType === 'SALES_INVOICE' || deleted.docType === 'POS_RECEIPT') {
        deleted.items.forEach(item => {
          const prod = this.products.find(p => p.id === item.productId && (p.tenantId || 't_main') === tid);
          if (prod) {
            prod.currentStock += item.quantity;
          }
        });
      }

      // Revert customer balance
      if (deleted.customerId && deleted.dueAmount > 0) {
        const cust = this.customers.find(c => c.id === deleted.customerId && (c.tenantId || 't_main') === tid);
        if (cust) {
          cust.currentBalance = Math.max(0, cust.currentBalance - deleted.dueAmount);
        }
      }

      this.logAudit('SALES', 'Sales Admin', 'DELETE_SALES_INVOICE', 'Sales', `Deleted Invoice ${deleted.invoiceNumber} (Restored inventory stock)`, tid);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  deletePurchaseBill(id: string, tenantId?: string): boolean {
    const tid = tenantId || 't_main';
    const idx = this.purchaseBills.findIndex(b => b.id === id && (b.tenantId || 't_main') === tid);
    if (idx !== -1) {
      const deleted = this.purchaseBills.splice(idx, 1)[0];

      // Automatic Stock Adjustment: Revert stock added by this purchase bill if posted
      if (deleted.status === 'POSTED') {
        deleted.items.forEach(item => {
          const prod = this.products.find(p => p.id === item.productId && (p.tenantId || 't_main') === tid);
          if (prod) {
            prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
          }
        });
      }

      // Revert supplier balance
      if (deleted.supplierId && deleted.status === 'POSTED') {
        const supp = this.suppliers.find(s => s.id === deleted.supplierId && (s.tenantId || 't_main') === tid);
        if (supp) {
          supp.currentBalance = Math.max(0, supp.currentBalance - deleted.grandTotal);
        }
      }

      this.logAudit('PURCHASE', 'Purchase Admin', 'DELETE_PURCHASE_BILL', 'Purchase', `Deleted Purchase Bill ${deleted.billNumber} (Reverted inventory stock)`, tid);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  deleteTenant(tenantId: string): boolean {
    const idx = this.tenants.findIndex(t => t.id === tenantId);
    if (idx !== -1) {
      const deleted = this.tenants.splice(idx, 1)[0];
      delete this.tenantCompanies[tenantId];
      this.logAudit('SUPER_ADMIN', 'Super Admin', 'DELETE_TENANT', 'SaaS Admin', `Deleted Tenant Account ${deleted.companyName} (${deleted.email})`, tenantId);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Super Admin SaaS Tenant Methods ---

  createTenant(data: Partial<Tenant>): Tenant {
    const tid = 't_' + Date.now();
    const newTenant: Tenant = {
      id: tid,
      code: 'TENANT-' + String(this.tenants.length + 1).padStart(3, '0'),
      companyName: data.companyName || 'New Client Enterprise',
      email: data.email || `client${this.tenants.length + 1}@apexerp.com`,
      password: data.password || 'client123',
      phone: data.phone || '+91 98000 00000',
      gstin: data.gstin || '27AAACA0000A1Z5',
      active: true,
      createdAt: new Date().toISOString(),
      features: data.features || {
        posBilling: true,
        salesWorkflow: true,
        purchaseOtp: true,
        productRates: true,
        inventoryGodown: true,
        accountsLedger: true,
        gstStatutory: true,
        outstandingAgeing: true,
        analyticsAi: true
      }
    };

    this.tenants.unshift(newTenant);
    
    this.tenantCompanies[tid] = {
      ...DEFAULT_COMPANY_TEMPLATE,
      tenantId: tid,
      name: newTenant.companyName,
      email: newTenant.email,
      phone: newTenant.phone,
      gstin: newTenant.gstin
    };

    this.godowns.unshift({
      id: 'g_' + tid,
      tenantId: tid,
      code: 'GDN-MAIN',
      name: 'Main Warehouse Godown',
      location: 'Central Logistics Hub',
      capacity: '10,000 Sq.Ft'
    });

    this.logAudit('SUPER_ADMIN', 'Super Admin', 'CREATE_TENANT', 'SaaS Admin', `Created Client Account ${newTenant.companyName} (${newTenant.email})`, tid);
    this.saveToDisk();
    return newTenant;
  }

  toggleTenantStatus(tenantId: string): Tenant | null {
    const tenant = this.tenants.find(t => t.id === tenantId);
    if (tenant) {
      tenant.active = !tenant.active;
      this.logAudit('SUPER_ADMIN', 'Super Admin', 'TOGGLE_TENANT_STATUS', 'SaaS Admin', `Set Client ${tenant.companyName} status to ${tenant.active ? 'ACTIVE' : 'DEACTIVATED'}`, tenantId);
      this.saveToDisk();
      return tenant;
    }
    return null;
  }

  updateTenantFeatures(tenantId: string, features: Partial<TenantFeatureToggles>): Tenant | null {
    const tenant = this.tenants.find(t => t.id === tenantId);
    if (tenant) {
      tenant.features = { ...tenant.features, ...features };
      this.logAudit('SUPER_ADMIN', 'Super Admin', 'UPDATE_TENANT_FEATURES', 'SaaS Admin', `Updated feature matrix for ${tenant.companyName}`, tenantId);
      this.saveToDisk();
      return tenant;
    }
    return null;
  }

  // --- Auth Login Handler ---
  login(email: string, pass: string) {
    if (email.toLowerCase() === 'superadmin@apexerp.com' && pass === 'admin123') {
      this.logAudit('SUPER_ADMIN', 'Super Admin', 'LOGIN_SUCCESS', 'Auth', 'Super Admin logged into SaaS management portal');
      this.saveToDisk();
      return {
        success: true,
        session: {
          token: 'token_superadmin_' + Date.now(),
          userType: 'SUPER_ADMIN' as const,
          email: 'superadmin@apexerp.com',
          name: 'Apex SaaS Super Admin',
          role: 'ADMIN' as const
        }
      };
    }

    const tenant = this.tenants.find(t => t.email.toLowerCase() === email.toLowerCase());
    if (tenant) {
      if (tenant.password !== pass) {
        return { success: false, message: 'Invalid password' };
      }

      if (!tenant.active) {
        return { success: false, message: 'Your client account is DEACTIVATED by Super Admin! Please contact support.' };
      }

      this.logAudit('OWNER', tenant.companyName, 'LOGIN_SUCCESS', 'Auth', `Client logged into ERP system (${tenant.email})`, tenant.id);
      this.saveToDisk();
      return {
        success: true,
        session: {
          token: 'token_tenant_' + tenant.id + '_' + Date.now(),
          userType: 'CLIENT_USER' as const,
          tenantId: tenant.id,
          email: tenant.email,
          name: tenant.companyName,
          role: 'OWNER' as const,
          tenant
        }
      };
    }

    return { success: false, message: 'Invalid email or password.' };
  }

  logAudit(userRole: string, userName: string, action: string, module: string, details: string, tenantId?: string) {
    const newLog: AuditLog = {
      id: 'al_' + Date.now(),
      tenantId: tenantId || 't_main',
      timestamp: new Date().toISOString(),
      userRole,
      userName,
      action,
      module,
      details,
      ipAddress: '127.0.0.1'
    };
    this.auditLogs.unshift(newLog);
    this.saveToDisk();
  }

  getDashboardMetrics(tenantId?: string): DashboardMetrics {
    const tid = tenantId || 't_main';
    const tenantInvoices = this.getSalesInvoicesForTenant(tid);
    const tenantPurchases = this.getPurchaseBillsForTenant(tid);
    const tenantProducts = this.getProductsForTenant(tid);
    const tenantCustomers = this.getCustomersForTenant(tid);
    const tenantSuppliers = this.getSuppliersForTenant(tid);

    const totalSales = tenantInvoices
      .filter(i => i.docType === 'SALES_INVOICE' || i.docType === 'POS_RECEIPT')
      .reduce((acc, i) => acc + i.grandTotal, 0);

    const todaysSales = tenantInvoices
      .filter(i => i.invoiceDate === new Date().toISOString().split('T')[0])
      .reduce((acc, i) => acc + i.grandTotal, 0);

    const totalPurchases = tenantPurchases
      .filter(b => b.status === 'POSTED')
      .reduce((acc, b) => acc + b.grandTotal, 0);

    const receivables = tenantCustomers.reduce((acc, c) => acc + c.currentBalance, 0);
    const payables = tenantSuppliers.reduce((acc, s) => acc + s.currentBalance, 0);

    const stockValue = tenantProducts.reduce((acc, p) => acc + (p.currentStock * (p.rates?.purchaseCostRate || 0)), 0);
    const lowStockCount = tenantProducts.filter(p => p.currentStock <= p.minReorderLevel).length;

    const pendingQuotationsCount = tenantInvoices.filter(i => i.docType === 'QUOTATION' && i.status === 'PENDING').length;
    const pendingOrdersCount = tenantInvoices.filter(i => i.docType === 'SALES_ORDER' && i.status === 'PENDING').length;

    const grossProfit = totalSales * 0.20;
    const netProfit = grossProfit;

    const gstPayable = tenantInvoices.reduce((acc, i) => acc + i.totalCGST + i.totalSGST + i.totalIGST, 0);
    const gstReceivable = tenantPurchases.filter(b => b.status === 'POSTED').reduce((acc, b) => acc + b.totalCGST + b.totalSGST + b.totalIGST, 0);

    return {
      totalSales,
      todaysSales,
      monthlySales: totalSales,
      totalPurchases,
      receivables,
      payables,
      cashBankBalance: 0,
      currentStockValue: stockValue,
      lowStockItemsCount: lowStockCount,
      pendingQuotationsCount,
      pendingOrdersCount,
      grossProfit,
      netProfit,
      gstPayable,
      gstReceivable
    };
  }

  createSalesInvoice(invoiceData: Partial<SalesInvoice>, userName: string = 'User', tenantId?: string): SalesInvoice {
    const tid = tenantId || 't_main';
    const isInterState = invoiceData.isInterState || false;
    
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    const processedItems = (invoiceData.items || []).map((item, idx) => {
      const lineSubtotal = item.quantity * item.rate;
      const discAmt = lineSubtotal * ((item.discountPercent || 0) / 100);
      const taxable = lineSubtotal - discAmt;
      
      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (isInterState) {
        igst = taxable * (item.gstRate / 100);
      } else {
        cgst = taxable * ((item.gstRate / 2) / 100);
        sgst = taxable * ((item.gstRate / 2) / 100);
      }

      const total = taxable + cgst + sgst + igst;

      subTotal += lineSubtotal;
      totalDiscount += discAmt;
      totalTaxable += taxable;
      totalCGST += cgst;
      totalSGST += sgst;
      totalIGST += igst;

      if (invoiceData.docType === 'SALES_INVOICE' || invoiceData.docType === 'POS_RECEIPT') {
        const prod = this.products.find(p => p.id === item.productId && (p.tenantId || 't_main') === tid);
        if (prod) {
          prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
        }
      }

      return {
        ...item,
        id: 'li_' + Date.now() + '_' + idx,
        discountAmount: discAmt,
        taxableAmount: taxable,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        totalAmount: total
      };
    });

    const grandBeforeRound = totalTaxable + totalCGST + totalSGST + totalIGST;
    const grandTotal = Math.round(grandBeforeRound);
    const roundOff = Number((grandTotal - grandBeforeRound).toFixed(2));

    const invoiceNum = invoiceData.invoiceNumber || `INV-2026-${String(this.getSalesInvoicesForTenant(tid).length + 1).padStart(3, '0')}`;
    const paidAmt = invoiceData.paidAmount || (invoiceData.paymentMode === 'CASH' || invoiceData.paymentMode === 'UPI' ? grandTotal : 0);
    const dueAmt = Math.max(0, grandTotal - paidAmt);

    const newInvoice: SalesInvoice = {
      id: 'inv_' + Date.now(),
      tenantId: tid,
      docType: invoiceData.docType || 'SALES_INVOICE',
      invoiceNumber: invoiceNum,
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      branchId: invoiceData.branchId || 'b1',
      customerId: invoiceData.customerId || '',
      customerName: invoiceData.customerName || 'Customer',
      customerGstin: invoiceData.customerGstin || 'UNREGISTERED',
      customerAddress: invoiceData.customerAddress || 'Address',
      placeOfSupply: invoiceData.placeOfSupply || 'Maharashtra',
      isInterState,
      salesperson: invoiceData.salesperson || userName,
      items: processedItems,
      subTotal,
      totalDiscount,
      totalTaxable,
      totalCGST,
      totalSGST,
      totalIGST,
      roundOff,
      grandTotal,
      paidAmount: paidAmt,
      dueAmount: dueAmt,
      paymentMode: invoiceData.paymentMode || 'CREDIT',
      status: dueAmt === 0 ? 'PAID' : paidAmt > 0 ? 'PARTIAL' : 'PENDING',
      notes: invoiceData.notes,
      eWayBillNo: grandTotal > 50000 ? 'EWAY' + Math.floor(100000000000 + Math.random() * 900000000000) : undefined,
      eInvoiceIrn: grandTotal > 100000 ? 'IRN' + Math.floor(1000000000000000 + Math.random() * 9000000000000000) : undefined,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=INVOICE:${invoiceNum}_AMT:${grandTotal}`,
      createdAt: new Date().toISOString()
    };

    this.salesInvoices.unshift(newInvoice);

    if (newInvoice.customerId) {
      const cust = this.customers.find(c => c.id === newInvoice.customerId && (c.tenantId || 't_main') === tid);
      if (cust) {
        cust.currentBalance += dueAmt;
      }
    }

    this.ledgerVouchers.unshift({
      id: 'v_' + Date.now(),
      tenantId: tid,
      voucherNo: 'VCH-SLS-' + invoiceNum,
      date: newInvoice.invoiceDate,
      voucherType: 'SALES',
      debitAccount: newInvoice.customerName,
      creditAccount: 'Sales Account',
      amount: newInvoice.totalTaxable,
      narration: `Sales Invoice ${invoiceNum} generated`,
      referenceNo: invoiceNum
    });

    this.logAudit('SALES', userName, 'CREATE_INVOICE', 'Sales', `Created ${newInvoice.docType} ${invoiceNum} for ${newInvoice.customerName} (₹${grandTotal})`, tid);
    this.saveToDisk();

    return newInvoice;
  }

  createPurchaseBill(billData: Partial<PurchaseBill>, userName: string = 'User', tenantId?: string): PurchaseBill {
    const tid = tenantId || 't_main';
    let subTotal = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    const processedItems = (billData.items || []).map((item, idx) => {
      const taxable = item.quantity * item.rate;
      const cgst = taxable * 0.09;
      const sgst = taxable * 0.09;
      const total = taxable + cgst + sgst;

      subTotal += taxable;
      totalTaxable += taxable;
      totalCGST += cgst;
      totalSGST += sgst;

      return {
        ...item,
        id: 'pli_' + Date.now() + '_' + idx,
        taxableAmount: taxable,
        cgstAmount: cgst,
        sgstAmount: sgst,
        totalAmount: total
      };
    });

    const grandTotal = Math.round(totalTaxable + totalCGST + totalSGST);
    const billNum = billData.billNumber || `PUR-2026-${String(this.getPurchaseBillsForTenant(tid).length + 1).padStart(3, '0')}`;
    const requiresOwnerOtp = grandTotal >= 100000;

    const newBill: PurchaseBill = {
      id: 'pb_' + Date.now(),
      tenantId: tid,
      billNumber: billNum,
      supplierInvoiceNo: billData.supplierInvoiceNo || 'SUP-INV-99',
      billDate: billData.billDate || new Date().toISOString().split('T')[0],
      dueDate: billData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      branchId: billData.branchId || 'b1',
      supplierId: billData.supplierId || '',
      supplierName: billData.supplierName || 'Supplier',
      supplierGstin: billData.supplierGstin || 'UNREGISTERED',
      items: processedItems,
      subTotal,
      totalDiscount: 0,
      totalTaxable,
      totalCGST,
      totalSGST,
      totalIGST: 0,
      freightCharges: billData.freightCharges || 0,
      grandTotal,
      status: requiresOwnerOtp ? 'PENDING_OWNER_OTP' : 'APPROVED',
      requiresOwnerOtp,
      createdAt: new Date().toISOString()
    };

    if (!requiresOwnerOtp) {
      newBill.status = 'POSTED';
      newBill.postedAt = new Date().toISOString();
      this.postPurchaseBillStockAndAccounts(newBill, tid);
    }

    this.purchaseBills.unshift(newBill);
    this.logAudit('PURCHASE', userName, 'CREATE_PURCHASE', 'Purchase', `Created Purchase Bill ${billNum} for ${newBill.supplierName} (₹${grandTotal}) - Status: ${newBill.status}`, tid);
    this.saveToDisk();

    return newBill;
  }

  verifyOwnerOtpAndPost(billId: string, otp: string, userName: string = 'Owner', tenantId?: string): { success: boolean; message: string } {
    const tid = tenantId || 't_main';
    if (otp !== this.ownerOtpCode) {
      this.logAudit('SECURITY', userName, 'OTP_VERIFICATION_FAILED', 'Purchase Approval', `Failed OTP verification attempt for Bill ID ${billId}`, tid);
      return { success: false, message: 'Invalid Owner OTP! Verification failed.' };
    }

    const bill = this.purchaseBills.find(b => b.id === billId && (b.tenantId || 't_main') === tid);
    if (!bill) {
      return { success: false, message: 'Purchase bill not found.' };
    }

    bill.status = 'POSTED';
    bill.otpVerifiedAt = new Date().toISOString();
    bill.approvedBy = userName + ' (Owner OTP Verified)';
    bill.postedAt = new Date().toISOString();

    this.postPurchaseBillStockAndAccounts(bill, tid);

    this.logAudit('OWNER', userName, 'APPROVE_PURCHASE_OTP', 'Purchase Approval', `Verified Owner OTP and posted Purchase Bill ${bill.billNumber} (₹${bill.grandTotal})`, tid);
    this.saveToDisk();
    return { success: true, message: `Owner OTP verified successfully! Purchase ${bill.billNumber} posted to Stock, Ledger & GST.` };
  }

  private postPurchaseBillStockAndAccounts(bill: PurchaseBill, tenantId: string) {
    bill.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId && (p.tenantId || 't_main') === tenantId);
      if (prod) {
        prod.currentStock += item.quantity;
      }
    });

    const supplier = this.suppliers.find(s => s.id === bill.supplierId && (s.tenantId || 't_main') === tenantId);
    if (supplier) {
      supplier.currentBalance += bill.grandTotal;
    }

    this.ledgerVouchers.unshift({
      id: 'v_' + Date.now(),
      tenantId,
      voucherNo: 'VCH-PUR-' + bill.billNumber,
      date: bill.billDate,
      voucherType: 'PURCHASE',
      debitAccount: 'Purchase Account',
      creditAccount: bill.supplierName,
      amount: bill.totalTaxable,
      narration: `Purchase Bill ${bill.billNumber} posted after owner approval`,
      referenceNo: bill.billNumber
    });
    this.saveToDisk();
  }
}

export const dbStore = new ERPDataStore();
