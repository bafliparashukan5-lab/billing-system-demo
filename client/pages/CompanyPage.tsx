import React from 'react';
import { useERP } from '../context/ERPContext';
import { MapPin, Phone, Mail } from 'lucide-react';

export const CompanyPage: React.FC = () => {
  const { company, branches } = useERP();

  if (!company) return null;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">Company & Branch Configuration</h1>
          <p className="text-xs text-slate-400">Section 2 Master Company & Multi-Branch Settings.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
          <img src={company.logo} alt="Company Logo" className="w-14 h-14 rounded-xl border border-slate-700 object-cover" />
          <div>
            <h2 className="text-lg font-extrabold text-slate-100">{company.name}</h2>
            <p className="text-xs text-brand-400 font-semibold">{company.tagline}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-300">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>{company.address}, {company.cityState} - {company.pincode}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{company.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>{company.email} | {company.website}</span>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">GSTIN:</span>
              <span className="font-mono font-bold text-slate-200">{company.gstin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PAN:</span>
              <span className="font-mono font-bold text-slate-200">{company.pan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CIN:</span>
              <span className="font-mono font-bold text-slate-200">{company.cin}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Primary Settlement Bank Account</h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div><span className="text-slate-500 block">Bank Name</span><span className="font-bold text-slate-200">{company.bankName}</span></div>
            <div><span className="text-slate-500 block">Account Number</span><span className="font-mono font-bold text-slate-200">{company.accountNo}</span></div>
            <div><span className="text-slate-500 block">IFSC Code</span><span className="font-mono font-bold text-slate-200">{company.ifscCode}</span></div>
            <div><span className="text-slate-500 block">UPI Virtual Payment Addr</span><span className="font-mono font-bold text-brand-400">{company.upiId}</span></div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Configured Operating Branches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map(b => (
              <div key={b.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 text-sm">{b.name}</span>
                  {b.isMain && <span className="bg-brand-500/20 text-brand-400 text-[10px] px-2 py-0.5 rounded font-bold">Head Office</span>}
                </div>
                <p className="text-xs text-slate-400">{b.address}</p>
                <p className="text-xs text-slate-400">GSTIN: {b.gstin}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
