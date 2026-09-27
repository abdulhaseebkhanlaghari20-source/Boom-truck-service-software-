import React, { useState } from 'react';
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  X,
  Truck,
  DollarSign,
  Download,
} from 'lucide-react';
import { useSimpleApp } from '../SimpleContext.tsx';
import { Invoice, InvoiceStatus } from '../types.ts';

export const SimpleInvoices: React.FC = () => {
  const {
    invoices,
    trucks,
    drivers,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    toggleInvoiceStatus,
    formatSAR,
    language,
  } = useSimpleApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | InvoiceStatus>('all');
  const [filterTruck, setFilterTruck] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [truckNumber, setTruckNumber] = useState(trucks[0]?.truckNumber || 'BT-01');
  const [driverName, setDriverName] = useState(trucks[0]?.driverName || '');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState<number | ''>(5000);
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('Pending');
  const [notes, setNotes] = useState('');

  // Auto update driver when truck changes
  const handleTruckChange = (selectedTruckNum: string) => {
    setTruckNumber(selectedTruckNum);
    const assigned = trucks.find((t) => t.truckNumber === selectedTruckNum);
    if (assigned) {
      setDriverName(assigned.driverName);
    }
  };

  // Totals
  const totalPaid = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  const totalPending = invoices
    .filter((inv) => inv.status === 'Pending')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.jobDescription && inv.jobDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inv.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.driverName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchTruck = filterTruck === 'all' || inv.truckNumber === filterTruck;

    return matchSearch && matchStatus && matchTruck;
  });

  const handleOpenAdd = () => {
    setEditingInvoice(null);
    setInvoiceNumber(`#${1000 + invoices.length + 1}`);
    setDate(new Date().toISOString().slice(0, 10));
    const firstTruck = trucks[0]?.truckNumber || 'BT-01';
    setTruckNumber(firstTruck);
    setDriverName(trucks[0]?.driverName || '');
    setCustomerName('');
    setAmount(5000);
    setJobDescription('');
    setStatus('Pending');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setInvoiceNumber(inv.invoiceNumber);
    setDate(inv.date);
    setTruckNumber(inv.truckNumber);
    setDriverName(inv.driverName);
    setCustomerName(inv.customerName);
    setAmount(inv.amount);
    setJobDescription(inv.jobDescription);
    setStatus(inv.status);
    setNotes(inv.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        language === 'ar'
          ? 'هل تريد بالتأكيد حذف هذه الفاتورة؟'
          : 'Are you sure you want to delete this invoice?'
      )
    ) {
      deleteInvoice(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim() || !customerName.trim() || amount === '' || Number(amount) <= 0)
      return;

    const invoiceData: Omit<Invoice, 'id'> = {
      invoiceNumber: invoiceNumber.trim(),
      date,
      truckNumber,
      driverName,
      customerName: customerName.trim(),
      jobDescription: jobDescription.trim() || 'Crane & Boom truck hoisting job',
      amount: Number(amount),
      status,
      notes: notes.trim(),
    };

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, invoiceData);
    } else {
      addInvoice(invoiceData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'سجل الفواتير والمطالبات والتحصيل' : 'Invoices & Billing'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'متابعة الفواتير المحصلة والمبالغ المعلقة وتحديث حالة السداد بنقرة واحدة'
              : 'Track invoices, customer collections, and toggle between Paid and Pending'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? '+ إنشاء فاتورة جديدة' : '+ Add Invoice'}</span>
        </button>
      </div>

      {/* Summary Badges (3 key totals) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Paid Invoices */}
        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'ar' ? 'المبالغ المحصلة (مدفوعة)' : 'Paid Invoices'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
            {formatSAR(totalPaid)}
          </p>
          <p className="text-[10px] text-slate-500">
            {invoices.filter((i) => i.status === 'Paid').length}{' '}
            {language === 'ar' ? 'فواتير تم استلام مبالغها' : 'invoices collected'}
          </p>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'ar' ? 'المستحقات المعلقة (آجل)' : 'Pending Invoices'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 font-mono tracking-tight">
            {formatSAR(totalPending)}
          </p>
          <p className="text-[10px] text-slate-500">
            {invoices.filter((i) => i.status === 'Pending').length}{' '}
            {language === 'ar' ? 'فواتير قيد التحصيل' : 'invoices awaiting payment'}
          </p>
        </div>

        {/* Total Invoices Count */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي عدد الفواتير' : 'Total Invoices'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4 text-slate-700" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {invoices.length}
          </p>
          <p className="text-[10px] text-slate-500">
            {language === 'ar' ? 'عمليات الفوترة المسجلة' : 'Total invoice records in ledger'}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'ar'
                ? 'بحث برقم الفاتورة، اسم العميل، الرافعة، أو الوصف...'
                : 'Search invoice #, customer name, truck, description...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-9 pe-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="all">{language === 'ar' ? 'كل الحالات' : 'All Status'}</option>
            <option value="Paid">{language === 'ar' ? 'مدفوعة فقط (Paid)' : 'Paid Only'}</option>
            <option value="Pending">{language === 'ar' ? 'معلقة فقط (Pending)' : 'Pending Only'}</option>
          </select>

          {/* Truck Filter */}
          <select
            value={filterTruck}
            onChange={(e) => setFilterTruck(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="all">{language === 'ar' ? 'كل الرافعات' : 'All Trucks'}</option>
            {trucks.map((t) => (
              <option key={t.id} value={t.truckNumber}>
                {t.truckNumber} ({t.plateNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3.5">{language === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}</th>
                <th className="p-3.5">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="p-3.5">{language === 'ar' ? 'الرافعة والسائق' : 'Truck & Driver'}</th>
                <th className="p-3.5">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="p-3.5">{language === 'ar' ? 'الوصف' : 'Description'}</th>
                <th className="p-3.5">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                <th className="p-3.5">{language === 'ar' ? 'حالة السداد' : 'Status'}</th>
                <th className="p-3.5 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {language === 'ar'
                      ? 'لا توجد فواتير مطابقة للبحث'
                      : 'No invoices match the selected filter'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">{inv.date}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-900">{inv.truckNumber}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{inv.driverName}</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{inv.customerName}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">
                      {inv.jobDescription}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatSAR(inv.amount)}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleInvoiceStatus(inv.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                        }`}
                        title={
                          language === 'ar'
                            ? 'انقر لتغيير الحالة (مدفوعة / معلقة)'
                            : 'Click to toggle status'
                        }
                      >
                        {inv.status === 'Paid' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{language === 'ar' ? 'مدفوعة' : 'Paid'}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>{language === 'ar' ? 'معلقة (اضغط للسداد)' : 'Pending'}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(inv)}
                          className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingInvoice
                ? language === 'ar'
                  ? `تعديل الفاتورة (${editingInvoice.invoiceNumber})`
                  : `Edit Invoice (${editingInvoice.invoiceNumber})`
                : language === 'ar'
                ? 'إنشاء فاتورة جديدة'
                : 'Add New Invoice'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="#1009"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تاريخ الفاتورة' : 'Invoice Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الرافعة' : 'Truck'}
                  </label>
                  <select
                    value={truckNumber}
                    onChange={(e) => handleTruckChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    {trucks.map((t) => (
                      <option key={t.id} value={t.truckNumber}>
                        {t.truckNumber} ({t.plateNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم السائق' : 'Driver Name'}
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'اسم العميل / الشركة' : 'Customer Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Rashid Trading & Contracting"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'تفاصيل العمل المنفذ' : 'Job Scope / Description'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Structural steel trusses hoist & position"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'المبلغ (SAR)' : 'Amount (SAR)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 7500"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'حالة السداد' : 'Payment Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    <option value="Paid">{language === 'ar' ? 'مدفوعة (Paid)' : 'Paid'}</option>
                    <option value="Pending">{language === 'ar' ? 'معلقة (Pending)' : 'Pending'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'ملاحظات إضافية' : 'Notes'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Direct bank transfer confirmation #9912"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {language === 'ar' ? 'حفظ الفاتورة' : 'Save Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
