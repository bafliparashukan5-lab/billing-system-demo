import fs from 'fs';
import path from 'path';
import { 
  Company, Branch, User, Product, Customer, Supplier, 
  SalesInvoice, PurchaseBill, Godown, StockTransfer, BatchItem, 
  LedgerAccount, LedgerVoucher, AuditLog, DashboardMetrics, Tenant, TenantFeatureToggles 
} from '../shared/types.js';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

class ERPDataStore {
  company: Company;
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

    // Defaults
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

    this.company = {
      name: 'Apex ERP Technologies Pvt Ltd',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60',
      tagline: 'Complete Enterprise Billing & Inventory System',
      address: 'Corporate Headquarters',
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

    this.branches = [
      { id: 'b1', code: 'BR-MAIN', name: 'Main Branch - Head Office', address: 'Headquarters', phone: '+91 98765 43210', gstin: '27AAACA1234A1Z5', isMain: true }
    ];

    this.users = [
      { id: 'u1', name: 'System Owner', email: 'owner@apexerp.com', role: 'OWNER' }
    ];

    this.godowns = [
      { id: 'g1', code: 'GDN-MAIN', name: 'Main Warehouse Godown', location: 'Central Logistics Hub', capacity: '10,000 Sq.Ft' }
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
      { id: 'la1', code: '1001', name: 'Cash Account (Counter)', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la2', code: '1002', name: 'Operating Bank Account', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la3', code: '1100', name: 'Trade Receivables (Sundry Debtors)', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la4', code: '1200', name: 'Closing Merchandise Inventory', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la5', code: '2001', name: 'Trade Payables (Sundry Creditors)', group: 'LIABILITY', balance: 0, debitCredit: 'Cr' },
      { id: 'la6', code: '2101', name: 'CGST Output Payable', group: 'LIABILITY', balance: 0, debitCredit: 'Cr' },
      { id: 'la7', code: '2102', name: 'SGST Output Payable', group: 'LIABILITY', balance: 0, debitCredit: 'Cr' },
      { id: 'la8', code: '2103', name: 'IGST Output Payable', group: 'LIABILITY', balance: 0, debitCredit: 'Cr' },
      { id: 'la9', code: '2104', name: 'CGST Input Tax Credit (ITC)', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la10', code: '2105', name: 'SGST Input Tax Credit (ITC)', group: 'ASSET', balance: 0, debitCredit: 'Dr' },
      { id: 'la11', code: '3001', name: 'Sales Account (Domestic)', group: 'INCOME', balance: 0, debitCredit: 'Cr' },
      { id: 'la12', code: '4001', name: 'Purchase Account', group: 'EXPENSE', balance: 0, debitCredit: 'Dr' }
    ];

    // Load persisted store from disk if exists
    this.loadFromDisk();
  }

  // --- Persistence Handlers ---

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dataToSave = {
        company: this.company,
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
        if (parsed.company) this.company = parsed.company;
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

  // --- Super Admin SaaS Tenant Methods ---

  createTenant(data: Partial<Tenant>): Tenant {
    const newTenant: Tenant = {
      id: 't_' + Date.now(),
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
    this.logAudit('SUPER_ADMIN', 'Super Admin', 'CREATE_TENANT', 'SaaS Admin', `Created Client Account ${newTenant.companyName} (${newTenant.email})`);
    this.saveToDisk();
    return newTenant;
  }

  toggleTenantStatus(tenantId: string): Tenant | null {
    const tenant = this.tenants.find(t => t.id === tenantId);
    if (tenant) {
      tenant.active = !tenant.active;
      this.logAudit('SUPER_ADMIN', 'Super Admin', 'TOGGLE_TENANT_STATUS', 'SaaS Admin', `Set Client ${tenant.companyName} status to ${tenant.active ? 'ACTIVE' : 'DEACTIVATED'}`);
      this.saveToDisk();
      return tenant;
    }
    return null;
  }

  updateTenantFeatures(tenantId: string, features: Partial<TenantFeatureToggles>): Tenant | null {
    const tenant = this.tenants.find(t => t.id === tenantId);
    if (tenant) {
      tenant.features = { ...tenant.features, ...features };
      this.logAudit('SUPER_ADMIN', 'Super Admin', 'UPDATE_TENANT_FEATURES', 'SaaS Admin', `Updated feature matrix for ${tenant.companyName}`);
      this.saveToDisk();
      return tenant;
    }
    return null;
  }

  updateCompanyProfile(data: Partial<Company>): Company {
    this.company = {
      ...this.company,
      ...data
    };
    this.logAudit('OWNER', 'Company Admin', 'UPDATE_COMPANY_PROFILE', 'Company', 'Updated company profile, GSTIN & bank details');
    this.saveToDisk();
    return this.company;
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

      this.logAudit('OWNER', tenant.companyName, 'LOGIN_SUCCESS', 'Auth', `Client logged into ERP system (${tenant.email})`);
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

  logAudit(userRole: string, userName: string, action: string, module: string, details: string) {
    const newLog: AuditLog = {
      id: 'al_' + Date.now(),
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

  getDashboardMetrics(): DashboardMetrics {
    const totalSales = this.salesInvoices
      .filter(i => i.docType === 'SALES_INVOICE' || i.docType === 'POS_RECEIPT')
      .reduce((acc, i) => acc + i.grandTotal, 0);

    const todaysSales = this.salesInvoices
      .filter(i => i.invoiceDate === new Date().toISOString().split('T')[0])
      .reduce((acc, i) => acc + i.grandTotal, 0);

    const totalPurchases = this.purchaseBills
      .filter(b => b.status === 'POSTED')
      .reduce((acc, b) => acc + b.grandTotal, 0);

    const receivables = this.customers.reduce((acc, c) => acc + c.currentBalance, 0);
    const payables = this.suppliers.reduce((acc, s) => acc + s.currentBalance, 0);

    const stockValue = this.products.reduce((acc, p) => acc + (p.currentStock * (p.rates?.purchaseCostRate || 0)), 0);
    const lowStockCount = this.products.filter(p => p.currentStock <= p.minReorderLevel).length;

    const pendingQuotationsCount = this.salesInvoices.filter(i => i.docType === 'QUOTATION' && i.status === 'PENDING').length;
    const pendingOrdersCount = this.salesInvoices.filter(i => i.docType === 'SALES_ORDER' && i.status === 'PENDING').length;

    const grossProfit = totalSales * 0.20;
    const netProfit = grossProfit;

    const gstPayable = this.salesInvoices.reduce((acc, i) => acc + i.totalCGST + i.totalSGST + i.totalIGST, 0);
    const gstReceivable = this.purchaseBills.filter(b => b.status === 'POSTED').reduce((acc, b) => acc + b.totalCGST + b.totalSGST + b.totalIGST, 0);

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

  createSalesInvoice(invoiceData: Partial<SalesInvoice>, userName: string = 'User'): SalesInvoice {
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
        const prod = this.products.find(p => p.id === item.productId);
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

    const invoiceNum = invoiceData.invoiceNumber || `INV-2026-${String(this.salesInvoices.length + 1).padStart(3, '0')}`;
    const paidAmt = invoiceData.paidAmount || (invoiceData.paymentMode === 'CASH' || invoiceData.paymentMode === 'UPI' ? grandTotal : 0);
    const dueAmt = Math.max(0, grandTotal - paidAmt);

    const newInvoice: SalesInvoice = {
      id: 'inv_' + Date.now(),
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
      const cust = this.customers.find(c => c.id === newInvoice.customerId);
      if (cust) {
        cust.currentBalance += dueAmt;
      }
    }

    this.ledgerVouchers.unshift({
      id: 'v_' + Date.now(),
      voucherNo: 'VCH-SLS-' + invoiceNum,
      date: newInvoice.invoiceDate,
      voucherType: 'SALES',
      debitAccount: newInvoice.customerName,
      creditAccount: 'Sales Account',
      amount: newInvoice.totalTaxable,
      narration: `Sales Invoice ${invoiceNum} generated`,
      referenceNo: invoiceNum
    });

    this.logAudit('SALES', userName, 'CREATE_INVOICE', 'Sales', `Created ${newInvoice.docType} ${invoiceNum} for ${newInvoice.customerName} (₹${grandTotal})`);
    this.saveToDisk();

    return newInvoice;
  }

  createPurchaseBill(billData: Partial<PurchaseBill>, userName: string = 'User'): PurchaseBill {
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
    const billNum = billData.billNumber || `PUR-2026-${String(this.purchaseBills.length + 1).padStart(3, '0')}`;
    const requiresOwnerOtp = grandTotal >= 100000;

    const newBill: PurchaseBill = {
      id: 'pb_' + Date.now(),
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
      this.postPurchaseBillStockAndAccounts(newBill);
    }

    this.purchaseBills.unshift(newBill);
    this.logAudit('PURCHASE', userName, 'CREATE_PURCHASE', 'Purchase', `Created Purchase Bill ${billNum} for ${newBill.supplierName} (₹${grandTotal}) - Status: ${newBill.status}`);
    this.saveToDisk();

    return newBill;
  }

  verifyOwnerOtpAndPost(billId: string, otp: string, userName: string = 'Owner'): { success: boolean; message: string } {
    if (otp !== this.ownerOtpCode) {
      this.logAudit('SECURITY', userName, 'OTP_VERIFICATION_FAILED', 'Purchase Approval', `Failed OTP verification attempt for Bill ID ${billId}`);
      return { success: false, message: 'Invalid Owner OTP! Verification failed.' };
    }

    const bill = this.purchaseBills.find(b => b.id === billId);
    if (!bill) {
      return { success: false, message: 'Purchase bill not found.' };
    }

    bill.status = 'POSTED';
    bill.otpVerifiedAt = new Date().toISOString();
    bill.approvedBy = userName + ' (Owner OTP Verified)';
    bill.postedAt = new Date().toISOString();

    this.postPurchaseBillStockAndAccounts(bill);

    this.logAudit('OWNER', userName, 'APPROVE_PURCHASE_OTP', 'Purchase Approval', `Verified Owner OTP and posted Purchase Bill ${bill.billNumber} (₹${bill.grandTotal})`);
    this.saveToDisk();
    return { success: true, message: `Owner OTP verified successfully! Purchase ${bill.billNumber} posted to Stock, Ledger & GST.` };
  }

  private postPurchaseBillStockAndAccounts(bill: PurchaseBill) {
    bill.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock += item.quantity;
      }
    });

    const supplier = this.suppliers.find(s => s.id === bill.supplierId);
    if (supplier) {
      supplier.currentBalance += bill.grandTotal;
    }

    this.ledgerVouchers.unshift({
      id: 'v_' + Date.now(),
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
