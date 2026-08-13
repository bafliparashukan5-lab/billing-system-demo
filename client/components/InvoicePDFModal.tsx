import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Printer, Download, Share2, X, Smartphone, FileText } from 'lucide-react';

export const InvoicePDFModal: React.FC = () => {
  const { activePdfInvoice, setActivePdfInvoice, company, addToast } = useERP();
  const [templateMode, setTemplateMode] = useState<'A4' | 'THERMAL'>('A4');

  if (!activePdfInvoice || !company) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `Dear Customer, your invoice ${activePdfInvoice.invoiceNumber} from ${company.name} of amount ₹${activePdfInvoice.grandTotal.toLocaleString('en-IN')} is ready. View details online: ${activePdfInvoice.qrCodeUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    addToast('info', 'Opened WhatsApp invoice sharing preview!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        <div className="no-print p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Invoice Preview ({activePdfInvoice.invoiceNumber})</span>
            </h2>

            <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex space-x-1">
              <button 
                onClick={() => setTemplateMode('A4')}
                className={`px-3 py-1 rounded text-xs font-semibold ${templateMode === 'A4' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Standard A4 Invoice
              </button>
              <button 
                onClick={() => setTemplateMode('THERMAL')}
                className={`px-3 py-1 rounded text-xs font-semibold ${templateMode === 'THERMAL' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                POS 80mm Thermal
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              <Smartphone className="w-4 h-4" />
              <span>WhatsApp Share</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-brand-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={() => setActivePdfInvoice(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40 flex justify-center">
          
          {templateMode === 'A4' ? (
            <div id="printable-invoice" className="bg-white text-slate-900 w-full max-w-3xl p-8 rounded-lg shadow-xl text-xs font-sans border border-slate-200 space-y-6">
              
              <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{company.name}</h1>
                  <p className="text-slate-600">{company.address}, {company.cityState} - {company.pincode}</p>
                  <p className="text-slate-600">GSTIN: <strong className="text-slate-900">{company.gstin}</strong> | CIN: {company.cin}</p>
                  <p className="text-slate-600">Email: {company.email} | Phone: {company.phone}</p>
                </div>
                <div className="text-right">
                  <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">TAX INVOICE</span>
                  <p className="mt-2 text-slate-700 font-bold text-sm">Invoice #: {activePdfInvoice.invoiceNumber}</p>
                  <p className="text-slate-600">Date: {activePdfInvoice.invoiceDate}</p>
                  <p className="text-slate-600">Place of Supply: {activePdfInvoice.placeOfSupply}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <h3 className="font-bold uppercase tracking-wide text-[10px] text-slate-500 mb-1">Billed To Customer:</h3>
                  <p className="font-bold text-sm text-slate-900">{activePdfInvoice.customerName}</p>
                  <p className="text-slate-700">{activePdfInvoice.customerAddress}</p>
                  <p className="text-slate-700 mt-1">GSTIN: <strong className="text-slate-900">{activePdfInvoice.customerGstin}</strong></p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold uppercase tracking-wide text-[10px] text-slate-500 mb-1">Dispatch Details:</h3>
                  <p className="text-slate-700">Salesperson: {activePdfInvoice.salesperson}</p>
                  <p className="text-slate-700">Payment Mode: <strong>{activePdfInvoice.paymentMode}</strong></p>
                  {activePdfInvoice.eWayBillNo && <p className="text-slate-700 font-semibold">E-Way Bill #: {activePdfInvoice.eWayBillNo}</p>}
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] uppercase">
                    <th className="p-2">#</th>
                    <th className="p-2">Item Description</th>
                    <th className="p-2">HSN/SAC</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Taxable</th>
                    <th className="p-2 text-right">GST %</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activePdfInvoice.items.map((item, idx) => (
                    <tr key={idx} className="text-slate-800 text-[11px]">
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2 font-semibold">
                        {item.productName}
                        {item.batchNumber && <span className="block text-[10px] text-slate-500 font-normal">Batch: {item.batchNumber}</span>}
                      </td>
                      <td className="p-2">{item.hsnSac}</td>
                      <td className="p-2 text-right">{item.quantity} {item.unit}</td>
                      <td className="p-2 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right">₹{item.taxableAmount.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right">{item.gstRate}%</td>
                      <td className="p-2 text-right font-bold">₹{item.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-300">
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-[10px] uppercase text-slate-500">Bank Details for Payment:</h4>
                    <p className="font-semibold text-slate-800">{company.bankName}</p>
                    <p className="text-slate-600">A/c No: {company.accountNo} | IFSC: {company.ifscCode}</p>
                    <p className="text-slate-600">UPI ID: {company.upiId}</p>
                  </div>
                  {activePdfInvoice.qrCodeUrl && (
                    <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit">
                      <img src={activePdfInvoice.qrCodeUrl} alt="E-Invoice QR" className="w-16 h-16 border border-slate-300 rounded" />
                      <div className="text-[10px] text-slate-600">
                        <p className="font-bold text-slate-800">Scan UPI / E-Invoice QR</p>
                        <p>Verified IRN & Tax Data</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-right font-medium">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span>₹{activePdfInvoice.totalTaxable.toLocaleString('en-IN')}</span>
                  </div>
                  {!activePdfInvoice.isInterState ? (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST Tax:</span>
                        <span>₹{activePdfInvoice.totalCGST.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST Tax:</span>
                        <span>₹{activePdfInvoice.totalSGST.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST Tax:</span>
                      <span>₹{activePdfInvoice.totalIGST.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Round-Off:</span>
                    <span>₹{activePdfInvoice.roundOff}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-300 pt-2">
                    <span>Grand Total:</span>
                    <span>₹{activePdfInvoice.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-300 pt-4 flex justify-between items-end text-[10px] text-slate-600">
                <div>
                  <h5 className="font-bold text-slate-800">Terms & Conditions:</h5>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {company.termsAndConditions.map((term, i) => (
                      <li key={i}>{term}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-center pt-8">
                  <p className="border-t border-slate-400 px-8 pt-1 font-bold text-slate-800">Authorized Signatory</p>
                  <p className="text-slate-500">For {company.name}</p>
                </div>
              </div>

            </div>
          ) : (
            <div id="printable-invoice" className="bg-white text-slate-900 w-80 p-4 rounded-lg shadow-xl font-mono text-xs border border-slate-300 space-y-4">
              <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
                <h2 className="font-bold text-sm uppercase">{company.name}</h2>
                <p className="text-[10px]">{company.address}</p>
                <p className="text-[10px]">GSTIN: {company.gstin}</p>
                <p className="font-bold text-xs pt-1">*** RETAIL CASH RECEIPT ***</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <p>Invoice #: {activePdfInvoice.invoiceNumber}</p>
                <p>Date: {activePdfInvoice.invoiceDate}</p>
                <p>Customer: {activePdfInvoice.customerName}</p>
              </div>

              <table className="w-full text-left border-t border-b border-dashed border-slate-400 py-2">
                <thead>
                  <tr className="text-[10px]">
                    <th>Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activePdfInvoice.items.map((item, i) => (
                    <tr key={i} className="text-[11px]">
                      <td className="py-1">{item.productName.substring(0, 16)}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">₹{item.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-right font-bold text-xs">
                <div className="flex justify-between">
                  <span>Grand Total:</span>
                  <span>₹{activePdfInvoice.grandTotal}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 font-normal">
                  <span>Paid ({activePdfInvoice.paymentMode}):</span>
                  <span>₹{activePdfInvoice.paidAmount}</span>
                </div>
              </div>

              <div className="text-center text-[10px] pt-2 border-t border-dashed border-slate-400 space-y-0.5">
                <p>Thank you for shopping with us!</p>
                <p>Visit Again</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
