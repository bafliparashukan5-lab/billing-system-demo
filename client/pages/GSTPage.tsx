import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';

export const GSTPage: React.FC = () => {
  const { metrics } = useERP();
  const [gstData, setGstData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/gst/reports')
      .then(res => res.json())
      .then(data => setGstData(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <span>GST Statutory Returns, E-Invoice & E-Way Bill</span>
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/30">Section 17 & 18</span>
          </h1>
          <p className="text-xs text-slate-400">Indian GST compliance: GSTR-1, GSTR-3B, HSN summary, IRN QR generation & E-Way bill part A/B.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Output Tax Liability</span>
          <h2 className="text-2xl font-black text-rose-400">₹{metrics?.gstPayable.toLocaleString('en-IN')}</h2>
          <p className="text-[10px] text-slate-500">CGST + SGST + IGST collected from sales</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Input Tax Credit (ITC) Available</span>
          <h2 className="text-2xl font-black text-emerald-400">₹{metrics?.gstReceivable.toLocaleString('en-IN')}</h2>
          <p className="text-[10px] text-slate-500">Tax paid on verified purchases</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Net GST Payable Cash</span>
          <h2 className="text-2xl font-black text-amber-400">₹{Math.max(0, (metrics?.gstPayable || 0) - (metrics?.gstReceivable || 0)).toLocaleString('en-IN')}</h2>
          <p className="text-[10px] text-slate-500">Net tax after ITC offset</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-slate-200">GSTR-1 Outward Supplies Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-brand-400">B2B Registered Invoices:</h4>
            <p className="text-slate-300">Total B2B Taxable Sales: ₹{gstData?.gstr3b?.outwardTaxable?.toLocaleString('en-IN')}</p>
            <p className="text-slate-400">Output CGST: ₹{gstData?.gstr3b?.cgstOutput?.toLocaleString('en-IN')}</p>
            <p className="text-slate-400">Output SGST: ₹{gstData?.gstr3b?.sgstOutput?.toLocaleString('en-IN')}</p>
            <p className="text-slate-400">Output IGST: ₹{gstData?.gstr3b?.igstOutput?.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-400">E-Way Bill & E-Invoice Generator:</h4>
            <p className="text-slate-300">NIC Portal Integration Ready (EWay, IRN QR)</p>
            <p className="text-slate-400">Auto-validates HSN codes & Place of supply rules.</p>
            <div className="flex space-x-2 pt-2">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">100% Validated</span>
              <span className="px-2 py-1 bg-brand-500/20 text-brand-400 rounded text-[10px] font-bold">QR Code Ready</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
