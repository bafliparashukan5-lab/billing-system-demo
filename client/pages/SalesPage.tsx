import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { SalesDocType, LineItem } from '../../shared/types';
import { Plus, Eye, Trash2, ShoppingBag, Printer } from 'lucide-react';

interface InvoiceLineDraft {
  productId: string;
  quantity: number;
  rate: number;
  discountPercent: number;
}

export const SalesPage: React.FC = () => {
  const { 
    salesInvoices, customers, products, createSalesInvoice, 
    convertDocument, setActivePdfInvoice, addToast, deleteRecord 
  } = useERP();

  const [activeTab, setActiveTab] = useState<SalesDocType>('SALES_INVOICE');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CREDIT'>('CREDIT');
  
  // Multi-item draft state
  const [lineDrafts, setLineDrafts] = useState<InvoiceLineDraft[]>([]);

  const docTabs: { id: SalesDocType; label: string }[] = [
    { id: 'SALES_INVOICE', label: 'Sales Invoices' },
    { id: 'QUOTATION', label: 'Quotations' },
    { id: 'PROFORMA', label: 'Proforma Invoices' },
    { id: 'SALES_ORDER', label: 'Sales Orders' },
    { id: 'DELIVERY_CHALLAN', label: 'Delivery Challans' },
  ];

  const filteredInvoices = salesInvoices.filter(i => i.docType === activeTab);

  const openCreateModal = () => {
    if (customers.length === 0 || products.length === 0) {
      addToast('warning', 'Please add at least 1 Customer and 1 Product in Master Data first!');
      return;
    }
    setSelectedCustomerId(customers[0].id);
    setPaymentMode('CREDIT');
    const initialProduct = products[0];
    setLineDrafts([{
      productId: initialProduct.id,
      quantity: 1,
      rate: initialProduct.rates?.retailRate || 1000,
      discountPercent: 0
    }]);
    setShowCreateModal(true);
  };

  const addLineDraft = () => {
    if (products.length === 0) return;
    const prod = products[0];
    setLineDrafts(prev => [
      ...prev,
      {
        productId: prod.id,
        quantity: 1,
        rate: prod.rates?.retailRate || 1000,
        discountPercent: 0
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

  const updateLineDraft = (index: number, field: keyof InvoiceLineDraft, value: any) => {
    setLineDrafts(prev => prev.map((item, idx) => {
      if (idx === index) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const selectedProd = products.find(p => p.id === value);
          if (selectedProd) {
            updated.rate = selectedProd.rates?.retailRate || 1000;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleCreate = async () => {
    const cust = customers.find(c => c.id === selectedCustomerId) || customers[0];

    if (!cust) {
      addToast('warning', 'Select a valid customer');
      return;
    }

    if (lineDrafts.length === 0) {
      addToast('warning', 'Add at least 1 product item');
      return;
    }

    const isInterState = cust.state !== 'Maharashtra';

    const items: LineItem[] = lineDrafts.map((draft, idx) => {
      const prod = products.find(p => p.id === draft.productId) || products[0];
      const lineSubtotal = draft.quantity * draft.rate;
      const discAmt = lineSubtotal * (draft.discountPercent / 100);
      const taxable = lineSubtotal - discAmt;

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (isInterState) {
        igst = taxable * (prod.gstRate / 100);
      } else {
        cgst = taxable * ((prod.gstRate / 2) / 100);
        sgst = taxable * ((prod.gstRate / 2) / 100);
      }

      return {
        id: 'li_' + Date.now() + '_' + idx,
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        hsnSac: prod.hsnSac,
        unit: prod.unit,
        quantity: draft.quantity,
        rate: draft.rate,
        discountPercent: draft.discountPercent,
        discountAmount: discAmt,
        taxableAmount: taxable,
        gstRate: prod.gstRate,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        totalAmount: taxable + cgst + sgst + igst
      };
    });

    const inv = await createSalesInvoice({
      docType: activeTab,
      customerId: cust.id,
      customerName: cust.name,
      customerGstin: cust.gstin,
      customerAddress: cust.billingAddress,
      placeOfSupply: cust.state,
      isInterState,
      paymentMode,
      items
    });

    setShowCreateModal(false);

    // Auto-open print preview for pay & print flow
    if (inv && (activeTab === 'SALES_INVOICE' || activeTab === 'POS_RECEIPT')) {
      setActivePdfInvoice(inv);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document? Inventory stock will be automatically restored.')) {
      await deleteRecord('sales', id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">Sales & Quotation Management</h1>
          <p className="text-xs text-slate-400">Complete Workflow: Customer Enquiry → Quotation → Proforma → Order → Challan → Invoice</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New {activeTab.replace(/_/g, ' ')}</span>
        </button>
      </div>

      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {docTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <th className="py-3 px-4">Doc #</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Taxable</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No {activeTab.replace(/_/g, ' ')} documents created yet. Click Create to add one.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-brand-400">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {inv.customerName}
                      <span className="text-[10px] text-slate-500 block">GSTIN: {inv.customerGstin}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{inv.invoiceDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-brand-300">
                        {inv.items.length} Products
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-300">₹{inv.totalTaxable.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-100">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                        inv.status === 'ACCEPTED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center space-x-1">
                      <button 
                        onClick={() => setActivePdfInvoice(inv)}
                        className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer inline-flex items-center"
                        title="View & Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {inv.docType === 'QUOTATION' && (
                        <button
                          onClick={() => convertDocument(inv.id, 'SALES_INVOICE')}
                          className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition"
                        >
                          → Invoice
                        </button>
                      )}

                      <button 
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 cursor-pointer inline-flex items-center"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Product Line Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-auto">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-400" />
              <span>Create New {activeTab.replace(/_/g, ' ')}</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Select Customer:</label>
                  <select 
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.state})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Payment Mode:</label>
                  <select 
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CREDIT">Credit (Pay Later)</option>
                  </select>
                </div>
              </div>

              {/* Multi-Item Line Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-300 font-bold">Product Item Lines ({lineDrafts.length}):</label>
                  <button 
                    type="button"
                    onClick={addLineDraft}
                    className="flex items-center space-x-1 text-[11px] font-bold text-brand-400 hover:text-brand-300 bg-brand-500/10 border border-brand-500/30 px-2.5 py-1 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product Line</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {lineDrafts.map((draft, idx) => {
                    const prod = products.find(p => p.id === draft.productId) || products[0];
                    const lineTotal = (draft.quantity * draft.rate) * (1 - draft.discountPercent / 100) * (1 + (prod?.gstRate || 18) / 100);
                    return (
                      <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Product Item</label>
                          <select 
                            value={draft.productId}
                            onChange={(e) => updateLineDraft(idx, 'productId', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
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
                          <label className="block text-[10px] text-slate-500 mb-0.5">Rate (₹)</label>
                          <input 
                            type="number"
                            value={draft.rate}
                            onChange={(e) => updateLineDraft(idx, 'rate', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Disc %</label>
                          <input 
                            type="number"
                            min={0}
                            max={100}
                            value={draft.discountPercent}
                            onChange={(e) => updateLineDraft(idx, 'discountPercent', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Total (Incl Tax)</label>
                          <span className="block p-1.5 text-xs font-extrabold text-brand-300 font-mono">₹{Math.round(lineTotal).toLocaleString('en-IN')}</span>
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
            </div>

            <div className="flex space-x-3 pt-3 border-t border-slate-800">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleCreate} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1">
                <Printer className="w-4 h-4" />
                <span>Pay & Save Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
