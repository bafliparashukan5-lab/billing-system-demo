# ApexERP - Complete Billing, Inventory & ERP System (Client Demo Edition)

ApexERP is a client-ready, fully interconnected Billing, Sales, Purchase, Inventory, Accounting, GST & Security ERP application built for modern business management.

## 📁 Project Structure

```
billing-system-demo/
├── client/              # React 18 + Tailwind CSS + Lucide + Recharts Frontend
├── server/              # Express API Server & Business Logic
├── shared/              # Shared TypeScript interfaces & types
├── .gitignore           # Git ignore configuration
├── package.json         # Scripts to run client & server
└── vite.config.ts       # Vite bundler configuration
```

---

## ⚡ How to Run the Application

### Option 1: Run Both Client & Server Concurrently (Recommended)
Run the following single command from the project root directory:

```bash
npm run dev
```

This will automatically launch:
- **Express API Server** on `http://localhost:5000`
- **Vite React Client** on `http://localhost:3000`

---

### Option 2: Run Client and Server Separately

1. **Terminal 1: Start the Backend Express API Server**
   ```bash
   npm run server
   ```

2. **Terminal 2: Start the Frontend React Client**
   ```bash
   npm run client
   ```

3. Open your browser and navigate to:
   **`http://localhost:3000`**

---

## 🔐 Key Features & Demo Controls

1. **Owner Approval OTP Code**: `889900`
   - *Test Rule 12*: Create a Purchase Bill above ₹1,00,000 to trigger the Owner OTP verification modal.
2. **Role-Based Access Control Switcher**:
   - Use the top-right header dropdown to toggle between **Owner**, **Admin**, **Accountant**, **Salesperson** (cost rates automatically hidden), and **POS Cashier**.
3. **POS Counter Billing**:
   - Navigate to **POS Counter Billing** to scan barcodes, add instant discounts, select payment mode (Cash/UPI/Card), and print thermal receipts.
4. **Printable GST Invoices**:
   - View any sales invoice to switch between **A4 GST Tax Invoice** and **80mm Thermal POS Receipt** with instant print & WhatsApp sharing preview.
5. **Global Instant Search**:
   - Press `Cmd + K` (Mac) or `Ctrl + K` (Windows) anytime to search products, customers, and invoices.
