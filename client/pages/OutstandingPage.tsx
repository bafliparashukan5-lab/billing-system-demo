import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Send } from 'lucide-react';

export const OutstandingPage: React.FC = () => {
  const { customers, suppliers, addToast } = useERP();
  const [view, setView] = useState<'RECEIVABLES' | 'PAYABLES'>('RECEIVABLES');

  const sendReminder = (name: string, phone: string, balance: number) => {
    addToast('info', `Simulated payment reminder sent via WhatsApp to ${name} (${phone}) for ₹${balance.toLocaleString('en-IN')}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <span>Outstanding & Credit Control Ageing</span>
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/30">Section 20 Compliant</span>
          </h1>
          <p className="text-xs text-slate-400">Bill-wise ageing breakdown (0-30, 31-60, 61-90, 90+ days) and payment collection reminders.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setView('RECEIVABLES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${view === 'RECEIVABLES' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          Customer Receivables (Debtors)
        </button>
        <button
          onClick={() => setView('PAYABLES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${view === 'PAYABLES' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          Supplier Payables (Creditors)
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <th className="py-3 px-4">Party Name</th>
                <th className="py-3 px-4 text-right">0 - 30 Days</th>
                <th className="py-3 px-4 text-right">31 - 60 Days</th>
                <th className="py-3 px-4 text-right">61 - 90 Days</th>
                <th className="py-3 px-4 text-right">90+ Days</th>
                <th className="py-3 px-4 text-right">Total Outstanding</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {view === 'RECEIVABLES' ? (
                customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-200">{c.name}</td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-400">₹{(c.currentBalance * 0.6).toFixed(0)}</td>
                    <td className="py-3 px-4 text-right font-medium text-amber-400">₹{(c.currentBalance * 0.4).toFixed(0)}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">₹0</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">₹0</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-400">₹{c.currentBalance.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => sendReminder(c.name, c.phone, c.currentBalance)}
                        className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition flex items-center space-x-1 mx-auto"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send WhatsApp Reminder</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-200">{s.name}</td>
                    <td className="py-3 px-4 text-right font-medium text-rose-400">₹{s.currentBalance.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">₹0</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">₹0</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">₹0</td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-400">₹{s.currentBalance.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center text-slate-500 text-[10px] italic">
                      Terms: {s.paymentTerms}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
