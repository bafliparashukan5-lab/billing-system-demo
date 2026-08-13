import React from 'react';
import { useERP } from '../context/ERPContext';
import { 
  LayoutDashboard, Building, Package, Tag, ShoppingCart, 
  ShoppingBag, Warehouse, BookOpen, FileText, Clock, 
  BarChart3, ShieldCheck, Receipt, Store, Crown, LogOut, LucideIcon 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
  enabled?: boolean;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { session, tenantFeatures, logout } = useERP();

  const isSuperAdmin = session?.userType === 'SUPER_ADMIN';

  const menuGroups: MenuGroup[] = [
    ...(isSuperAdmin ? [{
      group: 'SAAS CONTROL',
      items: [
        { id: 'superadmin', label: 'Super Admin Portal', icon: Crown, highlight: true, enabled: true },
      ]
    }] : []),
    {
      group: 'MAIN ERP',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, enabled: true },
        { id: 'pos', label: 'POS Counter Billing', icon: Receipt, highlight: true, enabled: tenantFeatures.posBilling },
        { id: 'sales', label: 'Sales & Quotations', icon: ShoppingCart, enabled: tenantFeatures.salesWorkflow },
        { id: 'purchases', label: 'Purchase & Owner OTP', icon: ShoppingBag, enabled: tenantFeatures.purchaseOtp },
      ].filter(i => i.enabled !== false)
    },
    {
      group: 'INVENTORY & MASTERS',
      items: [
        { id: 'products', label: 'Product Master & Rates', icon: Tag, enabled: tenantFeatures.productRates },
        { id: 'masters', label: 'Customer & Suppliers', icon: Package, enabled: true },
        { id: 'inventory', label: 'Godown & Batch Stock', icon: Warehouse, enabled: tenantFeatures.inventoryGodown },
        { id: 'company', label: 'Company & Bill Settings', icon: Building, enabled: true },
      ].filter(i => i.enabled !== false)
    },
    ...(isSuperAdmin ? [
      {
        group: 'FINANCE & COMPLIANCE',
        items: [
          { id: 'accounts', label: 'Accounting & Ledgers', icon: BookOpen, enabled: tenantFeatures.accountsLedger },
          { id: 'gst', label: 'GST, E-Invoice & E-Way', icon: FileText, enabled: tenantFeatures.gstStatutory },
          { id: 'outstanding', label: 'Receivables / Payables', icon: Clock, enabled: tenantFeatures.outstandingAgeing },
        ].filter(i => i.enabled !== false)
      },
      {
        group: 'INTELLIGENCE & SECURITY',
        items: [
          { id: 'analytics', label: 'BI Analytics & AI', icon: BarChart3, enabled: tenantFeatures.analyticsAi },
          { id: 'audit-trail', label: 'Security & Audit Logs', icon: ShieldCheck, enabled: true },
        ].filter(i => i.enabled !== false)
      }
    ] : [])
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-100 text-sm tracking-wide flex items-center space-x-1">
              <span>ApexERP</span>
              {isSuperAdmin && (
                <span className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border border-purple-500/30">SaaS Admin</span>
              )}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{session?.name || 'Enterprise System'}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {group.group}
            </h3>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 font-bold' 
                      : item.highlight
                      ? 'bg-pink-950/40 text-pink-300 border border-pink-500/30 hover:bg-pink-900/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-pink-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 rounded-xl text-xs font-bold transition text-slate-300 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout Portal</span>
        </button>
        <p className="text-[10px] text-slate-500 text-center">Enterprise Management Edition</p>
      </div>
    </aside>
  );
};
