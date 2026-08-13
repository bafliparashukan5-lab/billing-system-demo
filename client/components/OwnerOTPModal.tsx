import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { KeyRound, CheckCircle2, X, Lock } from 'lucide-react';

export const OwnerOTPModal: React.FC = () => {
  const { activeOtpBill, setActiveOtpBill, verifyOwnerOtp } = useERP();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  if (!activeOtpBill) return null;

  const handleVerify = async () => {
    if (!otp) return;
    setLoading(true);
    await verifyOwnerOtp(activeOtpBill.id, otp);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <button 
          onClick={() => setActiveOtpBill(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>Owner Approval OTP Required</span>
            </h2>
            <p className="text-xs text-amber-400 font-medium">ERP Security Rule 12 Verification</p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Purchase Bill No:</span>
            <span className="font-bold text-slate-200">{activeOtpBill.billNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Supplier Name:</span>
            <span className="font-semibold text-slate-300">{activeOtpBill.supplierName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Grand Total Amount:</span>
            <span className="font-extrabold text-amber-400 text-sm">₹{activeOtpBill.grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
            * This high-value purchase exceeds ₹1,00,000 threshold. Stock, Accounts Payable, and GST ITC will only post after Owner OTP verification.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Enter 6-Digit Owner Security OTP:
          </label>
          <div className="relative">
            <KeyRound className="w-5 h-5 text-amber-400 absolute left-3 top-3" />
            <input 
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-center font-mono text-lg font-bold tracking-widest text-amber-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[10px] text-slate-500">Security SMS sent to Owner Mobile</span>
            <button 
              type="button"
              onClick={() => setOtp('889900')}
              className="text-[11px] text-amber-400 font-semibold hover:text-amber-300"
            >
              Default OTP (889900)
            </button>
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            onClick={() => setActiveOtpBill(null)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold"
          >
            Cancel / Save Draft
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Verifying...' : 'Verify & Post Bill'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
