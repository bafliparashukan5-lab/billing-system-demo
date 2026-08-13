import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { Tenant, TenantFeatureToggles } from '../../shared/types';
import { 
  ShieldCheck, Users, Plus, ToggleLeft, ToggleRight, 
  Settings, CheckCircle2, XCircle, Search, Mail, Lock, Building 
} from 'lucide-react';

export const SuperAdminPage: React.FC = () => {
  const { addToast } = useERP();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFeatureModalTenant, setActiveFeatureModalTenant] = useState<Tenant | null>(null);

  // New Tenant Form
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('client123');
  const [phone, setPhone] = useState('+91 98000 00000');
  const [gstin, setGstin] = useState('27AAACA0000A1Z5');

  const fetchTenants = () => {
    fetch('/api/superadmin/tenants')
      .then(r => r.json())
      .then(data => setTenants(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async () => {
    if (!companyName || !email) return;
    try {
      const res = await fetch('/api/superadmin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, email, password, phone, gstin })
      });
      const newTenant = await res.json();
      addToast('success', `Created Client Account for ${newTenant.companyName}!`);
      setShowCreateModal(false);
      setCompanyName('');
      setEmail('');
      fetchTenants();
    } catch (err) {
      addToast('error', 'Failed to create tenant account');
    }
  };

  const handleToggleStatus = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/superadmin/tenants/${tenantId}/toggle-status`, { method: 'POST' });
      const updated = await res.json();
      addToast(updated.active ? 'success' : 'warning', `Client ${updated.companyName} is now ${updated.active ? 'ACTIVE' : 'DEACTIVATED'}`);
      fetchTenants();
    } catch (err) {
      addToast('error', 'Failed to update tenant status');
    }
  };

  const handleToggleFeature = async (featureKey: keyof TenantFeatureToggles) => {
    if (!activeFeatureModalTenant) return;
    const currentVal = activeFeatureModalTenant.features[featureKey];
    const updatedFeatures = { [featureKey]: !currentVal };

    try {
      const res = await fetch(`/api/superadmin/tenants/${activeFeatureModalTenant.id}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFeatures)
      });
      const updatedTenant = await res.json();
      setActiveFeatureModalTenant(updatedTenant);
      addToast('info', `Toggled ${featureKey} to ${!currentVal ? 'ENABLED' : 'DISABLED'}`);
      fetchTenants();
    } catch (err) {
      addToast('error', 'Failed to update feature toggle');
    }
  };

  const featureLabels: { key: keyof TenantFeatureToggles; label: string; desc: string }[] = [
    { key: 'posBilling', label: 'POS Counter Billing', desc: 'Rapid counter billing, barcode scanning, thermal receipts' },
    { key: 'salesWorkflow', label: 'Sales & Quotation Workflow', desc: 'Quotation → Proforma → Order → Challan → Invoice' },
    { key: 'purchaseOtp', label: 'Purchase & Owner Approval OTP', desc: 'Rule 12 OTP verification for purchases ≥ ₹1,00,000' },
    { key: 'productRates', label: 'Product Master & 5-Tier Rates', desc: 'MRP, Cost, Retail, Wholesale & Dealer rates' },
    { key: 'inventoryGodown', label: 'Godown & Inventory Stock', desc: 'Multi-godown stock allocation & inter-godown transfer' },
    { key: 'accountsLedger', label: 'Accounting & Ledgers', desc: 'Double-entry Vouchers, Day Book, Trial Balance, P&L' },
    { key: 'gstStatutory', label: 'GST, E-Invoice & E-Way Bill', desc: 'GSTR-1, GSTR-3B, HSN summary & E-Way bill simulator' },
    { key: 'outstandingAgeing', label: 'Receivables & Payables Ageing', desc: '0-30, 31-60, 61-90 days ageing matrix & WhatsApp reminders' },
    { key: 'analyticsAi', label: 'BI Analytics & AI Insights', desc: 'Profitability forecasts, margin analytics & AI alerts' },
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-purple-500/30">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <span>Super Admin SaaS Management Portal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Control client accounts, login credentials, and dynamically toggle feature permissions.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Client Account</span>
        </button>
      </div>

      {/* Tenants Management Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-purple-500/20">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Active SaaS Client Tenants ({tenants.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Client Business Name</th>
                <th className="py-3 px-4">Login Email</th>
                <th className="py-3 px-4">GSTIN</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Enabled Modules</th>
                <th className="py-3 px-4 text-center">Feature Controls & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tenants.map(tenant => {
                const enabledCount = Object.values(tenant.features).filter(Boolean).length;
                return (
                  <tr key={tenant.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">{tenant.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">{tenant.companyName}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{tenant.email}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{tenant.gstin}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        tenant.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {tenant.active ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold text-[10px]">
                        {enabledCount} / 9 Enabled
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      <button
                        onClick={() => setActiveFeatureModalTenant(tenant)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition"
                      >
                        ⚙️ Configure Feature Toggles
                      </button>

                      <button
                        onClick={() => handleToggleStatus(tenant.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          tenant.active ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {tenant.active ? 'Deactivate Client' : 'Activate Client'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Toggle Matrix Modal */}
      {activeFeatureModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span>Feature Access Toggles — {activeFeatureModalTenant.companyName}</span>
                </h2>
                <p className="text-xs text-slate-400">Enable or disable individual ERP modules for this client in real-time.</p>
              </div>
              <button onClick={() => setActiveFeatureModalTenant(null)} className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-3 py-1 rounded-lg">
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {featureLabels.map(f => {
                const isEnabled = activeFeatureModalTenant.features[f.key];
                return (
                  <div key={f.key} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div className="pr-2">
                      <span className="font-bold text-slate-200 block">{f.label}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{f.desc}</span>
                    </div>

                    <button
                      onClick={() => handleToggleFeature(f.key)}
                      className={`flex-shrink-0 p-1 rounded-full transition ${isEnabled ? 'text-emerald-400' : 'text-slate-600'}`}
                    >
                      {isEnabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end">
              <button
                onClick={() => setActiveFeatureModalTenant(null)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl text-xs"
              >
                Done / Save Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-100">Create New Client Account</h2>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Client Company Name:</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Paramount Traders Ltd" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Client Login Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. paramount@traders.com" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Initial Password:</label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone:</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">GSTIN:</label>
                  <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono uppercase" />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleCreateTenant} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs">Create Client Account</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
