import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  Receipt,
  Truck as TruckIcon,
  Percent,
  Calendar,
  Filter,
} from 'lucide-react';
import { useSimpleApp } from '../SimpleContext.tsx';
import { EXPENSE_TYPES } from '../mockData.ts';
import { DateFilterPreset } from '../types.ts';

export const SimpleReports: React.FC = () => {
  const {
    trucks,
    invoices,
    expenses,
    dateFilter,
    setDateFilter,
    isDateInFilter,
    formatSAR,
    language,
    settings,
  } = useSimpleApp();

  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'trucks' | 'categories'>('pnl');

  // Filter current dataset
  const currentInvoices = invoices.filter((i) => isDateInFilter(i.date));
  const currentExpenses = expenses.filter((e) => isDateInFilter(e.date));

  // P&L Calculations
  const totalPaidRevenue = currentInvoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const totalPendingRevenue = currentInvoices
    .filter((i) => i.status === 'Pending')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const totalOperatingExpenses = currentExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  const netOperatingProfit = totalPaidRevenue - totalOperatingExpenses;
  const profitMargin =
    totalPaidRevenue > 0 ? ((netOperatingProfit / totalPaidRevenue) * 100).toFixed(1) : '0';

  // Category breakdown
  const categorySummary = EXPENSE_TYPES.map((type) => {
    const matching = currentExpenses.filter((e) => e.expenseType === type);
    const amount = matching.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const percent =
      totalOperatingExpenses > 0
        ? ((amount / totalOperatingExpenses) * 100).toFixed(1)
        : '0';
    return {
      type,
      count: matching.length,
      amount,
      percent,
    };
  }).filter((c) => c.amount > 0 || c.count > 0);

  // Truck Performance & Profit Share calculation
  let totalCompanyPayout = 0;
  let totalOwnerPayout = 0;

  const truckReports = trucks.map((trk) => {
    const trkInvs = currentInvoices.filter(
      (i) => i.truckNumber === trk.truckNumber && i.status === 'Paid'
    );
    const rev = trkInvs.reduce((sum, i) => sum + Number(i.amount || 0), 0);

    const trkPending = currentInvoices
      .filter((i) => i.truckNumber === trk.truckNumber && i.status === 'Pending')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    const trkExps = currentExpenses.filter((e) => e.truckNumber === trk.truckNumber);
    const exp = trkExps.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const net = rev - exp;

    const isShared = trk.ownershipType === 'Shared';
    const share = trk.sharePercent || 0;
    const ownerShare = isShared && net > 0 ? (net * share) / 100 : 0;
    const companyShare = isShared
      ? net > 0
        ? (net * (100 - share)) / 100
        : net
      : net;

    totalOwnerPayout += ownerShare;
    totalCompanyPayout += companyShare;

    return {
      ...trk,
      revenue: rev,
      pending: trkPending,
      expenses: exp,
      netProfit: net,
      ownerShare,
      companyShare,
    };
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic support in Excel

    if (activeReportTab === 'trucks') {
      csvContent += 'Truck Number,Plate,Driver,Ownership,Owner Name,Share %,Revenue (SAR),Expenses (SAR),Net Profit (SAR),Owner Share (SAR),Company Share (SAR)\n';
      truckReports.forEach((t) => {
        csvContent += `"${t.truckNumber}","${t.plateNumber}","${t.driverName}","${t.ownershipType}","${t.ownerName || 'Company'}","${t.sharePercent}%",${t.revenue},${t.expenses},${t.netProfit},${t.ownerShare},${t.companyShare}\n`;
      });
    } else if (activeReportTab === 'categories') {
      csvContent += 'Expense Category,Entries Count,Total Amount (SAR),% of Total\n';
      categorySummary.forEach((c) => {
        csvContent += `"${c.type}",${c.count},${c.amount},${c.percent}%\n`;
      });
    } else {
      csvContent += 'Financial Metric,Amount (SAR)\n';
      csvContent += `"Paid Revenue (Collections)",${totalPaidRevenue}\n`;
      csvContent += `"Pending Receivables",${totalPendingRevenue}\n`;
      csvContent += `"Total Operating Expenses",${totalOperatingExpenses}\n`;
      csvContent += `"Net Operating Profit",${netOperatingProfit}\n`;
      csvContent += `"Profit Margin",${profitMargin}%\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Boom_Truck_Report_${activeReportTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'التقارير المالية وتوزيع الأرباح' : 'Financial Reports & Profit Share'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'قوائم الدخل والأرباح، تصفية حسابات الشركاء والرافعات، وتصدير التقارير بصيغة Excel و PDF'
              : 'Profit & Loss statements, partner profit distribution sheets, and CSV/Print export'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'ar' ? 'تصدير Excel (CSV)' : 'Export CSV'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'ar' ? 'طباعة التقرير' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Printable Company Header (Only shown during print or at top of report) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <h1 className="text-lg font-black text-slate-900">
              {language === 'ar'
                ? settings.companyNameAr || 'شركة الصحراء للرافعات والمعدات الثقيلة'
                : settings.companyName || 'Al-Sahra Boom Trucks & Heavy Equipment Co.'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'تقرير الأداء المالي التشغيلي · العملة: ريال سعودي (SAR)'
                : 'Fleet Operating Financial Report · Currency: Saudi Riyal (SAR)'}
            </p>
          </div>
          <div className="text-right rtl:text-left text-xs font-mono text-slate-500">
            <p>{language === 'ar' ? 'تاريخ التقرير:' : 'Generated:'} {new Date().toISOString().slice(0, 10)}</p>
            <p className="font-bold text-amber-700 uppercase">{dateFilter.preset} Period</p>
          </div>
        </div>

        {/* Tab selection in Web UI */}
        <div className="flex gap-2 pt-2 print:hidden">
          <button
            onClick={() => setActiveReportTab('pnl')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportTab === 'pnl'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'ar' ? 'قائمة الأرباح والخسائر (P&L)' : 'Profit & Loss Statement'}
          </button>

          <button
            onClick={() => setActiveReportTab('trucks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportTab === 'trucks'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'ar' ? 'أداء الرافعات وحصص الشركاء' : 'Truck Performance & Partner Shares'}
          </button>

          <button
            onClick={() => setActiveReportTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportTab === 'categories'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'ar' ? 'تفصيل بنود المصروفات' : 'Expense Categories'}
          </button>
        </div>
      </div>

      {/* REPORT 1: Profit & Loss Statement */}
      {activeReportTab === 'pnl' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <span>{language === 'ar' ? 'بيان الدخل والأرباح (P&L Summary)' : 'Income Statement'}</span>
            </h3>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800">
              {profitMargin}% {language === 'ar' ? 'هامش الربح' : 'Margin'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Revenue Section */}
            <div className="py-3 space-y-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                1. {language === 'ar' ? 'الإيرادات والتحصيلات' : 'Revenue & Collections'}
              </span>
              <div className="flex justify-between font-semibold text-slate-700 ps-4">
                <span>{language === 'ar' ? 'إجمالي فواتير العمليات المحصلة (نقدي / تحويل)' : 'Paid Customer Invoices (Cleared)'}</span>
                <span className="font-mono text-emerald-700 font-bold">{formatSAR(totalPaidRevenue)}</span>
              </div>
              <div className="flex justify-between font-semibold text-amber-700 ps-4">
                <span>{language === 'ar' ? 'مستحقات قيد التحصيل (فواتير معلقة)' : 'Pending Receivables'}</span>
                <span className="font-mono font-bold">{formatSAR(totalPendingRevenue)}</span>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="py-3 space-y-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                2. {language === 'ar' ? 'المصروفات التشغيلية' : 'Operating Expenses'}
              </span>
              {categorySummary.map((c) => (
                <div key={c.type} className="flex justify-between text-slate-600 ps-4">
                  <span>{c.type} ({c.count} {language === 'ar' ? 'بند' : 'records'})</span>
                  <span className="font-mono font-semibold text-rose-700">{formatSAR(c.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-rose-800 ps-4 pt-1 border-t border-slate-100">
                <span>{language === 'ar' ? 'إجمالي المصاريف:' : 'Total Operating Expenses:'}</span>
                <span className="font-mono text-sm">{formatSAR(totalOperatingExpenses)}</span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="py-4 bg-slate-50 px-4 rounded-xl flex items-center justify-between font-black text-sm">
              <span className="text-slate-900">
                {language === 'ar' ? 'صافي الربح التشغيلي (Net Operating Profit)' : 'Net Operating Profit'}
              </span>
              <span className={`font-mono text-base ${netOperatingProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatSAR(netOperatingProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: Truck Performance & Partner Profit Sharing */}
      {activeReportTab === 'trucks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'جدول أداء الرافعات وتصفية حصص الشركاء' : 'Truck Performance & Partner Settlement'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'حساب نسبة الشريك من صافي ربح الرافعة وحصة الشركة الصافية'
                  : 'Breakdown of revenue, expenses, net profit and partner share percentage'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5">{language === 'ar' ? 'الرافعة' : 'Truck'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'السائق' : 'Driver'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'المالك والنسبة' : 'Owner & Share'}</th>
                  <th className="p-3.5 text-emerald-700">{language === 'ar' ? 'الإيراد' : 'Revenue'}</th>
                  <th className="p-3.5 text-rose-700">{language === 'ar' ? 'المصاريف' : 'Expenses'}</th>
                  <th className="p-3.5 font-bold text-slate-900">{language === 'ar' ? 'صافي الربح' : 'Net Profit'}</th>
                  <th className="p-3.5 text-amber-800 font-bold">{language === 'ar' ? 'حصة الشريك' : 'Owner Share'}</th>
                  <th className="p-3.5 text-blue-800 font-bold">{language === 'ar' ? 'حصة الشركة' : 'Company Share'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {truckReports.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                      <TruckIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{t.truckNumber}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{t.driverName}</td>
                    <td className="p-3.5">
                      <span className="font-semibold">{t.ownershipType}</span>
                      {t.sharePercent > 0 && (
                        <span className="ms-1 text-amber-800 font-bold">({t.sharePercent}%)</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">{formatSAR(t.revenue)}</td>
                    <td className="p-3.5 font-mono font-bold text-rose-700">{formatSAR(t.expenses)}</td>
                    <td className="p-3.5 font-mono font-black text-slate-900">{formatSAR(t.netProfit)}</td>
                    <td className="p-3.5 font-mono font-bold text-amber-800">{formatSAR(t.ownerShare)}</td>
                    <td className="p-3.5 font-mono font-bold text-blue-800">{formatSAR(t.companyShare)}</td>
                  </tr>
                ))}
              </tbody>
              {/* Totals Row */}
              <tfoot>
                <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={3} className="p-3.5">{language === 'ar' ? 'الإجمالي الكلي:' : 'Total Fleet Summary:'}</td>
                  <td className="p-3.5 font-mono text-emerald-800">{formatSAR(totalPaidRevenue)}</td>
                  <td className="p-3.5 font-mono text-rose-800">{formatSAR(totalOperatingExpenses)}</td>
                  <td className="p-3.5 font-mono text-slate-900 text-sm">{formatSAR(netOperatingProfit)}</td>
                  <td className="p-3.5 font-mono text-amber-900">{formatSAR(totalOwnerPayout)}</td>
                  <td className="p-3.5 font-mono text-blue-900">{formatSAR(totalCompanyPayout)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: Expense Categories Breakdown */}
      {activeReportTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ar' ? 'تقرير المصروفات حسب التصنيف' : 'Expense Categories Distribution'}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5">{language === 'ar' ? 'نوع المصروف' : 'Expense Type'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'عدد العمليات' : 'Entries Count'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</th>
                  <th className="p-3.5">{language === 'ar' ? 'النسبة من إجمالي المصاريف' : '% of Total'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categorySummary.map((c) => (
                  <tr key={c.type} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{c.type}</td>
                    <td className="p-3.5 font-mono">{c.count}</td>
                    <td className="p-3.5 font-mono font-bold text-rose-700">{formatSAR(c.amount)}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">{c.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
