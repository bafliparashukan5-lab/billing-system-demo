export type UserRole = 
  | 'ADMIN' 
  | 'OWNER' 
  | 'MANAGER' 
  | 'ACCOUNTANT' 
  | 'SALES' 
  | 'PURCHASE' 
  | 'INVENTORY' 
  | 'CASHIER' 
  | 'AUDITOR';

export type UserType = 'SUPER_ADMIN' | 'CLIENT_USER';

export interface TenantFeatureToggles {
  posBilling: boolean;
  salesWorkflow: boolean;
  purchaseOtp: boolean;
  productRates: boolean;
  inventoryGodown: boolean;
  accountsLedger: boolean;
  gstStatutory: boolean;
  outstandingAgeing: boolean;
  analyticsAi: boolean;
}

export interface Tenant {
  id: string;
  code: string;
  companyName: string;
  email: string;
  password: string;
  phone: string;
  gstin: string;
  active: boolean;
  createdAt: string;
  features: TenantFeatureToggles;
}

export interface AuthSession {
  token: string;
  userType: UserType;
  tenantId?: string;
  email: string;
  name: string;
  role?: UserRole;
  tenant?: Tenant;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  avatar?: string;
}

export interface Branch {
  id: string;
  tenantId?: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  gstin: string;
  isMain: boolean;
}

export interface Company {
  tenantId?: string;
  name: string;
  logo: string;
  tagline: string;
  address: string;
  cityState: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  cin: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchName: string;
  upiId: string;
  currencySymbol: string;
  termsAndConditions: string[];
}

export interface ProductRates {
  purchaseCostRate: number;
  mrp: number;
  retailRate: number;
  wholesaleRate: number;
  dealerRate: number;
  minSellingRate: number;
}

export interface Product {
  id: string;
  tenantId?: string;
  code: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  hsnSac: string;
  unit: string;
  gstRate: number;
  rates: ProductRates;
  openingStock: number;
  currentStock: number;
  minReorderLevel: number;
  maxStockLevel: number;
  rackLocation: string;
  hasBatchTracking: boolean;
  hasSerialTracking: boolean;
}

export interface Customer {
  id: string;
  tenantId?: string;
  code: string;
  name: string;
  companyName?: string;
  gstin: string;
  pan?: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  state: string;
  creditLimit: number;
  creditDays: number;
  openingBalance: number;
  currentBalance: number;
  active: boolean;
}

export interface Supplier {
  id: string;
  tenantId?: string;
  code: string;
  name: string;
  companyName: string;
  gstin: string;
  pan?: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  bankDetails: string;
  paymentTerms: string;
  openingBalance: number;
  currentBalance: number;
  active: boolean;
}

export interface LineItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  hsnSac: string;
  unit: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export type SalesDocType = 'QUOTATION' | 'PROFORMA' | 'SALES_ORDER' | 'DELIVERY_CHALLAN' | 'SALES_INVOICE' | 'POS_RECEIPT';
export type SalesStatus = 'DRAFT' | 'PENDING' | 'ACCEPTED' | 'DISPATCHED' | 'PAID' | 'PARTIAL' | 'CANCELLED';

export interface SalesInvoice {
  id: string;
  tenantId?: string;
  docType: SalesDocType;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  branchId: string;
  customerId: string;
  customerName: string;
  customerGstin: string;
  customerAddress: string;
  placeOfSupply: string;
  isInterState: boolean;
  salesperson: string;
  refQuotationNo?: string;
  refOrderNo?: string;
  items: LineItem[];
  subTotal: number;
  totalDiscount: number;
  totalTaxable: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: 'CASH' | 'UPI' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CREDIT' | 'SPLIT';
  status: SalesStatus;
  notes?: string;
  eWayBillNo?: string;
  eInvoiceIrn?: string;
  qrCodeUrl?: string;
  createdAt: string;
}

export type PurchaseStatus = 'DRAFT' | 'PENDING_OWNER_OTP' | 'APPROVED' | 'POSTED' | 'REJECTED';

export interface PurchaseBill {
  id: string;
  tenantId?: string;
  billNumber: string;
  supplierInvoiceNo: string;
  billDate: string;
  dueDate: string;
  branchId: string;
  supplierId: string;
  supplierName: string;
  supplierGstin: string;
  items: LineItem[];
  subTotal: number;
  totalDiscount: number;
  totalTaxable: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  freightCharges: number;
  grandTotal: number;
  status: PurchaseStatus;
  requiresOwnerOtp: boolean;
  otpVerifiedAt?: string;
  approvedBy?: string;
  postedAt?: string;
  createdAt: string;
}

export interface Godown {
  id: string;
  tenantId?: string;
  code: string;
  name: string;
  location: string;
  capacity: string;
}

export interface StockTransfer {
  id: string;
  tenantId?: string;
  transferNo: string;
  date: string;
  fromGodownId: string;
  fromGodownName: string;
  toGodownId: string;
  toGodownName: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  batchNumber?: string;
  transferredBy: string;
}

export interface BatchItem {
  id: string;
  tenantId?: string;
  productId: string;
  productName: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
  costRate: number;
  godownId: string;
}

export interface LedgerAccount {
  id: string;
  tenantId?: string;
  code: string;
  name: string;
  group: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  balance: number;
  debitCredit: 'Dr' | 'Cr';
}

export interface LedgerVoucher {
  id: string;
  tenantId?: string;
  voucherNo: string;
  date: string;
  voucherType: 'SALES' | 'PURCHASE' | 'RECEIPT' | 'PAYMENT' | 'CONTRA' | 'JOURNAL';
  debitAccount: string;
  creditAccount: string;
  amount: number;
  narration: string;
  referenceNo?: string;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  timestamp: string;
  userRole: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

export interface DashboardMetrics {
  totalSales: number;
  todaysSales: number;
  monthlySales: number;
  totalPurchases: number;
  receivables: number;
  payables: number;
  cashBankBalance: number;
  currentStockValue: number;
  lowStockItemsCount: number;
  pendingQuotationsCount: number;
  pendingOrdersCount: number;
  grossProfit: number;
  netProfit: number;
  gstPayable: number;
  gstReceivable: number;
}
