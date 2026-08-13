import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbStore } from './store.js';

dotenv.config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// --- Authentication API ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const result = dbStore.login(email, password);
  if (!result.success) {
    return res.status(401).json(result);
  }

  res.json(result);
});

// --- Super Admin SaaS Tenant Management API ---
app.get('/api/superadmin/tenants', (req, res) => {
  res.json(dbStore.tenants);
});

app.post('/api/superadmin/tenants', (req, res) => {
  const tenant = dbStore.createTenant(req.body);
  res.status(201).json(tenant);
});

app.post('/api/superadmin/tenants/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const tenant = dbStore.toggleTenantStatus(id);
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  res.json(tenant);
});

app.post('/api/superadmin/tenants/:id/features', (req, res) => {
  const { id } = req.params;
  const tenant = dbStore.updateTenantFeatures(id, req.body);
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  res.json(tenant);
});

// --- 1. Dynamic Dashboard Metrics & Graph API ---
app.get('/api/dashboard', (req, res) => {
  const metrics = dbStore.getDashboardMetrics();
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  
  const salesGraph = [0, 1, 2, 3, 4, 5].map(offset => {
    const idx = (currentMonthIdx - 5 + offset + 12) % 12;
    const monthName = monthNames[idx];
    
    const monthlyInvoices = dbStore.salesInvoices.filter(i => {
      const d = new Date(i.invoiceDate);
      return d.getMonth() === idx;
    });

    const monthlyPurchases = dbStore.purchaseBills.filter(b => {
      const d = new Date(b.billDate);
      return d.getMonth() === idx && b.status === 'POSTED';
    });

    const sales = monthlyInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const purchases = monthlyPurchases.reduce((sum, b) => sum + b.grandTotal, 0);
    const profit = Math.round(sales * 0.20);

    return { month: monthName, sales, profit, purchases };
  });

  const categoryMap: { [cat: string]: number } = {};
  dbStore.products.forEach(p => {
    categoryMap[p.category || 'General'] = (categoryMap[p.category || 'General'] || 0) + 1;
  });

  const categoryDistribution = Object.keys(categoryMap).length > 0 
    ? Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
    : [{ name: 'No Products Yet', value: 1 }];

  res.json({
    metrics,
    salesGraph,
    categoryDistribution,
    recentInvoices: dbStore.salesInvoices.slice(0, 5),
    recentAuditLogs: dbStore.auditLogs.slice(0, 5),
    lowStockProducts: dbStore.products.filter(p => p.currentStock <= p.minReorderLevel)
  });
});

// --- 2. Company & Branch API (With Disk Persistence) ---
app.get('/api/company', (req, res) => {
  res.json(dbStore.company);
});

app.post('/api/company', (req, res) => {
  const updatedCompany = dbStore.updateCompanyProfile(req.body);
  res.json(updatedCompany);
});

app.get('/api/branches', (req, res) => {
  res.json(dbStore.branches);
});

// --- 3. Master Data API ---
app.get('/api/products', (req, res) => {
  const role = (req.query.role as string) || 'ADMIN';
  
  const sanitizedProducts = dbStore.products.map(p => {
    if (role === 'SALES' || role === 'CASHIER') {
      return {
        ...p,
        rates: {
          ...p.rates,
          purchaseCostRate: 0
        }
      };
    }
    return p;
  });

  res.json(sanitizedProducts);
});

app.post('/api/products', (req, res) => {
  const body = req.body;
  const newProduct = {
    ...body,
    id: 'p_' + Date.now(),
    code: body.code || 'PRD-' + (dbStore.products.length + 1),
    openingStock: Number(body.openingStock || 0),
    currentStock: Number(body.openingStock || 0),
    minReorderLevel: Number(body.minReorderLevel || 5),
    maxStockLevel: Number(body.maxStockLevel || 100)
  };
  dbStore.products.unshift(newProduct);
  dbStore.logAudit('ADMIN', 'Admin User', 'ADD_PRODUCT', 'Master Data', `Added Product ${newProduct.name} (${newProduct.code})`);
  res.status(201).json(newProduct);
});

app.get('/api/customers', (req, res) => {
  res.json(dbStore.customers);
});

app.post('/api/customers', (req, res) => {
  const body = req.body;
  const newCust = {
    ...body,
    id: 'c_' + Date.now(),
    code: 'CUST-' + String(dbStore.customers.length + 1).padStart(3, '0'),
    openingBalance: Number(body.openingBalance || 0),
    currentBalance: Number(body.openingBalance || 0),
    active: true
  };
  dbStore.customers.unshift(newCust);
  dbStore.logAudit('ADMIN', 'Admin User', 'ADD_CUSTOMER', 'Master Data', `Added Customer ${newCust.name} (${newCust.code})`);
  res.status(201).json(newCust);
});

app.get('/api/suppliers', (req, res) => {
  res.json(dbStore.suppliers);
});

app.post('/api/suppliers', (req, res) => {
  const body = req.body;
  const newSupp = {
    ...body,
    id: 's_' + Date.now(),
    code: 'SUP-' + String(dbStore.suppliers.length + 1).padStart(3, '0'),
    openingBalance: Number(body.openingBalance || 0),
    currentBalance: Number(body.openingBalance || 0),
    active: true
  };
  dbStore.suppliers.unshift(newSupp);
  dbStore.logAudit('ADMIN', 'Admin User', 'ADD_SUPPLIER', 'Master Data', `Added Supplier ${newSupp.name} (${newSupp.code})`);
  res.status(201).json(newSupp);
});

// --- 4. Sales Workflow & POS API ---
app.get('/api/sales', (req, res) => {
  const docType = req.query.docType as string;
  if (docType) {
    return res.json(dbStore.salesInvoices.filter(i => i.docType === docType));
  }
  res.json(dbStore.salesInvoices);
});

app.post('/api/sales', (req, res) => {
  const userName = (req.headers['x-user-name'] as string) || 'Salesperson';
  const invoice = dbStore.createSalesInvoice(req.body, userName);
  res.status(201).json(invoice);
});

app.post('/api/sales/convert/:id', (req, res) => {
  const { id } = req.params;
  const { targetDocType } = req.body;
  const original = dbStore.salesInvoices.find(i => i.id === id);

  if (!original) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const converted = dbStore.createSalesInvoice({
    ...original,
    docType: targetDocType || 'SALES_INVOICE',
    refQuotationNo: original.docType === 'QUOTATION' ? original.invoiceNumber : undefined,
    refOrderNo: original.docType === 'SALES_ORDER' ? original.invoiceNumber : undefined,
    invoiceNumber: `INV-2026-${String(dbStore.salesInvoices.length + 1).padStart(3, '0')}`,
    invoiceDate: new Date().toISOString().split('T')[0]
  }, 'Converted Flow');

  original.status = 'ACCEPTED';
  res.json({ original, converted });
});

// --- 5. Purchase & Owner OTP Approval API ---
app.get('/api/purchases', (req, res) => {
  res.json(dbStore.purchaseBills);
});

app.post('/api/purchases', (req, res) => {
  const userName = (req.headers['x-user-name'] as string) || 'Purchase Agent';
  const bill = dbStore.createPurchaseBill(req.body, userName);
  res.status(201).json(bill);
});

app.post('/api/purchases/verify-otp', (req, res) => {
  const { billId, otp } = req.body;
  const userName = (req.headers['x-user-name'] as string) || 'Owner';
  const result = dbStore.verifyOwnerOtpAndPost(billId, otp, userName);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// --- 6. Inventory & Godown Transfers API ---
app.get('/api/godowns', (req, res) => {
  res.json(dbStore.godowns);
});

app.get('/api/inventory/transfers', (req, res) => {
  res.json(dbStore.stockTransfers);
});

app.post('/api/inventory/transfers', (req, res) => {
  const { fromGodownId, toGodownId, productId, quantity } = req.body;
  const fromG = dbStore.godowns.find(g => g.id === fromGodownId);
  const toG = dbStore.godowns.find(g => g.id === toGodownId);
  const prod = dbStore.products.find(p => p.id === productId);

  if (!fromG || !toG || !prod) {
    return res.status(400).json({ message: 'Invalid Godown or Product ID' });
  }

  const transfer: any = {
    id: 'st_' + Date.now(),
    transferNo: 'TRF-2026-' + String(dbStore.stockTransfers.length + 1).padStart(3, '0'),
    date: new Date().toISOString().split('T')[0],
    fromGodownId,
    fromGodownName: fromG.name,
    toGodownId,
    toGodownName: toG.name,
    productId,
    productName: prod.name,
    quantity: Number(quantity),
    unit: prod.unit,
    transferredBy: 'Inventory Manager'
  };

  dbStore.stockTransfers.unshift(transfer);
  dbStore.logAudit('INVENTORY', 'Inventory Manager', 'STOCK_TRANSFER', 'Inventory', `Transferred ${quantity} ${prod.unit} of ${prod.name} from ${fromG.name} to ${toG.name}`);
  res.status(201).json(transfer);
});

// --- 7. Accounting & Ledgers API ---
app.get('/api/accounts/vouchers', (req, res) => {
  res.json(dbStore.ledgerVouchers);
});

app.get('/api/accounts/ledgers', (req, res) => {
  res.json(dbStore.ledgerAccounts);
});

// --- 8. GST & Statutory Reports API ---
app.get('/api/gst/reports', (req, res) => {
  const gstr1 = {
    b2bInvoices: dbStore.salesInvoices.filter(i => i.customerGstin !== 'UNREGISTERED'),
    b2cInvoices: dbStore.salesInvoices.filter(i => i.customerGstin === 'UNREGISTERED'),
    hsnSummary: dbStore.products.map(p => ({
      hsnSac: p.hsnSac,
      description: p.name,
      totalQty: p.openingStock - p.currentStock,
      totalTaxable: (p.openingStock - p.currentStock) * (p.rates?.retailRate || 0),
      gstRate: p.gstRate
    }))
  };

  const gstr3b = {
    outwardTaxable: dbStore.salesInvoices.reduce((acc, i) => acc + i.totalTaxable, 0),
    cgstOutput: dbStore.salesInvoices.reduce((acc, i) => acc + i.totalCGST, 0),
    sgstOutput: dbStore.salesInvoices.reduce((acc, i) => acc + i.totalSGST, 0),
    igstOutput: dbStore.salesInvoices.reduce((acc, i) => acc + i.totalIGST, 0),
    itcAvailableCgst: dbStore.purchaseBills.filter(b => b.status === 'POSTED').reduce((acc, b) => acc + b.totalCGST, 0),
    itcAvailableSgst: dbStore.purchaseBills.filter(b => b.status === 'POSTED').reduce((acc, b) => acc + b.totalSGST, 0),
  };

  res.json({ gstr1, gstr3b });
});

// --- 9. Audit Logs & System Activity API ---
app.get('/api/audit-logs', (req, res) => {
  res.json(dbStore.auditLogs);
});

// --- 10. BI Analytics & AI Forecast API ---
app.get('/api/analytics', (req, res) => {
  res.json({
    aiInsights: dbStore.products.length === 0 ? [
      { type: 'INFO', title: 'System Ready for Data Input', description: 'Add your products in Product Master to generate automated profit margin & stock reorder warnings.' }
    ] : [
      { type: 'PROFIT', title: 'Margin Analysis Active', description: `${dbStore.products[0].name} configured with ₹${dbStore.products[0].rates.retailRate} retail price.` }
    ],
    topCustomers: dbStore.customers.slice(0, 3),
    fastMovingProducts: dbStore.products.filter(p => p.currentStock < p.openingStock)
  });
});

// Graceful Port Fallback Handler
const startServer = (port: number) => {
  const server = app.listen(port, () => {
    console.log(`⚡ ApexERP Express API Server running on port ${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is occupied. Attempting port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
};

startServer(DEFAULT_PORT);
