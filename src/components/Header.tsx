import React from 'react';
import { Menu, Calendar, Printer, Globe } from 'lucide-react';
import { useFleet } from '../context/FleetContext.tsx';
import { DateFilterPreset } from '../types.ts';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    activeSection,
    selectedTruckId,
    trucks,
    dateFilter,
    setDateFilter,
    setDatePreset,
    language,
    setLanguage,
  } = useFleet();

  const sectionTitles: Record<string, { en: string; ar: string }> = {
    dashboard: { en: 'Dashboard', ar: 'لوحة التحكم المالية' },
    trucks: { en: 'Trucks Fleet', ar: 'الرافعات والشاحنات' },
    drivers: { en: 'Drivers & Operators', ar: 'السائقين والمشغلين' },
    invoices: { en: 'Invoices & Receivables', ar: 'الفواتير والتحصيل' },
    expenses: { en: 'Expenses & Operations', ar: 'المصاريف والتشغيل' },
    reports: { en: 'Financial Reports', ar: 'التقارير المالية والتشغيلية' },
    settings: { en: 'System Settings', ar: 'إعدادات النظام' },
  };

  const selectedTruck = selectedTruckId ? trucks.find((t) => t.id === selectedTruckId) : null;
  const currentTitle = selectedTruck
    ? {
        en: `Truck Detail: ${selectedTruck.truckNumber}`,
        ar: `تفاصيل الرافعة: ${selectedTruck.truckNumber}`,
      }
    : sectionTitles[activeSection] || sectionTitles.dashboard;

  const presets: { id: DateFilterPreset; labelEn: string; labelAr: string }[] = [
    { id: 'today', labelEn: 'Today', labelAr: 'اليوم' },
    { id: 'week', labelEn: 'This Week', labelAr: 'هذا الأسبوع' },
    { id: 'month', labelEn: 'This Month', labelAr: 'هذا الشهر' },
    { id: 'prev_month', labelEn: 'Previous Month', labelAr: 'الشهر السابق' },
    { id: 'custom', labelEn: 'Custom', labelAr: 'مخصص' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 print:hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Mobile button & Page title */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {language === 'ar' ? currentTitle.ar : currentTitle.en}
              </h2>
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                SAR · ر.س
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {language === 'ar'
                ? 'إدارة وتشغيل رافعات البوم ترك والمصاريف التشغيلية وتوزيع الحصص'
                : 'Boom truck fleet revenue, expenses, driver allowances and profit tracking'}
            </p>
          </div>
        </div>

        {/* Right: Date Range Selector & Actions */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2">
          {/* Date Filter Bar */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1 px-1.5 text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline text-[11px]">Period:</span>
            </div>
            {presets.map((p) => {
              const isActive = dateFilter.preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setDatePreset(p.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {language === 'ar' ? p.labelAr : p.labelEn}
                </button>
              );
            })}
          </div>

          {/* Custom Date Pickers */}
          {dateFilter.preset === 'custom' && (
            <div className="flex items-center gap-1 text-xs">
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, preset: 'custom', startDate: e.target.value })
                }
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
              />
              <span className="text-slate-400">→</span>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, preset: 'custom', endDate: e.target.value })
                }
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          )}

          {/* Print Report / Download PDF Button */}
          <button
            onClick={handlePrint}
            title="Print or Save as PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">
              {language === 'ar' ? 'طباعة / PDF' : 'Print / PDF'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
