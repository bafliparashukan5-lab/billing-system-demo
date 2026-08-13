import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Lock, Plus, Search } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { products, currentRole, addToast, refreshData } = useERP();
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [hsnSac, setHsnSac] = useState('84713010');
  const [unit, setUnit] = useState('Pcs');
  const [gstRate, setGstRate] = useState(18);
  const [openingStock, setOpeningStock] = useState(10);
  const [costRate, setCostRate] = useState(1000);
  const [mrp, setMrp] = useState(1500);
  const [retailRate, setRetailRate] = useState(1350);

  const handleAddProduct = async () => {
    if (!name) return;
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, category, subcategory: 'General', brand: 'Generic',
          hsnSac, unit, gstRate, openingStock,
          rates: {
            purchaseCostRate: costRate, mrp, retailRate, wholesaleRate: Math.round(retailRate * 0.9),
            dealerRate: Math.round(retailRate * 0.85), minSellingRate: Math.round(costRate * 1.05)
          },
          rackLocation: 'Rack A-01', hasBatchTracking: false, hasSerialTracking: false
        })
      });
      addToast('success', `Product ${name} added successfully!`);
      setShowAddModal(false);
      await refreshData();
    } catch (err) {
      addToast('error', 'Failed to add product');
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.code.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <span>Product Master & 5-Tier Rate Management</span>
            <span className="bg-brand-500/20 text-brand-400 text-xs px-2 py-0.5 rounded border border-brand-500/30">Section 5 Rate Protection</span>
          </h1>
          <p className="text-xs text-slate-400">
            {currentRole === 'SALES' || currentRole === 'CASHIER' 
              ? '🔒 Cost/Purchase rates are currently RESTRICTED for your role.' 
              : '🔓 Full Visibility: Viewing Purchase Cost, MRP, Retail, Wholesale & Dealer Rates.'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter products by code, name, or HSN..."
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-xs focus:outline-none"
        />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <th className="py-3 px-4">Code / SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">HSN/SAC</th>
                <th className="py-3 px-4 text-right">Current Stock</th>
                <th className="py-3 px-4 text-right">Cost Rate</th>
                <th className="py-3 px-4 text-right">MRP</th>
                <th className="py-3 px-4 text-right">Retail Rate</th>
                <th className="py-3 px-4 text-right">Wholesale Rate</th>
                <th className="py-3 px-4 text-right">Dealer Rate</th>
                <th className="py-3 px-4">GST %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-brand-400">{p.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {p.name}
                    <span className="text-[10px] text-slate-500 block">Category: {p.category} | Rack: {p.rackLocation}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{p.hsnSac}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-100">
                    <span className={p.currentStock <= p.minReorderLevel ? 'text-rose-400 font-bold' : ''}>
                      {p.currentStock} {p.unit}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-bold">
                    {currentRole === 'SALES' || currentRole === 'CASHIER' ? (
                      <span className="text-[10px] text-slate-500 flex items-center justify-end space-x-1">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>Hidden</span>
                      </span>
                    ) : (
                      <span className="text-amber-400">₹{p.rates.purchaseCostRate.toLocaleString('en-IN')}</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-medium text-slate-400 line-through">₹{p.rates.mrp.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-brand-400">₹{p.rates.retailRate.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-400">₹{p.rates.wholesaleRate.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-semibold text-purple-400">₹{p.rates.dealerRate.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {p.gstRate}% GST
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Add Product to Master</h2>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Product Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Logitech Wireless Mouse" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category:</label>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">HSN/SAC Code:</label>
                  <input type="text" value={hsnSac} onChange={(e) => setHsnSac(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Cost Rate (₹):</label>
                  <input type="number" value={costRate} onChange={(e) => setCostRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">MRP (₹):</label>
                  <input type="number" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Retail Rate (₹):</label>
                  <input type="number" value={retailRate} onChange={(e) => setRetailRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleAddProduct} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl text-xs">Save Product</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
