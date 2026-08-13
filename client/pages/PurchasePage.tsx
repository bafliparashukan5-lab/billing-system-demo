import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { LineItem } from '../../shared/types';
import { Plus, CheckCircle2, Lock } from 'lucide-react';

export const PurchasePage: React.FC = () => {
  const { purchaseBills, suppliers, products, createPurchaseBill, setActiveOtpBill } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(2);
  const [rate, setRate] = useState(products[0]?.rates.purchaseCostRate || 92000);

  const handleCreate = async () => {
    const supp = suppliers.find(s => s.id === supplierId) || suppliers[0];
    const prod = products.find(p => p.id === productId) || products[0];

    const items: LineItem[] = [{
      id: 'pli_' + Date.now(),
      productId: prod.id,
      productCode: prod.code,
      productName: prod.name,
      hsnSac: prod.hsnSac,
      unit: prod.unit,
      quantity,
      rate,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: quantity * rate,
      gstRate: prod.gstRate,
      cgstAmount: (quantity * rate * (prod.gstRate / 100)) / 2,
      sgstAmount: (quantity * rate * (prod.gstRate / 100)) / 2,
      igstAmount: 0,
      totalAmount: quantity * rate * (1 + prod.gstRate / 100)
    }];

    await createPurchaseBill({
      supplierId: supp.id,
      supplierName: supp.name,
      supplierGstin: supp.gstin,
      items
    });

    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <span>Purchase & Owner Approval OTP Engine</span>
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/30">Section 12 Compliant</span>
          </h1>
          <p className="text-xs text-slate-400">Purchases &ge; ₹1,00,000 trigger server-side Owner OTP verification before stock & accounts posting.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Purchase Bill</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <th className="py-3 px-4">Bill #</th>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Bill Date</th>
                <th className="py-3 px-4 text-right">Taxable</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4 text-center">Action / Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchaseBills.map(bill => (
                <tr key={bill.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-purple-400">{bill.billNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {bill.supplierName}
                    <span className="text-[10px] text-slate-500 block">GSTIN: {bill.supplierGstin}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{bill.billDate}</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-300">₹{bill.totalTaxable.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-100">₹{bill.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center space-x-1 w-fit ${
                      bill.status === 'POSTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      bill.status === 'PENDING_OWNER_OTP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {bill.status === 'POSTED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{bill.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {bill.status === 'PENDING_OWNER_OTP' ? (
                      <button
                        onClick={() => setActiveOtpBill(bill)}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-lg text-xs hover:from-amber-400 hover:to-orange-400 shadow-md transition"
                      >
                        Enter Owner OTP
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Posted & Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Create New Purchase Bill</h2>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Supplier:</label>
                <select 
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Product Item:</label>
                <select 
                  value={productId}
                  onChange={(e) => {
                    setProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod) setRate(prod.rates.purchaseCostRate);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Quantity:</label>
                  <input 
                    type="number" 
                    min={1} 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Purchase Rate (₹):</label>
                  <input 
                    type="number" 
                    value={rate} 
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl font-mono"
                  />
                </div>
              </div>

              <p className="text-[11px] text-amber-400 italic pt-1">
                * Note: If total amount exceeds ₹1,00,000, Owner OTP will be required before posting.
              </p>
            </div>

            <div className="flex space-x-3 pt-3">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleCreate} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs">Generate Purchase Bill</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
