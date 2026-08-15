import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { 
  ShoppingCart, ShoppingBag, DollarSign, Warehouse, 
  ArrowUpRight, AlertTriangle, RefreshCw, Eye 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export const DashboardPage: React.FC<{
  onOpenPos: () => void;
  onOpenInvoice: () => void;
  onOpenPurchase: () => void;
}> = ({ onOpenPos, onOpenInvoice, onOpenPurchase }) => {
  const { metrics, salesInvoices, products, setActivePdfInvoice, refreshData } = useERP();
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setDashboardData(data))
      .catch(err => console.error(err));
  }, []);

  if (!metrics) {
    return (
      <div className="p-8 text-center text-slate-400 animate-pulse">
        Loading ERP Executive Dashboard...
      </div>
    );
  }

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 p-6 rounded-2xl border border-brand-500/20 shadow-xl">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <span>Executive Business Overview</span>
            <span className="bg-brand-500/20 text-brand-400 text-xs px-2 py-0.5 rounded-full border border-brand-500/30">Live ERP Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time synchronized sales, stock, tax & ledger metrics across all branches.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={refreshData}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-700 font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Stats</span>
          </button>
          <button 
            onClick={onOpenPos}
            className="flex items-center space-x-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs px-4 py-2 rounded-xl font-bold shadow-lg shadow-pink-600/30 transition"
          >
            <span>POS Billing Counter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">₹{metrics.totalSales.toLocaleString('en-IN')}</h2>
            <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+18.4% vs last month</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Purchase</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">₹{metrics.totalPurchases.toLocaleString('en-IN')}</h2>
            <p className="text-xs text-slate-400 mt-1">Approved & Posted Bills</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Receivables / Payables</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Debtors:</span>
              <span className="font-bold text-emerald-400">₹{metrics.receivables.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-slate-400">Creditors:</span>
              <span className="font-bold text-rose-400">₹{metrics.payables.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Stock Value</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Warehouse className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">₹{metrics.currentStockValue.toLocaleString('en-IN')}</h2>
            <div className="flex justify-between items-center text-[11px] mt-1">
              <span className="text-slate-400">Low Stock Alert:</span>
              <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold">{metrics.lowStockItemsCount} Items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Revenue & Profit Performance Graph</h3>
              <p className="text-xs text-slate-400">Monthly breakdown of gross sales vs cost & profits</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">Gross Margin: 22%</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData?.salesGraph || []}>
                <defs>
                  <linearGradient id="salesG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="profitG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" fillOpacity={1} fill="url(#salesG)" name="Gross Sales (₹)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#profitG)" name="Net Profit (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Stock Valuation by Category</h3>
            <p className="text-xs text-slate-400">Inventory share percentage</p>
          </div>

          <div className="h-48 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={dashboardData?.categoryDistribution || []} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={65} 
                  innerRadius={35}
                >
                  {(dashboardData?.categoryDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200">Recent Sales Transactions</h3>
            <button onClick={onOpenInvoice} className="text-xs text-brand-400 hover:underline font-semibold">Create Invoice</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {salesInvoices.slice(0, 5).map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-brand-400">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">{inv.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-400">{inv.invoiceDate}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-100">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                        inv.status === 'PARTIAL' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button 
                        onClick={() => setActivePdfInvoice(inv)}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Print / View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Low Stock Reorder Alerts</span>
          </div>

          <div className="space-y-3">
            {products.filter(p => p.currentStock <= p.minReorderLevel).map(p => (
              <div key={p.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-200 block">{p.name}</span>
                  <span className="text-[10px] text-slate-500">Min Reorder: {p.minReorderLevel} | Rack: {p.rackLocation}</span>
                </div>
                <div className="text-right">
                  <span className="text-rose-400 font-extrabold block text-sm">{p.currentStock} {p.unit}</span>
                  <button onClick={onOpenPurchase} className="text-[10px] text-brand-400 underline font-semibold">Reorder</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
