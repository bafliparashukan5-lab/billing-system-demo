import React from 'react';
import { useERP } from '../context/ERPContext';

export const AuditTrailPage: React.FC = () => {
  const { auditLogs } = useERP();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <span>Security Audit Trail & Activity Log</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/30">Section 3 Immutable Log</span>
          </h1>
          <p className="text-xs text-slate-400">Complete immutable log of all user actions, OTP approvals, price overrides and financial changes.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-200 block">{log.userName}</span>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">{log.userRole}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-brand-400">{log.action}</td>
                  <td className="py-3 px-4 text-slate-300">{log.module}</td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{log.details}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
