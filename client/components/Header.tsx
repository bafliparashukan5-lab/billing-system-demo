import React from 'react';
import { useERP } from '../context/ERPContext';
import { UserRole } from '../../shared/types';
import { 
  Building2, ShieldCheck, Search, PlusCircle, Bell, 
  ShieldAlert, ShoppingBag, Receipt 
} from 'lucide-react';

export const Header: React.FC<{
  onOpenQuickInvoice: () => void;
  onOpenQuickPos: () => void;
  onOpenQuickPurchase: () => void;
}> = ({ onOpenQuickInvoice, onOpenQuickPos, onOpenQuickPurchase }) => {
  const { 
    currentRole, setCurrentRole, 
    branches, currentBranch, setCurrentBranch, 
    setIsSearchOpen, purchaseBills
  } = useERP();

  const pendingOtpCount = purchaseBills.filter(b => b.status === 'PENDING_OWNER_OTP').length;

  const roles: { role: UserRole; label: string; badge: string }[] = [
    { role: 'OWNER', label: 'Owner (All Rates & OTP)', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { role: 'ADMIN', label: 'Admin (Full Access)', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { role: 'ACCOUNTANT', label: 'Accountant', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { role: 'SALES', label: 'Salesperson (Rates Hidden)', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { role: 'CASHIER', label: 'POS Cashier', badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  ];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-medium">
          <Building2 className="w-4 h-4 text-brand-400" />
          <select 
            value={currentBranch.id} 
            onChange={(e) => {
              const b = branches.find(item => item.id === e.target.value);
              if (b) setCurrentBranch(b);
            }}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 px-4 py-1.5 rounded-lg text-slate-400 text-xs w-64 justify-between transition"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search invoice, customer, SKU...</span>
          </div>
          <kbd className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-800">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenQuickPos}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-lg shadow-pink-950/40 transition"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>POS Billing</span>
        </button>

        <button
          onClick={onOpenQuickInvoice}
          className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-lg shadow-brand-950/40 transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ New Invoice</span>
        </button>

        <button
          onClick={onOpenQuickPurchase}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium transition"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
          <span>+ Purchase Bill</span>
        </button>

        <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-amber-400 ml-1" />
          <select 
            value={currentRole} 
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-medium text-slate-300 focus:outline-none cursor-pointer px-1 py-0.5"
          >
            {roles.map(r => (
              <option key={r.role} value={r.role} className="bg-slate-900 text-slate-200">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {pendingOtpCount > 0 && (
          <div className="relative">
            <div className="animate-pulse bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{pendingOtpCount} Pending OTP</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
