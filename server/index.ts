import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { dbStore } from './store.js';

dotenv.config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// Helper middleware to extract tenantId from request header
const getTenantId = (req: express.Request): string => {
  return (req.headers['x-tenant-id'] as string) || 't_main';
};

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

app.delete('/api/superadmin/tenants/:id', (req, res) => {
  const { id } = req.params;
  const deleted = dbStore.deleteTenant(id);
  if (!deleted) return res.status(404).json({ message: 'Tenant not found' });
  res.json({ success: true, message: 'Tenant deleted successfully' });
});

// --- 1. Dynamic Dashboard Metrics & Graph API (Tenant Isolated) ---
app.get('/api/dashboard', (req, res) => {
  const tid = getTenantId(req);
  const metrics = dbStore.getDashboardMetrics(tid);
  const tenantInvoices = dbStore.getSalesInvoicesForTenant(tid);
  const tenantPurchases = dbStore.getPurchaseBillsForTenant(tid);
  const tenantProducts = dbStore.getProductsForTenant(tid);
  const tenantAuditLogs = dbStore.getAuditLogsForTenant(tid);
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  
  const salesGraph = [0, 1, 2, 3, 4, 5].map(offset => {
    const idx = (currentMonthIdx - 5 + offset + 12) % 12;
    const monthName = monthNames[idx];
    
    const monthlyInvoices = tenantInvoices.filter(i => {
      const d = new Date(i.invoiceDate);
      return d.getMonth() === idx;
    });

    const monthlyPurchases = tenantPurchases.filter(b => {
      const d = new Date(b.billDate);
      return d.getMonth() === idx && b.status === 'POSTED';
    });

    const sales = monthlyInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const purchases = monthlyPurchases.reduce((sum, b) => sum + b.grandTotal, 0);
    const profit = Math.round(sales * 0.20);

    return { month: monthName, sales, profit, purchases };
  });

  const categoryMap: { [cat: string]: number } = {};
  tenantProducts.forEach(p => {
    categoryMap[p.category || 'General'] = (categoryMap[p.category || 'General'] || 0) + 1;
  });

  const categoryDistribution = Object.keys(categoryMap).length > 0 
    ? Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
    : [{ name: 'No Products Yet', value: 1 }];

  res.json({
    metrics,
    salesGraph,
    categoryDistribution,
    recentInvoices: tenantInvoices.slice(0, 5),
    recentAuditLogs: tenantAuditLogs.slice(0, 5),
    lowStockProducts: tenantProducts.filter(p => p.currentStock <= p.minReorderLevel)
  });
});

// --- 2. Company & Branch API (Per Tenant Isolated) ---
app.get('/api/company', (req, res) => {
  const tid = getTenantId(req);
  res.json(dbStore.getTenantCompany(tid));
});

app.post('/api/company', (req, res) => {
  const tid = getTenantId(req);
  const updatedCompany = dbStore.updateCompanyProfile(tid, req.body);
  res.json(updatedCompany);
});

app.get('/api/branches', (req, res) => {
  res.json(dbStore.branches);
});

// --- 3. Master Data API (Tenant Isolated) ---
app.get('/api/products', (req, res) => {
  const tid = getTenantId(req);
  const role = (req.query.role as string) || 'ADMIN';
  const tenantProducts = dbStore.getProductsForTenant(tid);

  const sanitizedProducts = tenantProducts.map(p => {
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
  const tid = getTenantId(req);
  const body = req.body;
  const tenantProducts = dbStore.getProductsForTenant(tid);

  const newProduct = {
    ...body,
    id: 'p_' + Date.now(),
    tenantId: tid,
    code: body.code || 'PRD-' + String(tenantProducts.length + 1).padStart(3, '0'),
    openingStock: Number(body.openingStock || 0),
    currentStock: Number(body.openingStock || 0),
    minReorderLevel: Number(body.minReorderLevel || 5),
    maxStockLevel: Number(body.maxStockLevel || 100)
  };

  dbStore.products.unshift(newProduct);
  dbStore.logAudit('ADMIN', 'Admin User', 'ADD_PRODUCT', 'Master Data', `Added Product ${newProduct.name} (${newProduct.code})`, tid);
  dbStore.saveToDisk();

  res.status(201).json(newProduct);
});

app.delete('/api/products/:id', (req, res) => {
  const tid = getTenantId(req);
  const deleted = dbStore.deleteProduct(req.params.id, tid);
  if (!deleted) return res.status(404).json({ message: 'Product not found' });
  res.json({ success: true, message: 'Product deleted successfully' });
});

app.get('/api/customers', (req, res) => {
  const tid = getTenantId(req);
  res.json(dbStore.getCustomersForTenant(tid));
});

app.post('/api/customers', (req, res) => {
  const tid = getTenantId(req);
  const body = req.body;
  const tenantCusts = dbStore.getCustomersForTenant(tid);

  const newCust = {
    ...body,
    id: 'c_' + Date.now(),
    tenantId: tid,
    code: 'CUST-' + String(tenantCusts.length + 1).padStart(3, '0'),
    openingBalance: Number(body.openingBalance || 0),
    currentBalance: Number(body.openingBalance || 0),
    active: true
  };

  dbStore.customers.unshift(newCust);
  dbStore.logAudit('ADMIN', 'Admin User', 'ADD_CUSTOMER', 'Master Data', `Added Customer ${newCust.name} (${newCust.code})`, tid);
  dbStore.saveToDisk();

  res.status(201).json(newCust);
});

app.delete('/api/customers/:id', (req, res) => {
  const tid = getTenantId(req);
  const deleted = dbStore.deleteCustomer(req.params.id, tid);
  if (!deleted) return res.status(404).json({ message: 'Customer not found' });
  res.json({ success: true, message: 'Customer deleted successfully' });
});

app.get('/api/suppliers', (req, res) => {
  const tid = getTenantId(req);
  res.json(dbStore.getSuppliersForTenant(tid));
});

app.post('/api/suppliers', (req, res) => {
  const tid = getTenantId(req);
  const body = req.body;
  const tenantSupps = dbStore.getSuppliersForTenant(tid);

  const newSupp = {
    ...body,
    id: 's_' + Date.now(),
    tenantId: tid,
    code: 'SUP-' + String(tenantSupps.length + 1).padStart(3, '0'),
    openingBalance: Number(body.openingBalance || 0),
    currentBalance: Number(body.openingBalance || 0),
    active: true
  };

  dbStore.suppliers.unshift(newSupp);
  dbStore.logAudit('ADMIN', 'Admin User', 'ADD_SUPPLIER', 'Master Data', `Added Supplier ${newSupp.name} (${newSupp.code})`, tid);
  dbStore.saveToDisk();

  res.status(201).json(newSupp);
});

app.delete('/api/suppliers/:id', (req, res) => {
  const tid = getTenantId(req);
  const deleted = dbStore.deleteSupplier(req.params.id, tid);
  if (!deleted) return res.status(404).json({ message: 'Supplier not found' });
  res.json({ success: true, message: 'Supplier deleted successfully' });
});

// --- 4. Sales Workflow & POS API (Tenant Isolated) ---
app.get('/api/sales', (req, res) => {
  const tid = getTenantId(req);
  const docType = req.query.docType as string;
  res.json(dbStore.getSalesInvoicesForTenant(tid, docType));
});

app.post('/api/sales', (req, res) => {
  const tid = getTenantId(req);
  const userName = (req.headers['x-user-name'] as string) || 'Salesperson';
  const invoice = dbStore.createSalesInvoice(req.body, userName, tid);
  res.status(201).json(invoice);
});

app.delete('/api/sales/:id', (req, res) => {
  const tid = getTenantId(req);
  const deleted = dbStore.deleteSalesInvoice(req.params.id, tid);
  if (!deleted) return res.status(404).json({ message: 'Sales invoice not found' });
  res.json({ success: true, message: 'Invoice deleted and inventory restored' });
});

app.post('/api/sales/convert/:id', (req, res) => {
  const tid = getTenantId(req);
  const { id } = req.params;
  const { targetDocType } = req.body;
  const original = dbStore.salesInvoices.find(i => i.id === id && (i.tenantId || 't_main') === tid);

  if (!original) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const converted = dbStore.createSalesInvoice({
    ...original,
    docType: targetDocType || 'SALES_INVOICE',
    refQuotationNo: original.docType === 'QUOTATION' ? original.invoiceNumber : undefined,
    refOrderNo: original.docType === 'SALES_ORDER' ? original.invoiceNumber : undefined,
    invoiceNumber: `INV-2026-${String(dbStore.getSalesInvoicesForTenant(tid).length + 1).padStart(3, '0')}`,
    invoiceDate: new Date().toISOString().split('T')[0]
  }, 'Converted Flow', tid);

  original.status = 'ACCEPTED';
  dbStore.saveToDisk();
  res.json({ original, converted });
});

// --- 5. Purchase & Owner OTP Approval API (Tenant Isolated) ---
app.get('/api/purchases', (req, res) => {
  const tid = getTenantId(req);
  res.json(dbStore.getPurchaseBillsForTenant(tid));
});

app.post('/api/purchases', (req, res) => {
  const tid = getTenantId(req);
  const userName = (req.headers['x-user-name'] as string) || 'Purchase Agent';
  const bill = dbStore.createPurchaseBill(req.body, userName, tid);
  res.status(201).json(bill);
});

app.delete('/api/purchases/:id', (req, res) => {
  const tid = getTenantId(req);
  const deleted = dbStore.deletePurchaseBill(req.params.id, tid);
  if (!deleted) return res.status(404).json({ message: 'Purchase bill not found' });
  res.json({ success: true, message: 'Purchase bill deleted and inventory adjusted' });
});

app.post('/api/purchases/verify-otp', (req, res) => {
  const tid = getTenantId(req);
  const { billId, otp } = req.body;
  const userName = (req.headers['x-user-name'] as string) || 'Owner';
  const result = dbStore.verifyOwnerOtpAndPost(billId, otp, userName, tid);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// --- 6. Inventory & Godown Transfers API (Tenant Isolated) ---
app.get('/api/godowns', (req, res) => {
  const tid = getTenantId(req);
  res.json(dbStore.getGodownsForTenant(tid));
});

app.get('/api/inventory/transfers', (req, res) => {
  const tid = getTenantId(req);
  res.json(dbStore.getStockTransfersForTenant(tid));
});

app.post('/api/inventory/transfers', (req, res) => {
  const tid = getTenantId(req);
  const { fromGodownId, toGodownId, productId, quantity } = req.body;
  const tenantGodowns = dbStore.getGodownsForTenant(tid);
  const tenantProducts = dbStore.getProductsForTenant(tid);

  const fromG = tenantGodowns.find(g => g.id === fromGodownId);
  const toG = tenantGodowns.find(g => g.id === toGodownId);
  const prod = tenantProducts.find(p => p.id === productId);

  if (!fromG || !toG || !prod) {
    return res.status(400).json({ message: 'Invalid Godown or Product ID' });
  }

  const transfer: any = {
    id: 'st_' + Date.now(),
    tenantId: tid,
    transferNo: 'TRF-2026-' + String(dbStore.getStockTransfersForTenant(tid).length + 1).padStart(3, '0'),
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
  dbStore.logAudit('INVENTORY', 'Inventory Manager', 'STOCK_TRANSFER', 'Inventory', `Transferred ${quantity} ${prod.unit} of ${prod.name} from ${fromG.name} to ${toG.name}`, tid);
  dbStore.saveToDisk();

  res.status(201).json(transfer);
});

// --- 7. Accounting & Ledgers API (Tenant Isolated) ---
app.get('/api/accounts/vouchers', (req, res) => {
  const tid = getTenantId(req);
  res.json(dbStore.getLedgerVouchersForTenant(tid));
});

app.get('/api/accounts/ledgers', (req, res) => {
  const tid = getTenantId(req);
  res.json(dbStore.getLedgerAccountsForTenant(tid));
});

// --- 8. GST & Statutory Reports API (Tenant Isolated) ---
app.get('/api/gst/reports', (req, res) => {
  const tid = getTenantId(req);
  const tenantInvoices = dbStore.getSalesInvoicesForTenant(tid);
  const tenantPurchases = dbStore.getPurchaseBillsForTenant(tid);
  const tenantProducts = dbStore.getProductsForTenant(tid);

  const gstr1 = {
    b2bInvoices: tenantInvoices.filter(i => i.customerGstin !== 'UNREGISTERED'),
    b2cInvoices: tenantInvoices.filter(i => i.customerGstin === 'UNREGISTERED'),
    hsnSummary: tenantProducts.map(p => ({
      hsnSac: p.hsnSac,
      description: p.name,
      totalQty: p.openingStock - p.currentStock,
      totalTaxable: (p.openingStock - p.currentStock) * (p.rates?.retailRate || 0),
      gstRate: p.gstRate
    }))
  };

  const gstr3b = {
    outwardTaxable: tenantInvoices.reduce((acc, i) => acc + i.totalTaxable, 0),
    cgstOutput: tenantInvoices.reduce((acc, i) => acc + i.totalCGST, 0),
    sgstOutput: tenantInvoices.reduce((acc, i) => acc + i.totalSGST, 0),
    igstOutput: tenantInvoices.reduce((acc, i) => acc + i.totalIGST, 0),
    itcAvailableCgst: tenantPurchases.filter(b => b.status === 'POSTED').reduce((acc, b) => acc + b.totalCGST, 0),
    itcAvailableSgst: tenantPurchases.filter(b => b.status === 'POSTED').reduce((acc, b) => acc + b.totalSGST, 0),
  };

  res.json({ gstr1, gstr3b });
});

// --- 9. Audit Logs & System Activity API (Tenant Isolated) ---
app.get('/api/audit-logs', (req, res) => {
  const tid = getTenantId(req);
  res.json(dbStore.getAuditLogsForTenant(tid));
});

// --- 10. BI Analytics & AI Forecast API (Tenant Isolated) ---
app.get('/api/analytics', (req, res) => {
  const tid = getTenantId(req);
  const tenantProducts = dbStore.getProductsForTenant(tid);
  const tenantCustomers = dbStore.getCustomersForTenant(tid);

  res.json({
    aiInsights: tenantProducts.length === 0 ? [
      { type: 'INFO', title: 'System Ready for Data Input', description: 'Add your products in Product Master to generate automated profit margin & stock reorder warnings.' }
    ] : [
      { type: 'PROFIT', title: 'Margin Analysis Active', description: `${tenantProducts[0].name} configured with ₹${tenantProducts[0].rates.retailRate} retail price.` }
    ],
    topCustomers: tenantCustomers.slice(0, 3),
    fastMovingProducts: tenantProducts.filter(p => p.currentStock < p.openingStock)
  });
});

// --- Production Static Frontend Asset Serving ---
const DIST_PATH = path.resolve(process.cwd(), 'dist');
app.use(express.static(DIST_PATH));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  }
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
