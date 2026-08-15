import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Users, Truck, Plus, Trash2 } from 'lucide-react';

export const MastersPage: React.FC = () => {
  const { customers, suppliers, addToast, refreshData, deleteRecord, session } = useERP();
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'SUPPLIERS'>('CUSTOMERS');
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('27AAACR1234A1Z5');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Maharashtra');

  const handleAdd = async () => {
    if (!name) return;
    const endpoint = activeTab === 'CUSTOMERS' ? '/api/customers' : '/api/suppliers';
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': session?.tenantId || session?.tenant?.id || 't_main' },
        body: JSON.stringify({
          name, companyName: name, gstin, email, phone, billingAddress: 'MIDC Estate', shippingAddress: 'MIDC Estate', state, creditLimit: 500000, creditDays: 30, openingBalance: 0
        })
      });
      addToast('success', `${activeTab === 'CUSTOMERS' ? 'Customer' : 'Supplier'} ${name} added!`);
      setShowModal(false);
      await refreshData();
    } catch (err) {
      addToast('error', 'Failed to save master record');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">Customer & Supplier Master Data</h1>
          <p className="text-xs text-slate-400">Section 4 Compliant: Maintain GSTIN, credit limits, addresses & balances.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeTab === 'CUSTOMERS' ? 'Customer' : 'Supplier'}</span>
        </button>
      </div>

      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('CUSTOMERS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'CUSTOMERS' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Master ({customers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'SUPPLIERS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <Truck className="w-4 h-4" />
          <span>Supplier Master ({suppliers.length})</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Name / Company</th>
                <th className="py-3 px-4">GSTIN</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Phone / Email</th>
                <th className="py-3 px-4 text-right">Credit Limit</th>
                <th className="py-3 px-4 text-right">Current Balance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeTab === 'CUSTOMERS' ? (
                customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-brand-400">{c.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{c.name}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{c.gstin}</td>
                    <td className="py-3 px-4 text-slate-400">{c.state}</td>
                    <td className="py-3 px-4 text-slate-400">{c.phone}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-300">₹{c.creditLimit.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-400">₹{c.currentBalance.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => { if (confirm(`Delete customer "${c.name}"?`)) deleteRecord('customers', c.id); }}
                        className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-purple-400">{s.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{s.name}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{s.gstin}</td>
                    <td className="py-3 px-4 text-slate-400">{s.state}</td>
                    <td className="py-3 px-4 text-slate-400">{s.phone}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-300">{s.paymentTerms}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-400">₹{s.currentBalance.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => { if (confirm(`Delete supplier "${s.name}"?`)) deleteRecord('suppliers', s.id); }}
                        className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="Delete Supplier"
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Add New {activeTab === 'CUSTOMERS' ? 'Customer' : 'Supplier'}</h2>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name / Business Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Enterprises" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">GSTIN Number:</label>
                <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone:</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98000..." className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">State:</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleAdd} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl text-xs">Save Master</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
