import React, { useState } from 'react';
import {
  ArrowLeft,
  Truck as TruckIcon,
  User,
  Shield,
  Receipt,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  Wallet,
  Calendar,
  AlertCircle,
  FileText,
  Percent,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useSimpleApp } from '../SimpleContext.tsx';
import { EXPENSE_COLORS, EXPENSE_TYPES } from '../mockData.ts';
import { ExpenseType, InvoiceStatus } from '../types.ts';

export const SimpleTruckDetail: React.FC = () => {
  const {
    trucks,
    selectedTruckId,
    setSelectedTruckId,
    invoices,
    expenses,
    addInvoice,
    deleteInvoice,
    toggleInvoiceStatus,
    addExpense,
    deleteExpense,
    formatSAR,
    language,
  } = useSimpleApp();

  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'summary'>('invoices');

  // Modals
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // New Invoice Form
  const [invNumber, setInvNumber] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().slice(0, 10));
  const [invCustomer, setInvCustomer] = useState('');
  const [invDescription, setInvDescription] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invStatus, setInvStatus] = useState<InvoiceStatus>('Pending');

  // New Expense Form
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expType, setExpType] = useState<ExpenseType>('Fuel');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const truck = trucks.find((t) => t.id === selectedTruckId);

  if (!truck) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500 text-sm">
          {language === 'ar' ? 'لم يتم العثور على الرافعة المطلوبة' : 'Truck not found'}
        </p>
        <button
          onClick={() => setSelectedTruckId(null)}
          className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
        >
          {language === 'ar' ? 'العودة لقائمة الرافعات' : 'Back to Trucks'}
        </button>
      </div>
    );
  }

  // Financial calculations for this truck
  const truckInvoices = invoices.filter((inv) => inv.truckNumber === truck.truckNumber);
  const truckExpenses = expenses.filter((exp) => exp.truckNumber === truck.truckNumber);

  const totalRevenue = truckInvoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  const pendingAmount = truckInvoices
    .filter((inv) => inv.status === 'Pending')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  const totalExpenses = truckExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  const netProfit = totalRevenue - totalExpenses;

  // Profit Split
  const isShared = truck.ownershipType === 'Shared';
  const sharePercent = truck.sharePercent || 0;
  const ownerShareAmount = isShared && netProfit > 0 ? (netProfit * sharePercent) / 100 : 0;
  const companyShareAmount = isShared
    ? netProfit > 0
      ? (netProfit * (100 - sharePercent)) / 100
      : netProfit
    : netProfit;

  // Truck Expense Breakdown (Donut Chart)
  const categoryTotals: Record<string, number> = {};
  EXPENSE_TYPES.forEach((t) => (categoryTotals[t] = 0));
  truckExpenses.forEach((e) => {
    if (categoryTotals[e.expenseType] !== undefined) {
      categoryTotals[e.expenseType] += Number(e.amount || 0);
    } else {
      categoryTotals['Other'] = (categoryTotals['Other'] || 0) + Number(e.amount || 0);
    }
  });

  const truckPieData = Object.entries(categoryTotals)
    .filter(([_, val]) => val > 0)
    .map(([cat, val]) => ({
      name: cat,
      value: val,
      color: EXPENSE_COLORS[cat as ExpenseType] || '#6B7280',
    }));

  // Truck Revenue vs Expense Timeline (Line/Area Chart)
  const truckDateMap: Record<string, { date: string; revenue: number; expenses: number }> = {};
  truckInvoices.forEach((inv) => {
    if (inv.status === 'Paid') {
      if (!truckDateMap[inv.date]) {
        truckDateMap[inv.date] = { date: inv.date, revenue: 0, expenses: 0 };
      }
      truckDateMap[inv.date].revenue += Number(inv.amount || 0);
    }
  });

  truckExpenses.forEach((exp) => {
    if (!truckDateMap[exp.date]) {
      truckDateMap[exp.date] = { date: exp.date, revenue: 0, expenses: 0 };
    }
    truckDateMap[exp.date].expenses += Number(exp.amount || 0);
  });

  const truckTimelineData = Object.values(truckDateMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      date: item.date.slice(5),
      Revenue: item.revenue,
      Expenses: item.expenses,
      'Net Profit': item.revenue - item.expenses,
    }));

  const chartTimeline =
    truckTimelineData.length > 0
      ? truckTimelineData
      : [
          { date: 'Start', Revenue: 0, Expenses: 0, 'Net Profit': 0 },
          { date: 'End', Revenue: 0, Expenses: 0, 'Net Profit': 0 },
        ];

  // Handlers
  const handleOpenAddInvoice = () => {
    setInvNumber(`#${Math.floor(1000 + Math.random() * 9000)}`);
    setInvDate(new Date().toISOString().slice(0, 10));
    setInvCustomer('');
    setInvDescription('');
    setInvAmount('');
    setInvStatus('Paid');
    setShowAddInvoiceModal(true);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invCustomer.trim() || !invAmount) return;

    addInvoice({
      invoiceNumber: invNumber || `#${Date.now().toString().slice(-4)}`,
      date: invDate,
      truckNumber: truck.truckNumber,
      driverName: truck.driverName,
      customerName: invCustomer.trim(),
      jobDescription: invDescription.trim() || 'Boom truck lift operation',
      amount: Number(invAmount),
      status: invStatus,
    });
    setShowAddInvoiceModal(false);
  };

  const handleOpenAddExpense = () => {
    setExpDate(new Date().toISOString().slice(0, 10));
    setExpType('Fuel');
    setExpAmount('');
    setExpDesc('');
    setShowAddExpenseModal(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount) return;

    addExpense({
      date: expDate,
      truckNumber: truck.truckNumber,
      driverName: truck.driverName,
      expenseType: expType,
      amount: Number(expAmount),
      description: expDesc.trim() || `${expType} expense`,
    });
    setShowAddExpenseModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Back Button & Truck Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTruckId(null)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {truck.truckNumber}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-700">
                  {truck.plateNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                    truck.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : truck.status === 'Maintenance'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {truck.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
                  {truck.ownershipType} {truck.sharePercent > 0 ? `(${truck.sharePercent}%)` : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ar'
                  ? `السائق: ${truck.driverName} · المالك: ${truck.ownerName || 'الشركة'} · ${
                      truck.notes || ''
                    }`
                  : `Driver: ${truck.driverName} · Owner: ${truck.ownerName || 'Company'} · ${
                      truck.notes || ''
                    }`}
              </p>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleOpenAddInvoice}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? '+ فاتورة' : '+ Invoice'}</span>
            </button>
            <button
              onClick={handleOpenAddExpense}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? '+ مصروف' : '+ Expense'}</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards for this truck */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Revenue */}
          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">
              {language === 'ar' ? 'الإيرادات المحصلة' : 'Revenue'}
            </span>
            <p className="text-xl font-black text-emerald-700 font-mono mt-1">
              {formatSAR(totalRevenue)}
            </p>
            <span className="text-[10px] text-emerald-600">
              {truckInvoices.filter((i) => i.status === 'Paid').length}{' '}
              {language === 'ar' ? 'فواتير مدفوعة' : 'paid invoices'}
            </span>
          </div>

          {/* Expenses */}
          <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200">
            <span className="text-[11px] font-bold text-rose-800 uppercase block">
              {language === 'ar' ? 'إجمالي المصاريف' : 'Expenses'}
            </span>
            <p className="text-xl font-black text-rose-700 font-mono mt-1">
              {formatSAR(totalExpenses)}
            </p>
            <span className="text-[10px] text-rose-600">
              {truckExpenses.length} {language === 'ar' ? 'بنود مصروفات' : 'expense entries'}
            </span>
          </div>

          {/* Net Profit */}
          <div
            className={`p-3.5 rounded-xl border ${
              netProfit >= 0
                ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                : 'bg-rose-50/60 border-rose-200 text-rose-900'
            }`}
          >
            <span className="text-[11px] font-bold uppercase block">
              {language === 'ar' ? 'صافي الربح' : 'Net Profit'}
            </span>
            <p
              className={`text-xl font-black font-mono mt-1 ${
                netProfit >= 0 ? 'text-blue-800' : 'text-rose-700'
              }`}
            >
              {formatSAR(netProfit)}
            </p>
            <span className="text-[10px] text-slate-500">
              {language === 'ar' ? 'الإيراد - المصروف' : 'Revenue - Expenses'}
            </span>
          </div>

          {/* Pending Amount */}
          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 uppercase block">
              {language === 'ar' ? 'مستحقات معلقة' : 'Pending Amount'}
            </span>
            <p className="text-xl font-black text-amber-700 font-mono mt-1">
              {formatSAR(pendingAmount)}
            </p>
            <span className="text-[10px] text-amber-600">
              {truckInvoices.filter((i) => i.status === 'Pending').length}{' '}
              {language === 'ar' ? 'فواتير قيد التحصيل' : 'pending invoices'}
            </span>
          </div>
        </div>

        {/* Profit Split Card (Important for Saudi boom truck partnership models) */}
        <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left rtl:sm:text-right">
            <div className="flex items-center gap-2 justify-center sm:justify-start rtl:sm:justify-start">
              <Percent className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                {language === 'ar' ? 'توزيع الأرباح وحصة الشريك' : 'Profit Split Distribution'}
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              {isShared
                ? language === 'ar'
                  ? `المالك: ${truck.ownerName || 'الشريك'} له نسبة ${sharePercent}% من صافي الأرباح`
                  : `Owner (${truck.ownerName || 'Partner'}) holds ${sharePercent}% share of net profit`
                : language === 'ar'
                ? 'شاحنة مملوكة للشركة بنسبة 100%'
                : '100% Company owned boom truck'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {isShared ? (
              <>
                <div className="text-right rtl:text-left">
                  <span className="text-[11px] text-amber-400 font-bold block">
                    {language === 'ar'
                      ? `حصة المالك (${sharePercent}%)`
                      : `Owner Share (${sharePercent}%)`}
                  </span>
                  <span className="text-base font-black font-mono text-white">
                    {formatSAR(ownerShareAmount)}
                  </span>
                </div>
                <div className="text-right rtl:text-left">
                  <span className="text-[11px] text-emerald-400 font-bold block">
                    {language === 'ar'
                      ? `حصة الشركة (${100 - sharePercent}%)`
                      : `Company Share (${100 - sharePercent}%)`}
                  </span>
                  <span className="text-base font-black font-mono text-white">
                    {formatSAR(companyShareAmount)}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-right rtl:text-left">
                <span className="text-[11px] text-emerald-400 font-bold block">
                  {language === 'ar' ? 'أرباح الشركة بالكامل (100%)' : 'Company Retained (100%)'}
                </span>
                <span className="text-base font-black font-mono text-white">
                  {formatSAR(companyShareAmount)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Truck Interactive Charts: Revenue vs Expenses Graph & Expense Breakdown Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Truck Revenue vs Expense Graph */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'ar'
                    ? `مسار الإيرادات والمصروفات للرافعة (${truck.truckNumber})`
                    : `Revenue vs Expenses Trend (${truck.truckNumber})`}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'متابعة الأداء المالي المستقل لهذه الرافعة'
                  : 'Independent performance tracking over time for this specific boom truck'}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono">
              SAR
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="trkColorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="trkColorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString()} SAR`, '']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trkColorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="Expenses"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trkColorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Truck Expense Breakdown (Donut Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>{language === 'ar' ? 'توزيع مصاريف الرافعة' : 'Truck Expense Breakdown'}</span>
              </h3>
              <span className="text-xs font-mono font-bold text-rose-700">
                {formatSAR(totalExpenses)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'الوقود، الصيانة، الإطارات، الإعاشة، الجوال...'
                : 'Fuel, maintenance, tyres, food, mobile, overtime...'}
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {truckPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={truckPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {truckPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} SAR`, 'Amount']}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">
                {language === 'ar' ? 'لا توجد مصاريف لهذه الرافعة' : 'No expenses recorded yet'}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-2 grid grid-cols-2 gap-1 text-[11px]">
            {truckPieData.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-slate-600 truncate">{p.name}:</span>
                <span className="font-mono font-bold text-slate-800">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'border-amber-600 text-amber-700 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>
            {language === 'ar' ? 'فواتير الرافعة' : 'Invoices'} ({truckInvoices.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'expenses'
              ? 'border-amber-600 text-amber-700 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>
            {language === 'ar' ? 'مصاريف الرافعة' : 'Expenses'} ({truckExpenses.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'border-amber-600 text-amber-700 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{language === 'ar' ? 'الملخص المالي' : 'Financial Statement'}</span>
        </button>
      </div>

      {/* Tab 1: Invoices for this truck */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">
              {language === 'ar' ? 'سجل فواتير هذه الرافعة' : 'Invoices List for ' + truck.truckNumber}
            </h3>
            <button
              onClick={handleOpenAddInvoice}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
            >
              {language === 'ar' ? '+ إضافة فاتورة' : '+ Add Invoice'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5">{language === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'الوصف' : 'Description'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="p-3.5 text-center">{language === 'ar' ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {truckInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      {language === 'ar' ? 'لا توجد فواتير مسجلة لهذه الرافعة' : 'No invoices for this truck'}
                    </td>
                  </tr>
                ) : (
                  truckInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-slate-900">{inv.invoiceNumber}</td>
                      <td className="p-3.5 text-slate-500">{inv.date}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{inv.customerName}</td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">{inv.jobDescription}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {formatSAR(inv.amount)}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => toggleInvoiceStatus(inv.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {inv.status === 'Paid'
                            ? language === 'ar'
                              ? '✓ مدفوعة'
                              : '✓ Paid'
                            : language === 'ar'
                            ? '⏳ معلقة'
                            : '⏳ Pending'}
                        </button>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => deleteInvoice(inv.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Expenses for this truck */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">
              {language === 'ar' ? 'سجل مصاريف هذه الرافعة' : 'Expenses List for ' + truck.truckNumber}
            </h3>
            <button
              onClick={handleOpenAddExpense}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
            >
              {language === 'ar' ? '+ إضافة مصروف' : '+ Add Expense'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'النوع' : 'Expense Type'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'الوصف' : 'Description'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="p-3.5 text-center">{language === 'ar' ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {truckExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      {language === 'ar' ? 'لا توجد مصاريف مسجلة لهذه الرافعة' : 'No expenses for this truck'}
                    </td>
                  </tr>
                ) : (
                  truckExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 text-slate-500">{exp.date}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">
                          {exp.expenseType}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700">{exp.description}</td>
                      <td className="p-3.5 font-mono font-bold text-rose-700">
                        {formatSAR(exp.amount)}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Summary & Breakdown */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ar' ? 'بيان الحساب المالي للرافعة' : 'Financial Statement Overview'}
            </h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-2">
                <span className="text-slate-600">
                  {language === 'ar' ? 'إجمالي المبالغ المحصلة (إيراد):' : 'Total Revenue Collected:'}
                </span>
                <span className="font-mono font-bold text-emerald-700">{formatSAR(totalRevenue)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">
                  {language === 'ar' ? 'إجمالي المصاريف التشغيلية:' : 'Total Operating Expenses:'}
                </span>
                <span className="font-mono font-bold text-rose-700">{formatSAR(totalExpenses)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-sm bg-slate-50 px-2 rounded-lg">
                <span className="text-slate-900">
                  {language === 'ar' ? 'صافي الربح المتبقي:' : 'Net Operating Profit:'}
                </span>
                <span className={netProfit >= 0 ? 'text-emerald-700 font-mono' : 'text-rose-700 font-mono'}>
                  {formatSAR(netProfit)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">
                  {language === 'ar' ? 'المطالبات المعلقة (غير محصلة):' : 'Pending Receivables:'}
                </span>
                <span className="font-mono font-bold text-amber-700">{formatSAR(pendingAmount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ar' ? 'حساب نسب الشراكة وتوزيع الأرباح' : 'Partnership Profit Calculation'}
            </h3>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-2">
              <p className="text-amber-900 font-medium">
                {language === 'ar'
                  ? `نوع الملكية: ${truck.ownershipType} (${truck.sharePercent}% حصة المالك)`
                  : `Ownership: ${truck.ownershipType} (${truck.sharePercent}% owner share)`}
              </p>
              <div className="pt-2 border-t border-amber-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{language === 'ar' ? 'مستحق المالك الشريك:' : 'Owner Payout:'}</span>
                  <span className="font-mono text-amber-900">{formatSAR(ownerShareAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{language === 'ar' ? 'أرباح الشركة المحتجزة:' : 'Company Retained:'}</span>
                  <span className="font-mono text-emerald-800">{formatSAR(companyShareAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {language === 'ar' ? `إضافة فاتورة جديدة (${truck.truckNumber})` : `Add Invoice for ${truck.truckNumber}`}
            </h3>
            <form onSubmit={handleSaveInvoice} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={invNumber}
                    onChange={(e) => setInvNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
                  placeholder="e.g. Al-Bawani Contracting"
                  value={invCustomer}
                  onChange={(e) => setInvCustomer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'وصف العملية والعمل' : 'Job Description'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 hours concrete truss hoist"
                  value={invDescription}
                  onChange={(e) => setInvDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'المبلغ (SAR)' : 'Amount (SAR)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5000"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value as InvoiceStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    <option value="Paid">{language === 'ar' ? 'مدفوعة (تم الاستلام)' : 'Paid'}</option>
                    <option value="Pending">{language === 'ar' ? 'معلقة (آجل)' : 'Pending'}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
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

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {language === 'ar' ? `إضافة مصروف جديد (${truck.truckNumber})` : `Add Expense for ${truck.truckNumber}`}
            </h3>
            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نوع المصروف' : 'Expense Type'}
                  </label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as ExpenseType)}
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

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'المبلغ (SAR)' : 'Amount (SAR)'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 850"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'الوصف والتفاصيل' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diesel full tank - SASCO Station"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
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
