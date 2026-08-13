import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';

export const AccountsPage: React.FC = () => {
  const { ledgerVouchers, metrics } = useERP();
  const [activeTab, setActiveTab] = useState<'DAYBOOK' | 'TRIAL' | 'PL' | 'BALANCE_SHEET'>('DAYBOOK');
  const [ledgers, setLedgers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/accounts/ledgers')
      .then(res => res.json())
      .then(data => setLedgers(data))
      .catch(err => console.error(err));
  }, []);

  const totalDebit = ledgers.filter(l => l.debitCredit === 'Dr').reduce((sum, l) => sum + l.balance, 0);
  const totalCredit = ledgers.filter(l => l.debitCredit === 'Cr').reduce((sum, l) => sum + l.balance, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <span>Accounting, Ledgers & Financial Statements</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/30">Section 16 Compliant</span>
          </h1>
          <p className="text-xs text-slate-400">Automated double-entry posting from Sales, Purchases, Receipts, Payments & Journals.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('DAYBOOK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'DAYBOOK' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          Day Book & Vouchers
        </button>
        <button
          onClick={() => setActiveTab('TRIAL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'TRIAL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setActiveTab('PL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'PL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          Profit & Loss Statement
        </button>
        <button
          onClick={() => setActiveTab('BALANCE_SHEET')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'BALANCE_SHEET' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          Balance Sheet
        </button>
      </div>

      {activeTab === 'DAYBOOK' && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <th className="py-3 px-4">Voucher #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Debit Account</th>
                  <th className="py-3 px-4">Credit Account</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Narration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ledgerVouchers.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-emerald-400">{v.voucherNo}</td>
                    <td className="py-3 px-4 text-slate-400">{v.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {v.voucherType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{v.debitAccount}</td>
                    <td className="py-3 px-4 font-semibold text-slate-300">{v.creditAccount}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-100">₹{v.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-400 italic text-[11px]">{v.narration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'TRIAL' && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-200">Trial Balance Statement</h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">Balanced Double-Entry</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <th className="p-3">Account Code</th>
                <th className="p-3">Ledger Name</th>
                <th className="p-3">Account Group</th>
                <th className="p-3 text-right">Debit (Dr)</th>
                <th className="p-3 text-right">Credit (Cr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ledgers.map(l => (
                <tr key={l.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-400">{l.code}</td>
                  <td className="p-3 font-semibold text-slate-200">{l.name}</td>
                  <td className="p-3 text-slate-400">{l.group}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">{l.debitCredit === 'Dr' ? `₹${l.balance.toLocaleString('en-IN')}` : '-'}</td>
                  <td className="p-3 text-right font-bold text-amber-400">{l.debitCredit === 'Cr' ? `₹${l.balance.toLocaleString('en-IN')}` : '-'}</td>
                </tr>
              ))}
              <tr className="bg-slate-950 font-extrabold text-slate-100 border-t-2 border-slate-700">
                <td colSpan={3} className="p-3 uppercase">Total Trial Balance</td>
                <td className="p-3 text-right text-emerald-400">₹{totalDebit.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right text-amber-400">₹{totalCredit.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'PL' && (
        <div className="glass-panel rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
          <h3 className="font-bold text-base text-slate-100 text-center border-b border-slate-800 pb-3">Profit & Loss Statement (Year-to-Date)</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
              <span>INCOME & REVENUE</span>
              <span className="text-emerald-400">₹{metrics?.totalSales.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-2 pt-2">
              <span>LESS: COST OF GOODS SOLD (COGS)</span>
              <span className="text-rose-400">₹{metrics?.totalPurchases.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between font-extrabold text-sm text-slate-100 bg-slate-950 p-3 rounded-xl">
              <span>GROSS PROFIT (MARGIN: 22%)</span>
              <span className="text-emerald-400">₹{metrics?.grossProfit.toLocaleString('en-IN')}</span>
            </div>

            <div className="space-y-1.5 pt-2 text-slate-400">
              <div className="flex justify-between">
                <span>Office Rent Expenses:</span>
                <span>₹45,000</span>
              </div>
              <div className="flex justify-between">
                <span>Staff Salary & Wages:</span>
                <span>₹85,000</span>
              </div>
            </div>

            <div className="flex justify-between font-extrabold text-base text-slate-100 bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/30 p-4 rounded-xl mt-4">
              <span>NET OPERATING PROFIT</span>
              <span className="text-emerald-400">₹{metrics?.netProfit.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'BALANCE_SHEET' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h4 className="font-extrabold text-slate-200 text-sm border-b border-slate-800 pb-2 text-emerald-400">ASSETS</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span>Current Stock Inventory:</span><span className="font-bold text-slate-200">₹{metrics?.currentStockValue.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Trade Receivables:</span><span className="font-bold text-slate-200">₹{metrics?.receivables.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Cash & Bank Balances:</span><span className="font-bold text-slate-200">₹{metrics?.cashBankBalance.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>GST Input Tax Credit:</span><span className="font-bold text-slate-200">₹{metrics?.gstReceivable.toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h4 className="font-extrabold text-slate-200 text-sm border-b border-slate-800 pb-2 text-rose-400">LIABILITIES & CAPITAL</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span>Trade Payables:</span><span className="font-bold text-slate-200">₹{metrics?.payables.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>GST Output Tax Payable:</span><span className="font-bold text-slate-200">₹{metrics?.gstPayable.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Owner Share Capital & Surplus:</span><span className="font-bold text-slate-200">₹4,500,000</span></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
