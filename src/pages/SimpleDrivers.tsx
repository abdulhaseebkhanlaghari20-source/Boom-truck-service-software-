import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Truck,
  Edit2,
  Trash2,
  Coffee,
  Smartphone,
  Clock,
  CheckCircle2,
  Wallet,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { useSimpleApp } from '../SimpleContext.tsx';
import { Driver, DriverStatus } from '../types.ts';

export const SimpleDrivers: React.FC = () => {
  const {
    drivers,
    trucks,
    addDriver,
    updateDriver,
    deleteDriver,
    quickAddDriverExpense,
    settings,
    formatSAR,
    language,
  } = useSimpleApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DriverStatus>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Overtime Quick Modal
  const [overtimeModalDriver, setOvertimeModalDriver] = useState<Driver | null>(null);
  const [overtimeHours, setOvertimeHours] = useState<number>(4);

  // Success action notification
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Driver Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [iqamaNumber, setIqamaNumber] = useState('');
  const [assignedTruck, setAssignedTruck] = useState('');
  const [monthlySalary, setMonthlySalary] = useState<number>(4000);
  const [dailyFoodAllowance, setDailyFoodAllowance] = useState<number>(
    settings.defaultDailyFood || 25
  );
  const [monthlyMobileAllowance, setMonthlyMobileAllowance] = useState<number>(
    settings.defaultMonthlyMobile || 120
  );
  const [overtimeRate, setOvertimeRate] = useState<number>(20);
  const [status, setStatus] = useState<DriverStatus>('Active');
  const [notes, setNotes] = useState('');

  const triggerSuccessToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setName('');
    setPhone('+966 5');
    setIqamaNumber('');
    setAssignedTruck(trucks[0]?.truckNumber || 'BT-01');
    setMonthlySalary(4000);
    setDailyFoodAllowance(settings.defaultDailyFood || 25);
    setMonthlyMobileAllowance(settings.defaultMonthlyMobile || 120);
    setOvertimeRate(20);
    setStatus('Active');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setEditingDriver(d);
    setName(d.name);
    setPhone(d.phone);
    setIqamaNumber(d.iqamaNumber);
    setAssignedTruck(d.assignedTruck);
    setMonthlySalary(d.monthlySalary);
    setDailyFoodAllowance(d.dailyFoodAllowance);
    setMonthlyMobileAllowance(d.monthlyMobileAllowance);
    setOvertimeRate(d.overtimeRate);
    setStatus(d.status);
    setNotes(d.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        language === 'ar'
          ? 'هل أنت متأكد من حذف هذا السائق؟'
          : 'Are you sure you want to delete this driver?'
      )
    ) {
      deleteDriver(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: Omit<Driver, 'id'> = {
      name: name.trim(),
      phone: phone.trim(),
      iqamaNumber: iqamaNumber.trim(),
      assignedTruck,
      monthlySalary: Number(monthlySalary),
      dailyFoodAllowance: Number(dailyFoodAllowance),
      monthlyMobileAllowance: Number(monthlyMobileAllowance),
      overtimeRate: Number(overtimeRate),
      status,
      notes: notes.trim(),
    };

    if (editingDriver) {
      updateDriver(editingDriver.id, data);
    } else {
      addDriver(data);
    }
    setIsModalOpen(false);
  };

  const handleQuickFood = (d: Driver) => {
    quickAddDriverExpense(d.id, 'food');
    triggerSuccessToast(
      language === 'ar'
        ? `تم إضافة مصروف إعاشة يومية (${d.dailyFoodAllowance} ر.س) لـ ${d.name} (${d.assignedTruck})`
        : `Added Food expense (${d.dailyFoodAllowance} SAR) for ${d.name} (${d.assignedTruck})`
    );
  };

  const handleQuickMobile = (d: Driver) => {
    quickAddDriverExpense(d.id, 'mobile');
    triggerSuccessToast(
      language === 'ar'
        ? `تم إضافة بدل جوال شهري (${d.monthlyMobileAllowance} ر.س) لـ ${d.name} (${d.assignedTruck})`
        : `Added Mobile allowance (${d.monthlyMobileAllowance} SAR) for ${d.name} (${d.assignedTruck})`
    );
  };

  const handleOpenOvertime = (d: Driver) => {
    setOvertimeModalDriver(d);
    setOvertimeHours(4);
  };

  const handleConfirmOvertime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overtimeModalDriver || overtimeHours <= 0) return;

    const totalCost = overtimeHours * overtimeModalDriver.overtimeRate;
    quickAddDriverExpense(overtimeModalDriver.id, 'overtime', overtimeHours);
    triggerSuccessToast(
      language === 'ar'
        ? `تم تسجيل ${overtimeHours} ساعات إضافي (${totalCost} ر.س) لـ ${overtimeModalDriver.name}`
        : `Logged ${overtimeHours} hrs Overtime (${totalCost} SAR) for ${overtimeModalDriver.name}`
    );
    setOvertimeModalDriver(null);
  };

  // Filtered drivers
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      d.iqamaNumber.includes(searchTerm) ||
      d.assignedTruck.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalMonthlySalary = drivers
    .filter((d) => d.status === 'Active')
    .reduce((sum, d) => sum + Number(d.monthlySalary || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast notification */}
      {actionSuccess && (
        <div className="fixed top-16 start-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'سجل السائقين والمشغلين' : 'Drivers & Operators'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'إدارة مشغلي الرافعات، الإقامات، الرواتب، وبدلات الإعاشة وتسجيل العمل الإضافي السريع'
              : 'Driver roster, Iqama records, monthly salaries, food & mobile allowances, and quick overtime logs'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? '+ إضافة سائق جديد' : '+ Add Driver'}</span>
        </button>
      </div>

      {/* Top Roster Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {language === 'ar' ? 'إجمالي السائقين' : 'Total Drivers'}
            </span>
            <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{drivers.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {language === 'ar' ? 'السائقين النشطين بالميدان' : 'Active On Duty'}
            </span>
            <p className="text-xl font-black text-emerald-700 font-mono mt-0.5">
              {drivers.filter((d) => d.status === 'Active').length}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {language === 'ar' ? 'إجمالي الرواتب الشهرية' : 'Monthly Payroll Base'}
            </span>
            <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
              {formatSAR(totalMonthlySalary)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'ar'
                ? 'بحث باسم السائق، الجوال، الإقامة، أو رقم الرافعة...'
                : 'Search driver name, phone, Iqama, truck...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-9 pe-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
        >
          <option value="All">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
          <option value="Active">{language === 'ar' ? 'نشط (Active)' : 'Active'}</option>
          <option value="On Leave">{language === 'ar' ? 'في إجازة (On Leave)' : 'On Leave'}</option>
          <option value="Inactive">{language === 'ar' ? 'غير نشط (Inactive)' : 'Inactive'}</option>
        </select>
      </div>

      {/* Drivers Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDrivers.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            {/* Top row: Name, status, phone, truck */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    {d.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-bold text-slate-700">{d.assignedTruck}</span>
                      </span>
                      <span>•</span>
                      <span>Iqama: <span className="font-mono">{d.iqamaNumber}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.status === 'On Leave'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {d.status}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(d)}
                    className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الراتب الأساسي' : 'Salary'}</span>
                  <span className="font-mono font-bold text-slate-800">{formatSAR(d.monthlySalary)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'إعاشة يومية' : 'Daily Food'}</span>
                  <span className="font-mono font-bold text-slate-800">{d.dailyFoodAllowance} SAR</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'جوال شهري' : 'Mobile'}</span>
                  <span className="font-mono font-bold text-slate-800">{d.monthlyMobileAllowance} SAR</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'ساعة الإضافي' : 'OT Rate'}</span>
                  <span className="font-mono font-bold text-slate-800">{d.overtimeRate} SAR/h</span>
                </div>
              </div>

              {d.notes && <p className="text-[11px] text-slate-500 mt-2 truncate">{d.notes}</p>}
            </div>

            {/* Quick Actions Bar (Add Food, Add Mobile, Add Overtime) */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {language === 'ar' ? 'تسجيل مصاريف سريعة للسائق:' : 'Quick Operational Actions:'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Add Food Expense (+25 SAR) */}
                <button
                  onClick={() => handleQuickFood(d)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-bold transition-colors"
                >
                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                  <span>+{d.dailyFoodAllowance} SAR {language === 'ar' ? 'إعاشة' : 'Food'}</span>
                </button>

                {/* 2. Add Mobile Expense (+120 SAR) */}
                <button
                  onClick={() => handleQuickMobile(d)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 rounded-xl text-[11px] font-bold transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-cyan-600" />
                  <span>+{d.monthlyMobileAllowance} SAR {language === 'ar' ? 'جوال' : 'Mobile'}</span>
                </button>

                {/* 3. Add Overtime Prompt */}
                <button
                  onClick={() => handleOpenOvertime(d)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 rounded-xl text-[11px] font-bold transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-pink-600" />
                  <span>+ {language === 'ar' ? 'ساعات إضافي' : 'Overtime'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingDriver
                ? language === 'ar'
                  ? `تعديل بيانات السائق (${editingDriver.name})`
                  : `Edit Driver (${editingDriver.name})`
                : language === 'ar'
                ? 'إضافة سائق جديد'
                : 'Add New Driver'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم السائق' : 'Driver Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed Al-Ghamdi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم الجوال' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+966 5x xxx xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم الإقامة' : 'Iqama Number'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2xxxxxxxxxx"
                    value={iqamaNumber}
                    onChange={(e) => setIqamaNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الرافعة المخصصة' : 'Assigned Truck'}
                  </label>
                  <select
                    value={assignedTruck}
                    onChange={(e) => setAssignedTruck(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    {trucks.map((t) => (
                      <option key={t.id} value={t.truckNumber}>
                        {t.truckNumber} ({t.plateNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الراتب (SAR)' : 'Salary (SAR)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'إعاشة يومية' : 'Daily Food (SAR)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dailyFoodAllowance}
                    onChange={(e) => setDailyFoodAllowance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'جوال شهري' : 'Mobile (SAR)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyMobileAllowance}
                    onChange={(e) => setMonthlyMobileAllowance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'سعر ساعة الإضافي (SAR)' : 'Overtime Rate (SAR/hr)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={overtimeRate}
                    onChange={(e) => setOvertimeRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DriverStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    <option value="Active">{language === 'ar' ? 'نشط (Active)' : 'Active'}</option>
                    <option value="On Leave">{language === 'ar' ? 'في إجازة (On Leave)' : 'On Leave'}</option>
                    <option value="Inactive">{language === 'ar' ? 'غير نشط (Inactive)' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'ملاحظات وتراخيص أرامكو' : 'Notes & Certifications (e.g. Aramco)'}
                </label>
                <textarea
                  rows={2}
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
                  {language === 'ar' ? 'حفظ السائق' : 'Save Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Overtime Modal */}
      {overtimeModalDriver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-600" />
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'تسجيل عمل إضافي' : 'Log Driver Overtime'}
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? `تسجيل ساعات عمل إضافي للسائق: ${overtimeModalDriver.name} على رافعة (${overtimeModalDriver.assignedTruck})`
                : `Log overtime hours for ${overtimeModalDriver.name} on truck (${overtimeModalDriver.assignedTruck})`}
            </p>

            <form onSubmit={handleConfirmOvertime} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'عدد ساعات العمل الإضافي' : 'Overtime Hours'}
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>

              {/* Calculated Summary */}
              <div className="p-3 bg-pink-50 rounded-xl border border-pink-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">{language === 'ar' ? 'سعر الساعة:' : 'Rate/hr:'}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {overtimeModalDriver.overtimeRate} SAR
                  </span>
                </div>
                <div className="flex justify-between font-bold text-pink-900 pt-1 border-t border-pink-200">
                  <span>{language === 'ar' ? 'إجمالي المبلغ المصروف:' : 'Total Overtime Expense:'}</span>
                  <span className="font-mono text-sm">
                    {formatSAR(overtimeHours * overtimeModalDriver.overtimeRate)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOvertimeModalDriver(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold"
                >
                  {language === 'ar' ? 'تسجيل المصروف' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
