import React, { useState } from 'react';
import {
  TrendingUp,
  Receipt,
  Wallet,
  Clock,
  Truck as TruckIcon,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  Filter,
  DollarSign,
  AlertCircle,
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
  BarChart,
  Bar,
} from 'recharts';
import { useSimpleApp } from '../SimpleContext.tsx';
import { EXPENSE_COLORS, EXPENSE_TYPES } from '../mockData.ts';
import { DateFilterPreset, ExpenseType } from '../types.ts';

export const SimpleDashboard: React.FC = () => {
  const {
    trucks,
    expenses,
    invoices,
    dateFilter,
    setDateFilter,
    isDateInFilter,
    formatSAR,
    language,
    setActiveSection,
    setSelectedTruckId,
  } = useSimpleApp();

  const [selectedPieCategory, setSelectedPieCategory] = useState<string | null>(null);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  // Filter invoices & expenses based on date filter
  const currentInvoices = invoices.filter((i) => isDateInFilter(i.date));
  const currentExpenses = expenses.filter((e) => isDateInFilter(e.date));

  // 1. KPI Cards calculations
  const totalPaidRevenue = currentInvoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  const totalPendingInvoices = currentInvoices
    .filter((inv) => inv.status === 'Pending')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  const totalExpensesAmount = currentExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );

  const netProfit = totalPaidRevenue - totalExpensesAmount;

  const activeTrucksCount = trucks.filter((t) => t.status === 'Active').length;

  const totalJobsCount = currentInvoices.filter((i) => i.status === 'Paid').length;

  // 2. Chart 1: Revenue vs Expenses vs Net Profit over time
  // Group by date
  const dateMap: Record<string, { date: string; revenue: number; expenses: number }> = {};

  currentInvoices.forEach((inv) => {
    if (inv.status === 'Paid') {
      if (!dateMap[inv.date]) {
        dateMap[inv.date] = { date: inv.date, revenue: 0, expenses: 0 };
      }
      dateMap[inv.date].revenue += Number(inv.amount || 0);
    }
  });

  currentExpenses.forEach((exp) => {
    if (!dateMap[exp.date]) {
      dateMap[exp.date] = { date: exp.date, revenue: 0, expenses: 0 };
    }
    dateMap[exp.date].expenses += Number(exp.amount || 0);
  });

  // Sort chronological
  const timelineData = Object.values(dateMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      date: item.date.slice(5), // MM-DD
      fullDate: item.date,
      Revenue: item.revenue,
      Expenses: item.expenses,
      'Net Profit': item.revenue - item.expenses,
    }));

  // Fallback data if empty range
  const chartTimeline =
    timelineData.length > 0
      ? timelineData
      : [
          { date: 'Start', Revenue: 0, Expenses: 0, 'Net Profit': 0 },
          { date: 'End', Revenue: 0, Expenses: 0, 'Net Profit': 0 },
        ];

  // 3. Chart 2: Expense Breakdown (Donut)
  const categoryTotals: Record<string, number> = {};
  EXPENSE_TYPES.forEach((t) => (categoryTotals[t] = 0));
  currentExpenses.forEach((e) => {
    if (categoryTotals[e.expenseType] !== undefined) {
      categoryTotals[e.expenseType] += Number(e.amount || 0);
    } else {
      categoryTotals['Other'] = (categoryTotals['Other'] || 0) + Number(e.amount || 0);
    }
  });

  const pieData = Object.entries(categoryTotals)
    .filter(([_, val]) => val > 0)
    .map(([cat, val]) => ({
      name: cat,
      value: val,
      color: EXPENSE_COLORS[cat as ExpenseType] || '#6B7280',
    }));

  // 4. Chart 3: Truck Profitability comparison
  const truckChartData = trucks.map((trk) => {
    const rev = currentInvoices
      .filter((inv) => inv.truckNumber === trk.truckNumber && inv.status === 'Paid')
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

    const exp = currentExpenses
      .filter((e) => e.truckNumber === trk.truckNumber)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const net = rev - exp;
    return {
      name: trk.truckNumber,
      driver: trk.driverName,
      Revenue: rev,
      Expenses: exp,
      'Net Profit': net,
    };
  });

  // Preset labels
  const filterPresets: { id: DateFilterPreset; en: string; ar: string }[] = [
    { id: 'all', en: 'All Time', ar: 'كل الفترات' },
    { id: 'today', en: 'Today', ar: 'اليوم' },
    { id: 'week', en: 'This Week', ar: 'هذا الأسبوع' },
    { id: 'month', en: 'This Month', ar: 'هذا الشهر' },
    { id: 'prev_month', en: 'Previous Month', ar: 'الشهر السابق' },
    { id: 'custom', en: 'Custom Range', ar: 'تاريخ مخصص' },
  ];

  const handlePresetSelect = (id: DateFilterPreset) => {
    if (id === 'custom') {
      setShowCustomPicker(true);
      setDateFilter({ preset: 'custom', startDate: customStart, endDate: customEnd });
    } else {
      setShowCustomPicker(false);
      setDateFilter({ preset: id });
    }
  };

  const handleApplyCustomDate = () => {
    setDateFilter({
      preset: 'custom',
      startDate: customStart,
      endDate: customEnd,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Date Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {language === 'ar' ? 'لوحة التحكم والتحليل المالي' : 'Financial Dashboard'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'متابعة حية للإيرادات والمصروفات وصافي الأرباح وأداء الأسطول في المملكة العربية السعودية'
                : 'Real-time revenue, expenses, net profit and truck fleet profitability in SAR'}
            </p>
          </div>

          {/* Date Filter Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>{language === 'ar' ? 'الفترة:' : 'Period:'}</span>
            </span>
            {filterPresets.map((p) => {
              const active = dateFilter.preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    active
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  }`}
                >
                  {language === 'ar' ? p.ar : p.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Range Picker form when selected */}
        {showCustomPicker && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">
                {language === 'ar' ? 'من تاريخ:' : 'From:'}
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">
                {language === 'ar' ? 'إلى تاريخ:' : 'To:'}
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <button
              onClick={handleApplyCustomDate}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
            >
              {language === 'ar' ? 'تطبيق التاريخ' : 'Apply Range'}
            </button>
          </div>
        )}
      </div>

      {/* 1. Summary Cards (6 required cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-emerald-700 font-mono tracking-tight">
              {formatSAR(totalPaidRevenue)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {language === 'ar' ? 'المبالغ المستلمة من الفواتير' : 'Paid customer invoices'}
            </p>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'ar' ? 'الفواتير المعلقة' : 'Pending Invoices'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-amber-700 font-mono tracking-tight">
              {formatSAR(totalPendingInvoices)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {language === 'ar' ? 'مستحقات قيد التحصيل' : 'Money to be collected'}
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-4 rounded-2xl border-2 border-rose-200 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي المصاريف' : 'Total Expenses'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-rose-700 font-mono tracking-tight">
              {formatSAR(totalExpensesAmount)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {language === 'ar' ? 'التشغيل والوقود والصيانة' : 'Operational & fleet costs'}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div
          className={`bg-white p-4 rounded-2xl border-2 shadow-2xs flex flex-col justify-between space-y-2 ${
            netProfit >= 0 ? 'border-emerald-300' : 'border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'ar' ? 'صافي الربح' : 'Net Profit'}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                netProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p
              className={`text-xl font-black font-mono tracking-tight ${
                netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatSAR(netProfit)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {language === 'ar' ? 'الإيرادات - المصاريف' : 'Revenue minus expenses'}
            </p>
          </div>
        </div>

        {/* Active Trucks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'ar' ? 'الرافعات النشطة' : 'Active Trucks'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <TruckIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 font-mono tracking-tight">
              {activeTrucksCount}{' '}
              <span className="text-xs font-normal text-slate-400">/ {trucks.length}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {language === 'ar' ? 'رافعات تعمل بالميدان' : 'Operating in sites'}
            </p>
          </div>
        </div>

        {/* Total Jobs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'ar' ? 'الأعمال المنجزة' : 'Total Jobs'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 font-mono tracking-tight">
              {totalJobsCount}{' '}
              <span className="text-xs font-normal text-slate-400">
                {language === 'ar' ? 'عمليات' : 'jobs'}
              </span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {language === 'ar' ? 'فواتير تم تحصيلها' : 'Completed paid operations'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue vs Expenses vs Net Profit Line/Area Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'ar'
                    ? 'مسار الإيرادات والمصاريف وصافي الربح'
                    : 'Revenue vs Expenses vs Net Profit'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'مؤشر أداء الأعمال لمعرفة الصعود والهبوط في الأرباح'
                  : 'Daily trend showing whether the business is gaining or dropping in profit'}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono">
              SAR
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="Expenses"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
                <Area
                  type="monotone"
                  dataKey="Net Profit"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorNet)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Breakdown Circular Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'ar' ? 'توزيع المصروفات (دونات)' : 'Expense Breakdown'}
                </span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                {formatSAR(totalExpensesAmount)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'انقر على أي فئة لمشاهدة المبلغ'
                : 'Interactive donut chart by category'}
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(data: any) => setSelectedPieCategory(data && data.name ? String(data.name) : null)}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        cursor="pointer"
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
                {language === 'ar' ? 'لا توجد مصاريف في هذه الفترة' : 'No expenses in this period'}
              </div>
            )}
          </div>

          {/* Category Click Detail or Legend */}
          <div className="border-t border-slate-100 pt-3">
            {selectedPieCategory ? (
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{selectedPieCategory}:</span>
                <span className="font-mono font-black text-amber-900">
                  {formatSAR(categoryTotals[selectedPieCategory] || 0)}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {pieData.slice(0, 4).map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-slate-600 truncate">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Truck Profitability Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-amber-600" />
              <span>
                {language === 'ar'
                  ? 'مقارنة ربحية الرافعات (BT-01, BT-02, ...)'
                  : 'Truck Profitability Comparison'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'مقارنة الإيرادات والمصاريف وصافي الربح لكل رافعة'
                : 'Compare Revenue, Expenses and Net Profit across all boom trucks in fleet'}
            </p>
          </div>
          <button
            onClick={() => setActiveSection('trucks')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{language === 'ar' ? 'عرض تفاصيل الأسطول' : 'View Trucks Roster'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={truckChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748B"
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
                  fontSize: '12px',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
              <Bar dataKey="Net Profit" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Truck Table with click-to-open Truck Detail Page */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ar' ? 'جدول أداء الرافعات' : 'Truck Performance Summary'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'انقر على أي رافعة لفتح الصفحة المالية الكاملة لها'
                : 'Click any truck to open its dedicated financial sheet and profit split'}
            </p>
          </div>
          <button
            onClick={() => setActiveSection('trucks')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800"
          >
            {language === 'ar' ? 'عرض الكل' : 'View All'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3.5">{language === 'ar' ? 'رقم الرافعة' : 'Truck'}</th>
                <th className="p-3.5">{language === 'ar' ? 'السائق' : 'Driver'}</th>
                <th className="p-3.5">{language === 'ar' ? 'المالك والنسبة' : 'Ownership'}</th>
                <th className="p-3.5 text-emerald-700">
                  {language === 'ar' ? 'الإيرادات' : 'Revenue'}
                </th>
                <th className="p-3.5 text-rose-700">
                  {language === 'ar' ? 'المصاريف' : 'Expenses'}
                </th>
                <th className="p-3.5 font-black text-slate-900">
                  {language === 'ar' ? 'صافي الربح' : 'Net Profit'}
                </th>
                <th className="p-3.5 text-center">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {trucks.map((trk) => {
                const trkRev = currentInvoices
                  .filter((inv) => inv.truckNumber === trk.truckNumber && inv.status === 'Paid')
                  .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

                const trkExp = currentExpenses
                  .filter((exp) => exp.truckNumber === trk.truckNumber)
                  .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

                const trkNet = trkRev - trkExp;

                return (
                  <tr
                    key={trk.id}
                    onClick={() => {
                      setSelectedTruckId(trk.id);
                      setActiveSection('trucks');
                    }}
                    className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <TruckIcon className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{trk.truckNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {trk.plateNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">{trk.driverName}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          trk.ownershipType === 'Shared'
                            ? 'bg-amber-100 text-amber-800'
                            : trk.ownershipType === 'Company'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {trk.ownershipType}{' '}
                        {trk.sharePercent > 0 ? `(${trk.sharePercent}%)` : ''}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">
                      {formatSAR(trkRev)}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-rose-700">
                      {formatSAR(trkExp)}
                    </td>
                    <td className="p-3.5 font-mono font-black text-sm">
                      <span className={trkNet >= 0 ? 'text-emerald-800' : 'text-rose-700'}>
                        {formatSAR(trkNet)}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTruckId(trk.id);
                          setActiveSection('trucks');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                      >
                        {language === 'ar' ? 'عرض السجل' : 'Open Sheet'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
