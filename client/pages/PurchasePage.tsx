import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { LineItem } from '../../shared/types';
import { Plus, CheckCircle2, Lock, Trash2, ShoppingBag } from 'lucide-react';

interface PurchaseLineDraft {
  productId: string;
  quantity: number;
  rate: number;
}

export const PurchasePage: React.FC = () => {
  const { purchaseBills, suppliers, products, createPurchaseBill, setActiveOtpBill, addToast } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  
  // Multi-item draft state
  const [lineDrafts, setLineDrafts] = useState<PurchaseLineDraft[]>([]);

  const openCreateModal = () => {
    if (suppliers.length === 0 || products.length === 0) {
      addToast('warning', 'Please add at least 1 Supplier and 1 Product in Master Data first!');
      return;
    }
    setSupplierId(suppliers[0].id);
    const initialProduct = products[0];
    setLineDrafts([{
      productId: initialProduct.id,
      quantity: 1,
      rate: initialProduct.rates?.purchaseCostRate || 1000
    }]);
    setShowModal(true);
  };

  const addLineDraft = () => {
    if (products.length === 0) return;
    const prod = products[0];
    setLineDrafts(prev => [
      ...prev,
      {
        productId: prod.id,
        quantity: 1,
        rate: prod.rates?.purchaseCostRate || 1000
      }
    ]);
  };

  const removeLineDraft = (index: number) => {
    if (lineDrafts.length === 1) {
      addToast('info', 'At least 1 product item line is required');
      return;
    }
    setLineDrafts(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateLineDraft = (index: number, field: keyof PurchaseLineDraft, value: any) => {
    setLineDrafts(prev => prev.map((item, idx) => {
      if (idx === index) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const selectedProd = products.find(p => p.id === value);
          if (selectedProd) {
            updated.rate = selectedProd.rates?.purchaseCostRate || 1000;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleCreate = async () => {
    const supp = suppliers.find(s => s.id === supplierId) || suppliers[0];

    if (!supp) {
      addToast('warning', 'Select a valid supplier');
      return;
    }

    if (lineDrafts.length === 0) {
      addToast('warning', 'Add at least 1 product item');
      return;
    }

    const items: LineItem[] = lineDrafts.map((draft, idx) => {
      const prod = products.find(p => p.id === draft.productId) || products[0];
      const taxable = draft.quantity * draft.rate;
      const cgst = (taxable * (prod.gstRate / 100)) / 2;
      const sgst = (taxable * (prod.gstRate / 100)) / 2;

      return {
        id: 'pli_' + Date.now() + '_' + idx,
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        hsnSac: prod.hsnSac,
        unit: prod.unit,
        quantity: draft.quantity,
        rate: draft.rate,
        discountPercent: 0,
        discountAmount: 0,
        taxableAmount: taxable,
        gstRate: prod.gstRate,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: 0,
        totalAmount: taxable + cgst + sgst
      };
    });

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
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
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
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Taxable</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4 text-center">Action / Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchaseBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No purchase bills created yet. Click + Create Purchase Bill to record your first stock entry.
                  </td>
                </tr>
              ) : (
                purchaseBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-purple-400">{bill.billNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {bill.supplierName}
                      <span className="text-[10px] text-slate-500 block">GSTIN: {bill.supplierGstin}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{bill.billDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-purple-300">
                        {bill.items.length} Items
                      </span>
                    </td>
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
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-lg text-xs hover:from-amber-400 hover:to-orange-400 shadow-md transition cursor-pointer"
                        >
                          Enter Owner OTP
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Posted & Verified</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Product Line Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl my-auto">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <span>Create New Purchase Bill</span>
            </h2>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Supplier:</label>
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

              {/* Multi-Item Line Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-300 font-bold">Product Stock Lines ({lineDrafts.length}):</label>
                  <button 
                    type="button"
                    onClick={addLineDraft}
                    className="flex items-center space-x-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Product Line</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {lineDrafts.map((draft, idx) => {
                    const prod = products.find(p => p.id === draft.productId) || products[0];
                    const lineTotal = (draft.quantity * draft.rate) * (1 + (prod?.gstRate || 18) / 100);
                    return (
                      <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Product Item</label>
                          <select 
                            value={draft.productId}
                            onChange={(e) => updateLineDraft(idx, 'productId', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Qty</label>
                          <input 
                            type="number"
                            min={1}
                            value={draft.quantity}
                            onChange={(e) => updateLineDraft(idx, 'quantity', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Cost Rate (₹)</label>
                          <input 
                            type="number"
                            value={draft.rate}
                            onChange={(e) => updateLineDraft(idx, 'rate', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Total (Incl Tax)</label>
                          <span className="block p-1.5 text-xs font-extrabold text-purple-300 font-mono">₹{Math.round(lineTotal).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="col-span-1 text-center pt-3">
                          <button 
                            type="button" 
                            onClick={() => removeLineDraft(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-amber-400 italic pt-1">
                * Note: If total amount exceeds ₹1,00,000, Owner OTP will be required before posting.
              </p>
            </div>

            <div className="flex space-x-3 pt-3 border-t border-slate-800">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleCreate} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs">Generate Purchase Bill</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
