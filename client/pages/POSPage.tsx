import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Product, LineItem } from '../../shared/types';
import { 
  Barcode, ShoppingCart, Plus, Minus, Trash2, 
  CreditCard, Banknote, Smartphone, Printer, User 
} from 'lucide-react';

export const POSPage: React.FC = () => {
  const { products, customers, createSalesInvoice, setActivePdfInvoice, addToast } = useERP();
  const [query, setQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('c4');
  const [cart, setCart] = useState<{ product: Product; quantity: number; discount: number }[]>([]);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CREDIT_CARD'>('CASH');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[3];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.quantity * item.product.rates.retailRate), 0);
  const totalTaxable = subTotal;
  const totalGST = cart.reduce((sum, item) => sum + (item.quantity * item.product.rates.retailRate * (item.product.gstRate / 100)), 0);
  const grandTotal = Math.round(totalTaxable + totalGST);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      addToast('warning', 'Cart is empty!');
      return;
    }

    const items: LineItem[] = cart.map((item, idx) => ({
      id: 'pos_item_' + idx,
      productId: item.product.id,
      productCode: item.product.code,
      productName: item.product.name,
      hsnSac: item.product.hsnSac,
      unit: item.product.unit,
      quantity: item.quantity,
      rate: item.product.rates.retailRate,
      discountPercent: item.discount,
      discountAmount: 0,
      taxableAmount: item.quantity * item.product.rates.retailRate,
      gstRate: item.product.gstRate,
      cgstAmount: (item.quantity * item.product.rates.retailRate * (item.product.gstRate / 100)) / 2,
      sgstAmount: (item.quantity * item.product.rates.retailRate * (item.product.gstRate / 100)) / 2,
      igstAmount: 0,
      totalAmount: item.quantity * item.product.rates.retailRate * (1 + item.product.gstRate / 100)
    }));

    const invoice = await createSalesInvoice({
      docType: 'POS_RECEIPT',
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerGstin: selectedCustomer.gstin,
      customerAddress: selectedCustomer.billingAddress,
      placeOfSupply: 'Maharashtra',
      paymentMode,
      items,
      paidAmount: grandTotal
    });

    if (invoice) {
      setActivePdfInvoice(invoice);
      setCart([]);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.barcode.includes(query) || p.sku.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="h-[calc(100vh-4rem)] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
      
      <div className="lg:col-span-7 flex flex-col space-y-4 h-full overflow-hidden">
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="flex items-center space-x-2 flex-1 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <Barcode className="w-5 h-5 text-pink-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Scan Barcode or Search SKU/Product..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="glass-panel p-3.5 rounded-2xl flex flex-col justify-between cursor-pointer hover:border-pink-500/50 hover:bg-slate-800/80 transition group"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">{product.category}</span>
                <h4 className="font-bold text-xs text-slate-200 line-clamp-2 mt-0.5 group-hover:text-pink-400 transition">{product.name}</h4>
              </div>

              <div className="mt-3 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-400 block">Stock: {product.currentStock} {product.unit}</span>
                  <span className="font-extrabold text-sm text-pink-400">₹{product.rates.retailRate.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 glass-panel p-5 rounded-2xl flex flex-col h-full overflow-hidden border border-pink-500/20">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <User className="w-4 h-4 text-pink-400" />
          <select 
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900">{c.name} ({c.gstin})</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center text-slate-500 py-20 text-xs">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <span>Cart is empty. Scan barcode or tap products to add.</span>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                <div className="flex-1 pr-2">
                  <span className="font-bold text-slate-200 block truncate">{item.product.name}</span>
                  <span className="text-[10px] text-slate-400">₹{item.product.rates.retailRate} × {item.quantity}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 text-slate-400 hover:text-white">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-bold text-slate-100">{item.quantity}</span>
                    <button onClick={() => addToCart(item.product)} className="p-1 text-slate-400 hover:text-white">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-extrabold text-pink-400 w-16 text-right">
                    ₹{(item.quantity * item.product.rates.retailRate).toLocaleString('en-IN')}
                  </span>

                  <button onClick={() => removeFromCart(item.product.id)} className="text-slate-500 hover:text-rose-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-800 pt-3 space-y-3">
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal (Taxable):</span>
              <span>₹{subTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax Amount:</span>
              <span>₹{totalGST.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-extrabold text-slate-100 text-sm pt-1 border-t border-slate-800">
              <span>Grand Total Payable:</span>
              <span className="text-pink-400">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setPaymentMode('CASH')}
              className={`flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold border ${paymentMode === 'CASH' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              <Banknote className="w-4 h-4" />
              <span>CASH</span>
            </button>
            <button
              onClick={() => setPaymentMode('UPI')}
              className={`flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold border ${paymentMode === 'UPI' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              <Smartphone className="w-4 h-4" />
              <span>UPI / QR</span>
            </button>
            <button
              onClick={() => setPaymentMode('CREDIT_CARD')}
              className={`flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold border ${paymentMode === 'CREDIT_CARD' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              <CreditCard className="w-4 h-4" />
              <span>CARD</span>
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl text-sm shadow-xl shadow-pink-950/50 flex items-center justify-center space-x-2 transition"
          >
            <Printer className="w-5 h-5" />
            <span>PAY & PRINT THERMAL RECEIPT</span>
          </button>
        </div>

      </div>

    </div>
  );
};
