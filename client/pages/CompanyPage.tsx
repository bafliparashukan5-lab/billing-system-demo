import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { MapPin, Phone, Mail, Edit3, Building, Save } from 'lucide-react';

export const CompanyPage: React.FC = () => {
  const { company, branches, refreshData, addToast, session } = useERP();
  const [showEditModal, setShowEditModal] = useState(false);

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [cityState, setCityState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [cin, setCin] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (company) {
      setName(company.name || '');
      setTagline(company.tagline || '');
      setAddress(company.address || '');
      setCityState(company.cityState || '');
      setPincode(company.pincode || '');
      setPhone(company.phone || '');
      setEmail(company.email || '');
      setWebsite(company.website || '');
      setGstin(company.gstin || '');
      setPan(company.pan || '');
      setCin(company.cin || '');
      setBankName(company.bankName || '');
      setAccountNo(company.accountNo || '');
      setIfscCode(company.ifscCode || '');
      setUpiId(company.upiId || '');
    }
  }, [company]);

  const activeTenantId = session?.tenantId || session?.tenant?.id || 't_main';

  const handleSaveCompany = async () => {
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify({
          name, tagline, address, cityState, pincode, phone, email, website,
          gstin, pan, cin, bankName, accountNo, ifscCode, upiId
        })
      });
      if (res.ok) {
        addToast('success', 'Company Profile & Invoice Header saved successfully!');
        setShowEditModal(false);
        await refreshData();
      } else {
        addToast('error', 'Failed to save company profile');
      }
    } catch (err) {
      addToast('error', 'Failed to update company profile');
    }
  };

  if (!company) return null;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <Building className="w-5 h-5 text-brand-400" />
            <span>Company Profile & Printable Bill Header</span>
          </h1>
          <p className="text-xs text-slate-400">Configure your business details, GSTIN, PAN, Bank Details & Address for printed invoices.</p>
        </div>
        <button
          onClick={() => {
            setName(company.name || '');
            setTagline(company.tagline || '');
            setAddress(company.address || '');
            setCityState(company.cityState || '');
            setPincode(company.pincode || '');
            setPhone(company.phone || '');
            setEmail(company.email || '');
            setWebsite(company.website || '');
            setGstin(company.gstin || '');
            setPan(company.pan || '');
            setCin(company.cin || '');
            setBankName(company.bankName || '');
            setAccountNo(company.accountNo || '');
            setIfscCode(company.ifscCode || '');
            setUpiId(company.upiId || '');
            setShowEditModal(true);
          }}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 transition cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Business Profile & Bill Header</span>
        </button>
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
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Operating Branches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map(b => (
              <div key={b.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 text-sm">{b.name}</span>
                  {b.isMain && <span className="bg-brand-500/20 text-brand-400 text-[10px] px-2 py-0.5 rounded font-bold">Main Office</span>}
                </div>
                <p className="text-xs text-slate-400">{b.address}</p>
                <p className="text-xs text-slate-400">GSTIN: {b.gstin}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Edit Company Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-auto">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-brand-400" />
              <span>Edit Company Profile & Invoice Header</span>
            </h2>

            <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Business Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tagline / Business Subtitle:</label>
                <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Registered Address:</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">City, State:</label>
                  <input type="text" value={cityState} onChange={(e) => setCityState(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Pincode:</label>
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone:</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email:</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">GSTIN:</label>
                  <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono uppercase" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">PAN:</label>
                  <input type="text" value={pan} onChange={(e) => setPan(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono uppercase" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">CIN:</label>
                  <input type="text" value={cin} onChange={(e) => setCin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono uppercase" />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="font-bold text-slate-300 mb-2">Invoice Bank Settlement Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Bank Name:</label>
                    <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Account Number:</label>
                    <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">IFSC Code:</label>
                    <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono uppercase" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">UPI VPA ID:</label>
                    <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleSaveCompany} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1">
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
