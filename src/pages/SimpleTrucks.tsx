import React, { useState } from 'react';
import {
  Plus,
  Truck as TruckIcon,
  Edit2,
  Trash2,
  Search,
  Eye,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { useSimpleApp } from '../SimpleContext.tsx';
import { Truck, OwnershipType, TruckStatus } from '../types.ts';
import { SimpleTruckDetail } from './SimpleTruckDetail.tsx';

export const SimpleTrucks: React.FC = () => {
  const {
    trucks,
    selectedTruckId,
    setSelectedTruckId,
    addTruck,
    updateTruck,
    deleteTruck,
    invoices,
    expenses,
    formatSAR,
    language,
  } = useSimpleApp();

  // If a truck is clicked for detail view, render SimpleTruckDetail
  if (selectedTruckId) {
    return <SimpleTruckDetail />;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TruckStatus>('All');
  const [ownershipFilter, setOwnershipFilter] = useState<'All' | OwnershipType>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);

  // Form Fields
  const [truckNumber, setTruckNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('Company');
  const [ownerName, setOwnerName] = useState('');
  const [sharePercent, setSharePercent] = useState<number>(0);
  const [status, setStatus] = useState<TruckStatus>('Active');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingTruck(null);
    setTruckNumber(`BT-0${trucks.length + 1}`);
    setPlateNumber('');
    setDriverName('');
    setOwnershipType('Company');
    setOwnerName('');
    setSharePercent(0);
    setStatus('Active');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Truck, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTruck(t);
    setTruckNumber(t.truckNumber);
    setPlateNumber(t.plateNumber || '');
    setDriverName(t.driverName);
    setOwnershipType(t.ownershipType);
    setOwnerName(t.ownerName || '');
    setSharePercent(t.sharePercent);
    setStatus(t.status);
    setNotes(t.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (
      window.confirm(
        language === 'ar'
          ? 'هل أنت متأكد من حذف هذه الرافعة؟'
          : 'Are you sure you want to delete this truck?'
      )
    ) {
      deleteTruck(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckNumber.trim() || !driverName.trim()) return;

    const truckData: Omit<Truck, 'id'> = {
      truckNumber: truckNumber.trim(),
      plateNumber: plateNumber.trim() || '--- KSA',
      driverName: driverName.trim(),
      ownershipType,
      ownerName: ownershipType === 'Shared' ? ownerName.trim() : undefined,
      sharePercent: ownershipType === 'Shared' ? Number(sharePercent) : 0,
      status,
      notes: notes.trim(),
    };

    if (editingTruck) {
      updateTruck(editingTruck.id, truckData);
    } else {
      addTruck(truckData);
    }
    setIsModalOpen(false);
  };

  // Filter trucks
  const filteredTrucks = trucks.filter((t) => {
    const matchesSearch =
      t.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.ownerName && t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesOwnership = ownershipFilter === 'All' || t.ownershipType === ownershipFilter;

    return matchesSearch && matchesStatus && matchesOwnership;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'أسطول الرافعات والشاحنات' : 'Boom Trucks Fleet'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'إدارة بيانات الرافعات، ملكية الشاحنات، نسب الشركاء، وسجلاتها المالية المستقلة'
              : 'Manage boom trucks, assigned drivers, ownership shares and individual financial sheets'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? '+ إضافة رافعة جديدة' : '+ Add Truck'}</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'ar'
                ? 'البحث برقم الرافعة، اللوحة، السائق، أو المالك...'
                : 'Search truck number, plate, driver, owner...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-9 pe-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="All">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="Active">{language === 'ar' ? 'نشطة (Active)' : 'Active'}</option>
            <option value="Maintenance">{language === 'ar' ? 'صيانة (Maintenance)' : 'Maintenance'}</option>
            <option value="Inactive">{language === 'ar' ? 'غير نشطة (Inactive)' : 'Inactive'}</option>
          </select>

          {/* Ownership filter */}
          <select
            value={ownershipFilter}
            onChange={(e) => setOwnershipFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="All">{language === 'ar' ? 'جميع أنواع الملكية' : 'All Ownerships'}</option>
            <option value="Company">{language === 'ar' ? 'الشركة (Company)' : 'Company'}</option>
            <option value="Shared">{language === 'ar' ? 'شراكة (Shared)' : 'Shared'}</option>
            <option value="Rented">{language === 'ar' ? 'مستأجرة (Rented)' : 'Rented'}</option>
          </select>
        </div>
      </div>

      {/* Trucks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrucks.map((t) => {
          const truckInvs = invoices.filter((i) => i.truckNumber === t.truckNumber && i.status === 'Paid');
          const rev = truckInvs.reduce((sum, i) => sum + Number(i.amount || 0), 0);
          const exp = expenses
            .filter((e) => e.truckNumber === t.truckNumber)
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);
          const net = rev - exp;

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTruckId(t.id)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                    <TruckIcon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {t.truckNumber}
                      </h3>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
                        {t.plateNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'ar' ? 'السائق:' : 'Driver:'} <span className="font-semibold text-slate-700">{t.driverName}</span>
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : t.status === 'Maintenance'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              {/* Ownership & Notes */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{language === 'ar' ? 'الملكية:' : 'Ownership:'}</span>
                  <span className="font-bold text-slate-800">
                    {t.ownershipType} {t.sharePercent > 0 ? `(${t.sharePercent}%)` : ''}
                  </span>
                </div>
                {t.ownershipType === 'Shared' && (
                  <div className="flex justify-between items-center text-amber-800">
                    <span>{language === 'ar' ? 'المالك الشريك:' : 'Owner:'}</span>
                    <span className="font-semibold">{t.ownerName || '---'}</span>
                  </div>
                )}
                {t.notes && <p className="text-[11px] text-slate-400 truncate pt-1">{t.notes}</p>}
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الإيراد' : 'Revenue'}</span>
                  <span className="text-xs font-mono font-bold text-emerald-700">{formatSAR(rev)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'المصاريف' : 'Expenses'}</span>
                  <span className="text-xs font-mono font-bold text-rose-700">{formatSAR(exp)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الصافي' : 'Net'}</span>
                  <span className={`text-xs font-mono font-black ${net >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {formatSAR(net)}
                  </span>
                </div>
              </div>

              {/* Card Footer: Detail prompt & edit/delete buttons */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:underline">
                  <span>{language === 'ar' ? 'فتح الصفحة المالية' : 'Open Financial Sheet'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenEdit(t, e)}
                    className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(t.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Truck Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingTruck
                ? language === 'ar'
                  ? `تعديل بيانات الرافعة (${editingTruck.truckNumber})`
                  : `Edit Truck (${editingTruck.truckNumber})`
                : language === 'ar'
                ? 'إضافة رافعة جديدة للأسطول'
                : 'Add New Boom Truck'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم الرافعة' : 'Truck Number'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BT-06"
                    value={truckNumber}
                    onChange={(e) => setTruckNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم اللوحة' : 'Plate Number'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5521 KSA"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم السائق' : 'Driver Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed Al-Ghamdi"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TruckStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    <option value="Active">{language === 'ar' ? 'نشطة (Active)' : 'Active'}</option>
                    <option value="Maintenance">{language === 'ar' ? 'صيانة (Maintenance)' : 'Maintenance'}</option>
                    <option value="Inactive">{language === 'ar' ? 'غير نشطة (Inactive)' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نوع الملكية' : 'Ownership Type'}
                  </label>
                  <select
                    value={ownershipType}
                    onChange={(e) => {
                      const val = e.target.value as OwnershipType;
                      setOwnershipType(val);
                      if (val === 'Company') setSharePercent(0);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    <option value="Company">{language === 'ar' ? 'الشركة 100%' : 'Company (100%)'}</option>
                    <option value="Shared">{language === 'ar' ? 'شراكة (Shared)' : 'Shared'}</option>
                    <option value="Rented">{language === 'ar' ? 'مستأجرة (Rented)' : 'Rented'}</option>
                  </select>
                </div>

                {ownershipType === 'Shared' ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'ar' ? 'نسبة الشريك (%)' : 'Owner Share (%)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={sharePercent}
                      onChange={(e) => setSharePercent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">
                      {language === 'ar' ? 'حصة الشريك' : 'Partner Share'}
                    </label>
                    <div className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 font-mono">
                      0% (Company 100%)
                    </div>
                  </div>
                )}
              </div>

              {ownershipType === 'Shared' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم المالك الشريك' : 'Owner / Partner Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sheikh Fahad Al-Otaibi"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'ملاحظات وتفاصيل المواصفات' : 'Notes & Boom Specifications'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 15-Ton Telescopic Crane (Isuzu FVR), 24m reach"
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
                  {language === 'ar' ? 'حفظ البيانات' : 'Save Truck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
