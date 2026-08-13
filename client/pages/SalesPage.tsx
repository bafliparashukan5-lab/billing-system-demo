import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { SalesDocType, LineItem } from '../../shared/types';
import { Plus, Eye } from 'lucide-react';

export const SalesPage: React.FC = () => {
  const { 
    salesInvoices, customers, products, createSalesInvoice, 
    convertDocument, setActivePdfInvoice, addToast 
  } = useERP();

  const [activeTab, setActiveTab] = useState<SalesDocType>('SALES_INVOICE');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);

  const docTabs: { id: SalesDocType; label: string }[] = [
    { id: 'SALES_INVOICE', label: 'Sales Invoices' },
    { id: 'QUOTATION', label: 'Quotations' },
    { id: 'PROFORMA', label: 'Proforma Invoices' },
    { id: 'SALES_ORDER', label: 'Sales Orders' },
    { id: 'DELIVERY_CHALLAN', label: 'Delivery Challans' },
  ];

  const filteredInvoices = salesInvoices.filter(i => i.docType === activeTab);

  const handleCreate = async () => {
    const cust = customers.find(c => c.id === selectedCustomerId) || customers[0];
    const prod = products.find(p => p.id === selectedProductId) || products[0];

    if (!cust || !prod) {
      addToast('warning', 'Please add at least 1 Customer and 1 Product first in Master Data!');
      return;
    }

    const isInterState = cust.state !== 'Maharashtra';

    const items: LineItem[] = [{
      id: 'li_' + Date.now(),
      productId: prod.id,
      productCode: prod.code,
      productName: prod.name,
      hsnSac: prod.hsnSac,
      unit: prod.unit,
      quantity,
      rate: prod.rates.retailRate,
      discountPercent,
      discountAmount: (prod.rates.retailRate * quantity) * (discountPercent / 100),
      taxableAmount: (prod.rates.retailRate * quantity) * (1 - discountPercent / 100),
      gstRate: prod.gstRate,
      cgstAmount: isInterState ? 0 : ((prod.rates.retailRate * quantity) * (prod.gstRate / 100)) / 2,
      sgstAmount: isInterState ? 0 : ((prod.rates.retailRate * quantity) * (prod.gstRate / 100)) / 2,
      igstAmount: isInterState ? (prod.rates.retailRate * quantity) * (prod.gstRate / 100) : 0,
      totalAmount: (prod.rates.retailRate * quantity) * (1 + prod.gstRate / 100)
    }];

    await createSalesInvoice({
      docType: activeTab,
      customerId: cust.id,
      customerName: cust.name,
      customerGstin: cust.gstin,
      customerAddress: cust.billingAddress,
      placeOfSupply: cust.state,
      isInterState,
      items
    });

    setShowCreateModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">Sales & Quotation Management</h1>
          <p className="text-xs text-slate-400">Complete Workflow: Customer Enquiry → Quotation → Proforma → Order → Challan → Invoice</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New {activeTab.replace('_', ' ')}</span>
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
                <th className="py-3 px-4">Place of Supply</th>
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
                    No {activeTab.replace('_', ' ')} documents created yet. Click + Create to add one.
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
                    <td className="py-3 px-4 text-slate-400">{inv.placeOfSupply} ({inv.isInterState ? 'IGST' : 'CGST/SGST'})</td>
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
                    <td className="py-3 px-4 text-center space-x-2">
                      <button 
                        onClick={() => setActivePdfInvoice(inv)}
                        className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="View Printable Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {inv.docType === 'QUOTATION' && (
                        <button
                          onClick={() => convertDocument(inv.id, 'SALES_INVOICE')}
                          className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition"
                        >
                          → Convert to Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Create New {activeTab.replace('_', ' ')}</h2>
            
            {customers.length === 0 || products.length === 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-300 space-y-2">
                <p className="font-bold">⚠️ No Masters Found!</p>
                <p>Please add at least 1 Customer and 1 Product in Master Data before creating sales invoices.</p>
                <button onClick={() => setShowCreateModal(false)} className="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg">
                  Got It
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Select Customer:</label>
                  <select 
                    value={selectedCustomerId || customers[0]?.id}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.state})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Select Product:</label>
                  <select 
                    value={selectedProductId || products[0]?.id}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.rates.retailRate}</option>
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
                    <label className="block text-slate-400 mb-1 font-semibold">Discount %:</label>
                    <input 
                      type="number" 
                      min={0} 
                      max={100} 
                      value={discountPercent} 
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-3">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold">Cancel</button>
                  <button onClick={handleCreate} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl text-xs">Save & Post</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
