import { 
  Company, Branch, User, Product, Customer, Supplier, 
  SalesInvoice, PurchaseBill, Godown, StockTransfer, BatchItem, 
  LedgerAccount, LedgerVoucher, AuditLog, DashboardMetrics, Tenant, TenantFeatureToggles 
} from '../shared/types.js';

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

    // Default Demo Tenants for Super Admin Management
    this.tenants = [
      {
        id: 't_demo',
        code: 'TENANT-001',
        companyName: 'Apex Tech Solutions Pvt Ltd',
        email: 'client@apexerp.com',
        password: 'client123',
        phone: '+91 98765 43210',
        gstin: '27AAACA1234A1Z5',
        active: true,
        createdAt: '2026-08-01T00:00:00Z',
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
      },
      {
        id: 't_retail',
        code: 'TENANT-002',
        companyName: 'Metro Retail Mart',
        email: 'metro@retail.com',
        password: 'metro123',
        phone: '+91 98200 99887',
        gstin: '27AAACM9988A1Z2',
        active: true,
        createdAt: '2026-08-05T00:00:00Z',
        features: {
          posBilling: true,
          salesWorkflow: true,
          purchaseOtp: false,
          productRates: true,
          inventoryGodown: true,
          accountsLedger: false,
          gstStatutory: true,
          outstandingAgeing: false,
          analyticsAi: false
        }
      }
    ];

    this.company = {
      name: 'Apex ERP Technologies Pvt Ltd',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60',
      tagline: 'Complete Enterprise Billing & Inventory System',
      address: 'Suite 402, Pinnacle Business Park, MIDC Andheri East',
      cityState: 'Mumbai, Maharashtra',
      pincode: '400093',
      phone: '+91 98765 43210 / +91 22 2839 0000',
      email: 'contact@apexerp.demo',
      website: 'www.apexerp-demo.com',
      gstin: '27AAACA1234A1Z5',
      pan: 'AAACA1234A',
      cin: 'U72200MH2021PTC350000',
      bankName: 'HDFC Bank Ltd',
      accountNo: '50200048291045',
      ifscCode: 'HDFC0000240',
      branchName: 'Andheri East Branch, Mumbai',
      upiId: 'apexerp@hdfcbank',
      currencySymbol: '₹',
      termsAndConditions: [
        '1. Goods once sold will not be taken back without valid return approval.',
        '2. Interest @ 18% p.a. will be charged on overdue payments exceeding credit terms.',
        '3. All disputes subject to Mumbai Jurisdiction only.'
      ]
    };

    this.branches = [
      { id: 'b1', code: 'BR-MUM', name: 'Main Branch - Mumbai Central', address: 'MIDC Andheri, Mumbai', phone: '+91 98765 43210', gstin: '27AAACA1234A1Z5', isMain: true },
      { id: 'b2', code: 'BR-PUN', name: 'Branch Office - Pune City', address: 'FC Road, Shivaji Nagar, Pune', phone: '+91 98765 43211', gstin: '27AAACA1234A2Z4', isMain: false }
    ];

    this.users = [
      { id: 'u1', name: 'Rajesh Sharma', email: 'owner@apexerp.demo', role: 'OWNER' },
      { id: 'u2', name: 'Vikram Mehta', email: 'admin@apexerp.demo', role: 'ADMIN' },
      { id: 'u3', name: 'Anita Verma', email: 'accountant@apexerp.demo', role: 'ACCOUNTANT' },
      { id: 'u4', name: 'Suresh Patil', email: 'sales@apexerp.demo', role: 'SALES' },
      { id: 'u5', name: 'Rohan Gupta', email: 'cashier@apexerp.demo', role: 'CASHIER' }
    ];

    this.godowns = [
      { id: 'g1', code: 'GDN-MAIN', name: 'Main Warehouse Godown A', location: 'Bhiwandi Logistics Hub, Thane', capacity: '10,000 Sq.Ft' },
      { id: 'g2', code: 'GDN-SHOW', name: 'Showroom Stock Depot B', location: 'Andheri Store Room, Mumbai', capacity: '2,500 Sq.Ft' }
    ];

    this.products = [
      {
        id: 'p1',
        code: 'PRD-001',
        sku: 'LAP-DELL-XPS15',
        barcode: '8901234567890',
        name: 'Dell XPS 15 High Performance Laptop (16GB/512GB)',
        category: 'Electronics',
        subcategory: 'Laptops',
        brand: 'Dell',
        hsnSac: '84713010',
        unit: 'Pcs',
        gstRate: 18,
        rates: {
          purchaseCostRate: 92000,
          mrp: 125000,
          retailRate: 112000,
          wholesaleRate: 104000,
          dealerRate: 98000,
          minSellingRate: 95000
        },
        openingStock: 25,
        currentStock: 18,
        minReorderLevel: 5,
        maxStockLevel: 50,
        rackLocation: 'Rack A-12',
        hasBatchTracking: true,
        hasSerialTracking: true
      },
      {
        id: 'p2',
        code: 'PRD-002',
        sku: 'MON-LG-27UK',
        barcode: '8901234567891',
        name: 'LG 27-inch 4K UHD IPS Color Calibration Monitor',
        category: 'Electronics',
        subcategory: 'Monitors',
        brand: 'LG',
        hsnSac: '85285200',
        unit: 'Pcs',
        gstRate: 18,
        rates: {
          purchaseCostRate: 24000,
          mrp: 36000,
          retailRate: 31500,
          wholesaleRate: 28500,
          dealerRate: 26500,
          minSellingRate: 25500
        },
        openingStock: 40,
        currentStock: 32,
        minReorderLevel: 8,
        maxStockLevel: 80,
        rackLocation: 'Rack B-04',
        hasBatchTracking: false,
        hasSerialTracking: true
      },
      {
        id: 'p3',
        code: 'PRD-003',
        sku: 'KBD-LOG-MXKEYS',
        barcode: '8901234567892',
        name: 'Logitech MX Keys Advanced Wireless Keyboard',
        category: 'Accessories',
        subcategory: 'Peripherals',
        brand: 'Logitech',
        hsnSac: '84716060',
        unit: 'Pcs',
        gstRate: 18,
        rates: {
          purchaseCostRate: 7500,
          mrp: 12995,
          retailRate: 10500,
          wholesaleRate: 9200,
          dealerRate: 8500,
          minSellingRate: 8000
        },
        openingStock: 100,
        currentStock: 74,
        minReorderLevel: 15,
        maxStockLevel: 200,
        rackLocation: 'Bin C-01',
        hasBatchTracking: false,
        hasSerialTracking: false
      },
      {
        id: 'p4',
        code: 'PRD-004',
        sku: 'PRN-HP-LJ1020',
        barcode: '8901234567893',
        name: 'HP LaserJet Pro Mono Printer M126nw (All-in-One)',
        category: 'Office Automation',
        subcategory: 'Printers',
        brand: 'HP',
        hsnSac: '84433210',
        unit: 'Pcs',
        gstRate: 18,
        rates: {
          purchaseCostRate: 14200,
          mrp: 21500,
          retailRate: 18900,
          wholesaleRate: 16800,
          dealerRate: 15500,
          minSellingRate: 15000
        },
        openingStock: 12,
        currentStock: 4,
        minReorderLevel: 6,
        maxStockLevel: 30,
        rackLocation: 'Rack D-02',
        hasBatchTracking: true,
        hasSerialTracking: true
      },
      {
        id: 'p5',
        code: 'PRD-005',
        sku: 'MOU-LOG-MXM3',
        barcode: '8901234567894',
        name: 'Logitech MX Master 3S Ergonomic Wireless Mouse',
        category: 'Accessories',
        subcategory: 'Peripherals',
        brand: 'Logitech',
        hsnSac: '84716060',
        unit: 'Pcs',
        gstRate: 18,
        rates: {
          purchaseCostRate: 6200,
          mrp: 10995,
          retailRate: 8900,
          wholesaleRate: 7800,
          dealerRate: 7100,
          minSellingRate: 6800
        },
        openingStock: 50,
        currentStock: 38,
        minReorderLevel: 10,
        maxStockLevel: 100,
        rackLocation: 'Bin C-02',
        hasBatchTracking: false,
        hasSerialTracking: false
      }
    ];

    this.batches = [
      { id: 'bt1', productId: 'p1', productName: 'Dell XPS 15 High Performance Laptop', batchNumber: 'BAT-2026-XPS01', mfgDate: '2026-01-15', expiryDate: '2029-01-15', quantity: 18, costRate: 92000, godownId: 'g1' },
      { id: 'bt2', productId: 'p4', productName: 'HP LaserJet Pro Mono Printer', batchNumber: 'BAT-2026-HP09', mfgDate: '2026-02-01', expiryDate: '2028-02-01', quantity: 4, costRate: 14200, godownId: 'g1' }
    ];

    this.customers = [
      {
        id: 'c1',
        code: 'CUST-001',
        name: 'Reliance Retail Ventures Ltd',
        companyName: 'Reliance Retail Ventures Ltd',
        gstin: '27AAACR5432B1Z8',
        pan: 'AAACR5432B',
        email: 'procurement@relianceretail.com',
        phone: '+91 98200 11223',
        billingAddress: 'Reliance Corporate Park, Thane-Belapur Road, Navi Mumbai',
        shippingAddress: 'Central Hub Godown 4, Bhiwandi, Maharashtra',
        state: 'Maharashtra',
        creditLimit: 500000,
        creditDays: 30,
        openingBalance: 120000,
        currentBalance: 178500,
        active: true
      },
      {
        id: 'c2',
        code: 'CUST-002',
        name: 'Tata Consultancy Services Ltd',
        companyName: 'TCS Infotech',
        gstin: '27AAACT1234C1Z9',
        pan: 'AAACT1234C',
        email: 'vendor.management@tcs.com',
        phone: '+91 98211 44556',
        billingAddress: 'TCS House, Raveline Street, Fort, Mumbai',
        shippingAddress: 'TCS Yantra Park, Subhash Nagar, Thane West',
        state: 'Maharashtra',
        creditLimit: 1000000,
        creditDays: 45,
        openingBalance: 0,
        currentBalance: 345000,
        active: true
      },
      {
        id: 'c3',
        code: 'CUST-003',
        name: 'Infosys Tech Bangalore (Interstate)',
        companyName: 'Infosys Ltd',
        gstin: '29AAACI9988D1Z2',
        pan: 'AAACI9988D',
        email: 'purchase@infosys.com',
        phone: '+91 80 2852 0261',
        billingAddress: 'Electronics City, Hosur Road, Bengaluru, Karnataka',
        shippingAddress: 'Electronics City, Hosur Road, Bengaluru, Karnataka',
        state: 'Karnataka',
        creditLimit: 750000,
        creditDays: 30,
        openingBalance: 50000,
        currentBalance: 88500,
        active: true
      },
      {
        id: 'c4',
        code: 'CUST-WALK',
        name: 'Walk-in Retail Cash Customer',
        gstin: 'UNREGISTERED',
        email: 'cashier@apexerp.demo',
        phone: '+91 00000 00000',
        billingAddress: 'Over the counter',
        shippingAddress: 'Over the counter',
        state: 'Maharashtra',
        creditLimit: 0,
        creditDays: 0,
        openingBalance: 0,
        currentBalance: 0,
        active: true
      }
    ];

    this.suppliers = [
      {
        id: 's1',
        code: 'SUP-001',
        name: 'Dell International Services India Pvt Ltd',
        companyName: 'Dell Technologies',
        gstin: '27AAACD9900E1Z1',
        pan: 'AAACD9990E',
        email: 'orders@dellpartner.co.in',
        phone: '+91 22 6789 1234',
        address: 'Dell India Logistics Park, Chakan MIDC, Pune',
        state: 'Maharashtra',
        bankDetails: 'HDFC Bank - A/c 00600350001928, IFSC: HDFC0000060',
        paymentTerms: '30 Days Net',
        openingBalance: 0,
        currentBalance: 184000,
        active: true
      },
      {
        id: 's2',
        code: 'SUP-002',
        name: 'Logitech India Distribution Network',
        companyName: 'Logitech Electronics',
        gstin: '27AAACL8811F1Z3',
        pan: 'AAACL8811F',
        email: 'distributors@logitech.in',
        phone: '+91 22 2490 8877',
        address: 'Worli Trade Center, Annie Besant Road, Mumbai',
        state: 'Maharashtra',
        bankDetails: 'ICICI Bank - A/c 000405001234, IFSC: ICIC0000004',
        paymentTerms: '15 Days Net',
        openingBalance: 0,
        currentBalance: 45000,
        active: true
      }
    ];

    this.salesInvoices = [
      {
        id: 'inv1',
        docType: 'SALES_INVOICE',
        invoiceNumber: 'INV-2026-001',
        invoiceDate: '2026-08-01',
        dueDate: '2026-08-31',
        branchId: 'b1',
        customerId: 'c1',
        customerName: 'Reliance Retail Ventures Ltd',
        customerGstin: '27AAACR5432B1Z8',
        customerAddress: 'Reliance Corporate Park, Navi Mumbai',
        placeOfSupply: 'Maharashtra',
        isInterState: false,
        salesperson: 'Suresh Patil',
        items: [
          {
            id: 'li1',
            productId: 'p1',
            productCode: 'PRD-001',
            productName: 'Dell XPS 15 High Performance Laptop',
            hsnSac: '84713010',
            unit: 'Pcs',
            batchNumber: 'BAT-2026-XPS01',
            quantity: 2,
            rate: 112000,
            discountPercent: 5,
            discountAmount: 11200,
            taxableAmount: 212800,
            gstRate: 18,
            cgstAmount: 19152,
            sgstAmount: 19152,
            igstAmount: 0,
            totalAmount: 251104
          }
        ],
        subTotal: 224000,
        totalDiscount: 11200,
        totalTaxable: 212800,
        totalCGST: 19152,
        totalSGST: 19152,
        totalIGST: 0,
        roundOff: -0.04,
        grandTotal: 251104,
        paidAmount: 72604,
        dueAmount: 178500,
        paymentMode: 'CREDIT',
        status: 'PARTIAL',
        eWayBillNo: '281049281044',
        eInvoiceIrn: '4c7a10ef2a91b490812b123491823901239012389',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=IRN:4c7a10ef2a91b490812b123491823901239012389',
        createdAt: '2026-08-01T11:30:00Z'
      },
      {
        id: 'inv2',
        docType: 'SALES_INVOICE',
        invoiceNumber: 'INV-2026-002',
        invoiceDate: '2026-08-10',
        dueDate: '2026-09-09',
        branchId: 'b1',
        customerId: 'c3',
        customerName: 'Infosys Tech Bangalore (Interstate)',
        customerGstin: '29AAACI9988D1Z2',
        customerAddress: 'Electronics City, Bengaluru, Karnataka',
        placeOfSupply: 'Karnataka',
        isInterState: true,
        salesperson: 'Suresh Patil',
        items: [
          {
            id: 'li2',
            productId: 'p2',
            productCode: 'PRD-002',
            productName: 'LG 27-inch 4K UHD IPS Color Calibration Monitor',
            hsnSac: '85285200',
            unit: 'Pcs',
            quantity: 2,
            rate: 31500,
            discountPercent: 0,
            discountAmount: 0,
            taxableAmount: 63000,
            gstRate: 18,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 11340,
            totalAmount: 74340
          }
        ],
        subTotal: 63000,
        totalDiscount: 0,
        totalTaxable: 63000,
        totalCGST: 0,
        totalSGST: 0,
        totalIGST: 11340,
        roundOff: 0,
        grandTotal: 74340,
        paidAmount: 0,
        dueAmount: 74340,
        paymentMode: 'CREDIT',
        status: 'PENDING',
        createdAt: '2026-08-10T14:15:00Z'
      }
    ];

    this.purchaseBills = [
      {
        id: 'pb1',
        billNumber: 'PUR-2026-001',
        supplierInvoiceNo: 'DELL-INV-88912',
        billDate: '2026-07-28',
        dueDate: '2026-08-27',
        branchId: 'b1',
        supplierId: 's1',
        supplierName: 'Dell International Services India Pvt Ltd',
        supplierGstin: '27AAACD9900E1Z1',
        items: [
          {
            id: 'pli1',
            productId: 'p1',
            productCode: 'PRD-001',
            productName: 'Dell XPS 15 Laptop',
            hsnSac: '84713010',
            unit: 'Pcs',
            quantity: 2,
            rate: 92000,
            discountPercent: 0,
            discountAmount: 0,
            taxableAmount: 184000,
            gstRate: 18,
            cgstAmount: 16560,
            sgstAmount: 16560,
            igstAmount: 0,
            totalAmount: 217120
          }
        ],
        subTotal: 184000,
        totalDiscount: 0,
        totalTaxable: 184000,
        totalCGST: 16560,
        totalSGST: 16560,
        totalIGST: 0,
        freightCharges: 1500,
        grandTotal: 218620,
        status: 'POSTED',
        requiresOwnerOtp: true,
        otpVerifiedAt: '2026-07-28T10:05:00Z',
        approvedBy: 'Rajesh Sharma (Owner)',
        postedAt: '2026-07-28T10:05:05Z',
        createdAt: '2026-07-28T10:00:00Z'
      }
    ];

    this.stockTransfers = [
      {
        id: 'st1',
        transferNo: 'TRF-2026-001',
        date: '2026-08-05',
        fromGodownId: 'g1',
        fromGodownName: 'Main Warehouse Godown A',
        toGodownId: 'g2',
        toGodownName: 'Showroom Stock Depot B',
        productId: 'p3',
        productName: 'Logitech MX Keys Advanced Wireless Keyboard',
        quantity: 10,
        unit: 'Pcs',
        transferredBy: 'Vikram Mehta'
      }
    ];

    this.ledgerAccounts = [
      { id: 'la1', code: '1001', name: 'Cash Account (Counter)', group: 'ASSET', balance: 145000, debitCredit: 'Dr' },
      { id: 'la2', code: '1002', name: 'HDFC Bank Operating A/c', group: 'ASSET', balance: 1890000, debitCredit: 'Dr' },
      { id: 'la3', code: '1100', name: 'Trade Receivables (Sundry Debtors)', group: 'ASSET', balance: 608000, debitCredit: 'Dr' },
      { id: 'la4', code: '1200', name: 'Closing Merchandise Inventory', group: 'ASSET', balance: 2840000, debitCredit: 'Dr' },
      { id: 'la5', code: '2001', name: 'Trade Payables (Sundry Creditors)', group: 'LIABILITY', balance: 229000, debitCredit: 'Cr' },
      { id: 'la6', code: '2101', name: 'CGST Output Payable', group: 'LIABILITY', balance: 19152, debitCredit: 'Cr' },
      { id: 'la7', code: '2102', name: 'SGST Output Payable', group: 'LIABILITY', balance: 19152, debitCredit: 'Cr' },
      { id: 'la8', code: '2103', name: 'IGST Output Payable', group: 'LIABILITY', balance: 11340, debitCredit: 'Cr' },
      { id: 'la9', code: '2104', name: 'CGST Input Tax Credit (ITC)', group: 'ASSET', balance: 16560, debitCredit: 'Dr' },
      { id: 'la10', code: '2105', name: 'SGST Input Tax Credit (ITC)', group: 'ASSET', balance: 16560, debitCredit: 'Dr' },
      { id: 'la11', code: '3001', name: 'Sales Account (Domestic)', group: 'INCOME', balance: 314100, debitCredit: 'Cr' },
      { id: 'la12', code: '4001', name: 'Purchase Account', group: 'EXPENSE', balance: 184000, debitCredit: 'Dr' },
      { id: 'la13', code: '4101', name: 'Office Rent Expense', group: 'EXPENSE', balance: 45000, debitCredit: 'Dr' },
      { id: 'la14', code: '4102', name: 'Staff Salary & Wages', group: 'EXPENSE', balance: 85000, debitCredit: 'Dr' }
    ];

    this.ledgerVouchers = [
      { id: 'v1', voucherNo: 'VCH-SALES-001', date: '2026-08-01', voucherType: 'SALES', debitAccount: 'Trade Receivables', creditAccount: 'Sales Account', amount: 212800, narration: 'Invoice INV-2026-001 raised for Reliance Retail', referenceNo: 'INV-2026-001' },
      { id: 'v2', voucherNo: 'VCH-PUR-001', date: '2026-07-28', voucherType: 'PURCHASE', debitAccount: 'Purchase Account', creditAccount: 'Trade Payables', amount: 184000, narration: 'Bill PUR-2026-001 from Dell International', referenceNo: 'PUR-2026-001' }
    ];

    this.auditLogs = [
      { id: 'al1', timestamp: '2026-08-01T11:30:00Z', userRole: 'SALES', userName: 'Suresh Patil', action: 'CREATE_SALES_INVOICE', module: 'Sales', details: 'Generated Sales Invoice INV-2026-001 for Reliance Retail ₹2,51,104', ipAddress: '192.168.1.45' },
      { id: 'al2', timestamp: '2026-07-28T10:05:00Z', userRole: 'OWNER', userName: 'Rajesh Sharma', action: 'APPROVE_PURCHASE_OTP', module: 'Purchase', details: 'Verified Owner OTP for Purchase PUR-2026-001 (₹2,18,620)', ipAddress: '192.168.1.10' }
    ];
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
    return newTenant;
  }

  toggleTenantStatus(tenantId: string): Tenant | null {
    const tenant = this.tenants.find(t => t.id === tenantId);
    if (tenant) {
      tenant.active = !tenant.active;
      this.logAudit('SUPER_ADMIN', 'Super Admin', 'TOGGLE_TENANT_STATUS', 'SaaS Admin', `Set Client ${tenant.companyName} status to ${tenant.active ? 'ACTIVE' : 'DEACTIVATED'}`);
      return tenant;
    }
    return null;
  }

  updateTenantFeatures(tenantId: string, features: Partial<TenantFeatureToggles>): Tenant | null {
    const tenant = this.tenants.find(t => t.id === tenantId);
    if (tenant) {
      tenant.features = { ...tenant.features, ...features };
      this.logAudit('SUPER_ADMIN', 'Super Admin', 'UPDATE_TENANT_FEATURES', 'SaaS Admin', `Updated feature matrix for ${tenant.companyName}`);
      return tenant;
    }
    return null;
  }

  // --- Auth Login Handler ---
  login(email: string, pass: string) {
    // 1. Check Super Admin credentials
    if (email.toLowerCase() === 'superadmin@apexerp.com' && pass === 'admin123') {
      this.logAudit('SUPER_ADMIN', 'Super Admin', 'LOGIN_SUCCESS', 'Auth', 'Super Admin logged into SaaS management portal');
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

    // 2. Check Client Tenant credentials
    const tenant = this.tenants.find(t => t.email.toLowerCase() === email.toLowerCase());
    if (tenant) {
      if (tenant.password !== pass) {
        return { success: false, message: 'Invalid password' };
      }

      if (!tenant.active) {
        return { success: false, message: 'Your client account is DEACTIVATED by Super Admin! Please contact support.' };
      }

      this.logAudit('OWNER', tenant.companyName, 'LOGIN_SUCCESS', 'Auth', `Client logged into ERP system (${tenant.email})`);
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

    const stockValue = this.products.reduce((acc, p) => acc + (p.currentStock * p.rates.purchaseCostRate), 0);
    const lowStockCount = this.products.filter(p => p.currentStock <= p.minReorderLevel).length;

    const pendingQuotationsCount = this.salesInvoices.filter(i => i.docType === 'QUOTATION' && i.status === 'PENDING').length;
    const pendingOrdersCount = this.salesInvoices.filter(i => i.docType === 'SALES_ORDER' && i.status === 'PENDING').length;

    const grossProfit = totalSales * 0.22;
    const netProfit = grossProfit - 130000;

    const gstPayable = this.salesInvoices.reduce((acc, i) => acc + i.totalCGST + i.totalSGST + i.totalIGST, 0);
    const gstReceivable = this.purchaseBills.filter(b => b.status === 'POSTED').reduce((acc, b) => acc + b.totalCGST + b.totalSGST + b.totalIGST, 0);

    return {
      totalSales,
      todaysSales,
      monthlySales: totalSales * 0.85,
      totalPurchases,
      receivables,
      payables,
      cashBankBalance: 2035000,
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
      customerId: invoiceData.customerId || 'c1',
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
      supplierId: billData.supplierId || 's1',
      supplierName: billData.supplierName || 'Supplier',
      supplierGstin: billData.supplierGstin || '27AAACD9900E1Z1',
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
  }
}

export const dbStore = new ERPDataStore();
