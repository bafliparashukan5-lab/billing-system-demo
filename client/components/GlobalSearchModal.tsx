import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { Search, X, Tag, FileText, User } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, customers, salesInvoices, setActivePdfInvoice } = useERP();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isSearchOpen) return null;

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.code.toLowerCase().includes(query.toLowerCase()) || p.barcode.includes(query));
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.gstin.toLowerCase().includes(query.toLowerCase()));
  const filteredInvoices = salesInvoices.filter(i => i.invoiceNumber.toLowerCase().includes(query.toLowerCase()) || i.customerName.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950">
          <Search className="w-5 h-5 text-brand-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Global Search (Products, Customers, Invoices, Barcodes)..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          
          {filteredProducts.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Tag className="w-3 h-3 text-brand-400" />
                <span>Products ({filteredProducts.length})</span>
              </h4>
              <div className="space-y-1">
                {filteredProducts.map(p => (
                  <div key={p.id} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg flex justify-between items-center cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-200">{p.name}</span>
                      <span className="text-[10px] text-slate-400 block">{p.code} | HSN: {p.hsnSac} | Stock: {p.currentStock} {p.unit}</span>
                    </div>
                    <span className="font-extrabold text-brand-400">₹{p.rates.retailRate.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredInvoices.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <FileText className="w-3 h-3 text-emerald-400" />
                <span>Sales Invoices ({filteredInvoices.length})</span>
              </h4>
              <div className="space-y-1">
                {filteredInvoices.map(i => (
                  <div 
                    key={i.id} 
                    onClick={() => {
                      setActivePdfInvoice(i);
                      setIsSearchOpen(false);
                    }}
                    className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg flex justify-between items-center cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{i.invoiceNumber} - {i.customerName}</span>
                      <span className="text-[10px] text-slate-400 block">{i.invoiceDate} | Mode: {i.paymentMode}</span>
                    </div>
                    <span className="font-extrabold text-emerald-400">₹{i.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredCustomers.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <User className="w-3 h-3 text-purple-400" />
                <span>Customers ({filteredCustomers.length})</span>
              </h4>
              <div className="space-y-1">
                {filteredCustomers.map(c => (
                  <div key={c.id} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg flex justify-between items-center cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-200">{c.name}</span>
                      <span className="text-[10px] text-slate-400 block">GSTIN: {c.gstin} | State: {c.state}</span>
                    </div>
                    <span className="font-bold text-amber-400">Bal: ₹{c.currentBalance.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length === 0 && filteredInvoices.length === 0 && filteredCustomers.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              No matching results found for "{query}".
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
