import React, { useState } from 'react';
import { Plus, Search, Receipt, Edit2, Trash2, Filter, Truck, Calendar } from 'lucide-react';
import { useSimpleApp } from '../SimpleContext.tsx';
import { Expense, ExpenseType } from '../types.ts';
import { EXPENSE_COLORS, EXPENSE_TYPES } from '../mockData.ts';

export const SimpleExpenses: React.FC = () => {
  const { expenses, trucks, addExpense, updateExpense, deleteExpense, formatSAR, language } =
    useSimpleApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTruck, setFilterTruck] = useState('all');
  const [filterType, setFilterType] = useState<'all' | ExpenseType>('all');
  const [filterMonth, setFilterMonth] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [truckNumber, setTruckNumber] = useState(trucks[0]?.truckNumber || 'BT-01');
  const [driverName, setDriverName] = useState(trucks[0]?.driverName || '');
  const [expenseType, setExpenseType] = useState<ExpenseType>('Fuel');
  const [amount, setAmount] = useState<number | ''>(500);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Extract unique months (YYYY-MM)
  const months = Array.from(new Set(expenses.map((e) => e.date.substring(0, 7))))
    .sort()
    .reverse();

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchSearch =
      (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTruck = filterTruck === 'all' || e.truckNumber === filterTruck;
    const matchType = filterType === 'all' || e.expenseType === filterType;
    const matchMonth = filterMonth === 'all' || e.date.startsWith(filterMonth);

    return matchSearch && matchTruck && matchType && matchMonth;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const handleTruckSelect = (selectedTruckNum: string) => {
    setTruckNumber(selectedTruckNum);
    const foundTruck = trucks.find((t) => t.truckNumber === selectedTruckNum);
    if (foundTruck) {
      setDriverName(foundTruck.driverName);
    }
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setDate(new Date().toISOString().slice(0, 10));
    const defaultTruck = trucks[0]?.truckNumber || 'BT-01';
    setTruckNumber(defaultTruck);
    const foundTruck = trucks.find((t) => t.truckNumber === defaultTruck);
    setDriverName(foundTruck ? foundTruck.driverName : '');
    setExpenseType('Fuel');
    setAmount(500);
    setDescription('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: Expense) => {
    setEditingExpense(e);
    setDate(e.date);
    setTruckNumber(e.truckNumber);
    setDriverName(e.driverName);
    setExpenseType(e.expenseType);
    setAmount(e.amount);
    setDescription(e.description);
    setNotes(e.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        language === 'ar'
          ? 'هل أنت متأكد من حذف هذا المصروف؟'
          : 'Are you sure you want to delete this expense record?'
      )
    ) {
      deleteExpense(id);
    }
  };

  const handleSave = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!truckNumber || !driverName || amount === '' || Number(amount) <= 0) return;

    const data: Omit<Expense, 'id'> = {
      date,
      truckNumber,
      driverName,
      expenseType,
      amount: Number(amount),
      description: description.trim() || `${expenseType} cost`,
      notes: notes.trim(),
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, data);
    } else {
      addExpense(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'سجل المصاريف والتشغيل' : 'Operational Expenses'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'تسجيل ومتابعة مصاريف الوقود، الإعاشة، الجوال، الصيانة، والإطارات والعمل الإضافي'
              : 'Record and track fuel, food, mobile, maintenance, tyres, washing, and overtime costs'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? '+ تسجيل مصروف جديد' : '+ Add Expense'}</span>
        </button>
      </div>

      {/* Total Expenses Banner & Category Quick Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {language === 'ar' ? 'إجمالي المصاريف المعروضة' : 'Total Filtered Expenses'}
            </span>
            <p className="text-2xl font-black text-rose-700 font-mono tracking-tight mt-0.5">
              {formatSAR(totalFilteredAmount)}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-mono self-start sm:self-auto">
            {filteredExpenses.length} {language === 'ar' ? 'بند مصروف' : 'items'}
          </span>
        </div>

        {/* Category Badges Filter Bar */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All Types'}
          </button>
          {EXPENSE_TYPES.map((type) => {
            const isSelected = filterType === type;
            const count = expenses.filter((e) => e.expenseType === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: EXPENSE_COLORS[type] }}
                />
                <span>{type}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters: Search, Truck, Month */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'ar'
                ? 'بحث بالوصف، اسم السائق، رقم الرافعة، أو نوع المصروف...'
                : 'Search description, driver, truck, expense type...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-9 pe-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Truck Filter */}
          <select
            value={filterTruck}
            onChange={(e) => setFilterTruck(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="all">{language === 'ar' ? 'جميع الرافعات' : 'All Trucks'}</option>
            {trucks.map((t) => (
              <option key={t.id} value={t.truckNumber}>
                {t.truckNumber} ({t.plateNumber})
              </option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="all">{language === 'ar' ? 'جميع الشهور' : 'All Months'}</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3.5">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="p-3.5">{language === 'ar' ? 'الرافعة والسائق' : 'Truck & Driver'}</th>
                <th className="p-3.5">{language === 'ar' ? 'نوع المصروف' : 'Expense Type'}</th>
                <th className="p-3.5">{language === 'ar' ? 'الوصف والتفاصيل' : 'Description'}</th>
                <th className="p-3.5">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                <th className="p-3.5 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {language === 'ar'
                      ? 'لا توجد مصاريف مطابقة لخيارات البحث'
                      : 'No expenses found matching the criteria'}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">{exp.date}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{exp.truckNumber}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{exp.driverName}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${EXPENSE_COLORS[exp.expenseType]}15`,
                          color: EXPENSE_COLORS[exp.expenseType],
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: EXPENSE_COLORS[exp.expenseType] }}
                        />
                        <span>{exp.expenseType}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-sm">
                      <p className="truncate font-medium">{exp.description}</p>
                      {exp.notes && (
                        <p className="text-[10px] text-slate-400 truncate">{exp.notes}</p>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-rose-700 whitespace-nowrap text-sm">
                      {formatSAR(exp.amount)}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
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

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingExpense
                ? language === 'ar'
                  ? 'تعديل بيانات المصروف'
                  : 'Edit Expense'
                : language === 'ar'
                ? 'تسجيل مصروف جديد'
                : 'Add New Expense'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نوع المصروف' : 'Expense Type'}
                  </label>
                  <select
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    {EXPENSE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الرافعة' : 'Truck'}
                  </label>
                  <select
                    value={truckNumber}
                    onChange={(e) => handleTruckSelect(e.target.value)}
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
                    {language === 'ar' ? 'السائق' : 'Driver'}
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
                  {language === 'ar' ? 'المبلغ (SAR)' : 'Amount (SAR)'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 850"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'الوصف والتفاصيل' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diesel full tank - SASCO Ring road"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'ملاحظات ورقم الفاتورة/السند' : 'Notes / Receipt Reference'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Workshop invoice #4412"
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
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {language === 'ar' ? 'حفظ المصروف' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
