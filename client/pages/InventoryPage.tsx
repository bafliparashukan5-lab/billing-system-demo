import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { Warehouse, ArrowRightLeft } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { godowns, products, addToast, refreshData } = useERP();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [fromGodownId, setFromGodownId] = useState(godowns[0]?.id || '');
  const [toGodownId, setToGodownId] = useState(godowns[1]?.id || godowns[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(5);

  const fetchTransfers = () => {
    fetch('/api/inventory/transfers')
      .then(res => res.json())
      .then(data => setTransfers(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleTransfer = async () => {
    try {
      await fetch('/api/inventory/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromGodownId, toGodownId, productId, quantity })
      });
      addToast('success', 'Inter-Godown Stock Transfer successful!');
      setShowTransferModal(false);
      fetchTransfers();
      await refreshData();
    } catch (err) {
      addToast('error', 'Stock transfer failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <span>Godown & Stock Inventory Management</span>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/30">Section 13 & 25</span>
          </h1>
          <p className="text-xs text-slate-400">Multi-warehouse stock allocation, inter-godown transfers, batch & serial tracking.</p>
        </div>
        <button
          onClick={() => setShowTransferModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Inter-Godown Stock Transfer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {godowns.map(g => (
          <div key={g.id} className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <Warehouse className="w-4 h-4 text-blue-400" />
                <span>{g.name}</span>
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">{g.code}</span>
            </div>
            <p className="text-xs text-slate-400">Location: {g.location}</p>
            <p className="text-xs text-slate-400">Capacity: {g.capacity}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Recent Inter-Godown Transfers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <th className="py-2.5 px-3">Transfer #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">From Godown</th>
                <th className="py-2.5 px-3">To Godown</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transfers.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-blue-400">{t.transferNo}</td>
                  <td className="py-2.5 px-3 text-slate-400">{t.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{t.productName}</td>
                  <td className="py-2.5 px-3 text-slate-400">{t.fromGodownName}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">{t.toGodownName}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-100">{t.quantity} {t.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Inter-Godown Stock Transfer</h2>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">From Godown:</label>
                <select value={fromGodownId} onChange={(e) => setFromGodownId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200">
                  {godowns.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">To Godown:</label>
                <select value={toGodownId} onChange={(e) => setToGodownId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200">
                  {godowns.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Product Item:</label>
                <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock} {p.unit})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Quantity to Transfer:</label>
                <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200" />
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button onClick={() => setShowTransferModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleTransfer} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs">Confirm Transfer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
