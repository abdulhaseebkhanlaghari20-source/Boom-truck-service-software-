import React from 'react';
import { useFleet } from '../context/FleetContext.tsx';

export const PrintReportView: React.FC = () => {
  const {
    settings,
    dateFilter,
    getDashboardMetrics,
    trucks,
    getTruckFinancials,
    formatSAR,
    language,
  } = useFleet();

  const metrics = getDashboardMetrics();
  const currentDate = new Date().toLocaleDateString('en-GB');

  return (
    <div className="hidden print:block p-8 bg-white text-slate-900 space-y-6">
      {/* Print Header */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {language === 'ar' ? settings.companyNameAr || settings.companyName : settings.companyName}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Official Boom Truck Fleet Financial & Expense Statement
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Period: {dateFilter.startDate} to {dateFilter.endDate} ({dateFilter.preset.toUpperCase()})
          </p>
        </div>
        <div className="text-right text-xs text-slate-600 space-y-0.5">
          <p className="font-bold text-slate-900">Report Generated: {currentDate}</p>
          <p>Currency: Saudi Riyal (SAR)</p>
          <p>Active Trucks: {metrics.activeTrucksCount} Units</p>
        </div>
      </div>

      {/* Summary Financial Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border border-slate-300 rounded-lg">
          <span className="text-xs text-slate-500 block uppercase font-bold">Total Revenue</span>
          <span className="text-xl font-bold font-mono text-emerald-800">
            {formatSAR(metrics.totalRevenue)}
          </span>
          <span className="text-[10px] text-slate-500 block">From Paid Invoices</span>
        </div>

        <div className="p-4 border border-slate-300 rounded-lg">
          <span className="text-xs text-slate-500 block uppercase font-bold">Pending Amount</span>
          <span className="text-xl font-bold font-mono text-amber-800">
            {formatSAR(metrics.pendingInvoices)}
          </span>
          <span className="text-[10px] text-slate-500 block">Uncollected Invoices</span>
        </div>

        <div className="p-4 border border-slate-300 rounded-lg">
          <span className="text-xs text-slate-500 block uppercase font-bold">Total Expenses</span>
          <span className="text-xl font-bold font-mono text-rose-800">
            {formatSAR(metrics.totalExpenses)}
          </span>
          <span className="text-[10px] text-slate-500 block">Operating Costs</span>
        </div>

        <div className="p-4 border-2 border-slate-900 rounded-lg bg-slate-50">
          <span className="text-xs text-slate-700 block uppercase font-black">Net Profit</span>
          <span className="text-xl font-black font-mono text-slate-900">
            {formatSAR(metrics.netProfit)}
          </span>
          <span className="text-[10px] text-slate-600 block">Revenue - Expenses</span>
        </div>
      </div>

      {/* Truck Performance Breakdown */}
      <div className="space-y-2 pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
          Boom Truck Fleet Financial Breakdown
        </h3>
        <table className="w-full text-left rtl:text-right border-collapse text-xs border border-slate-300">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-slate-300">
              <th className="p-2.5">Truck</th>
              <th className="p-2.5">Driver</th>
              <th className="p-2.5">Share %</th>
              <th className="p-2.5">Revenue</th>
              <th className="p-2.5">Expenses</th>
              <th className="p-2.5">Net Profit</th>
              <th className="p-2.5">Owner Share</th>
              <th className="p-2.5">Company Share</th>
              <th className="p-2.5">Pending</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {trucks.map((trk) => {
              const fin = getTruckFinancials(trk.id);
              if (!fin) return null;
              return (
                <tr key={trk.id}>
                  <td className="p-2.5 font-bold">
                    {trk.truckNumber} ({trk.plateNumber})
                  </td>
                  <td className="p-2.5">{trk.driverName}</td>
                  <td className="p-2.5 font-mono">{trk.sharePercent}%</td>
                  <td className="p-2.5 font-mono text-emerald-800 font-semibold">
                    {formatSAR(fin.revenue)}
                  </td>
                  <td className="p-2.5 font-mono text-rose-800 font-semibold">
                    {formatSAR(fin.expenses)}
                  </td>
                  <td className="p-2.5 font-mono font-bold">{formatSAR(fin.netProfit)}</td>
                  <td className="p-2.5 font-mono text-amber-800">{formatSAR(fin.ownerShareAmount)}</td>
                  <td className="p-2.5 font-mono text-emerald-900">{formatSAR(fin.companyShareAmount)}</td>
                  <td className="p-2.5 font-mono text-amber-700">{formatSAR(fin.pendingAmount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expense Breakdown */}
      <div className="space-y-2 pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
          Operational Expense Breakdown by Category
        </h3>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {metrics.expenseBreakdown.map((item) => (
            <div key={item.type} className="p-2 border border-slate-200 rounded flex justify-between">
              <span className="font-medium text-slate-700">{item.type}</span>
              <span className="font-bold font-mono">{formatSAR(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Signature & Stamp Footer */}
      <div className="pt-8 flex justify-between items-end text-xs text-slate-600 border-t border-slate-300">
        <div>
          <p className="font-bold text-slate-800">Fleet Operations Manager</p>
          <div className="mt-8 w-44 border-b border-slate-400" />
          <p className="text-[10px] text-slate-500 mt-1">Signature & Date</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-800">Official Company Seal</p>
          <div className="mt-2 w-24 h-16 border-2 border-dashed border-slate-300 rounded mx-auto" />
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-800">Finance & Accounts</p>
          <div className="mt-8 w-44 border-b border-slate-400" />
          <p className="text-[10px] text-slate-500 mt-1">Authorized Auditor</p>
        </div>
      </div>
    </div>
  );
};
