import React from 'react';
import { Menu, Globe, Calendar, RefreshCw } from 'lucide-react';
import { useSimpleApp } from '../SimpleContext.tsx';
import { DateFilterPreset } from '../types.ts';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const SimpleHeader: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    activeSection,
    language,
    setLanguage,
    settings,
    dateFilter,
    setDateFilter,
  } = useSimpleApp();

  const sectionTitles: Record<string, { en: string; ar: string; descEn: string; descAr: string }> = {
    dashboard: {
      en: 'Financial Dashboard',
      ar: 'لوحة التحكم والتحليل المالي',
      descEn: 'Revenue, expenses, profit margins & truck performance',
      descAr: 'نظرة شاملة على الإيرادات والمصروفات وصافي الأرباح وأداء الأسطول',
    },
    trucks: {
      en: 'Boom Trucks Fleet',
      ar: 'أسطول الرافعات والشاحنات',
      descEn: 'Fleet directory, ownership & individual truck financial sheets',
      descAr: 'بيانات الرافعات، ملكية الشاحنات، والصفحة المالية المستقلة لكل رافعة',
    },
    drivers: {
      en: 'Drivers & Allowances',
      ar: 'السائقين والبدلات والإضافي',
      descEn: 'Driver roster, food/mobile allowances & quick overtime log',
      descAr: 'سجل السائقين، بدلات الإعاشة والاتصال، وتسجيل ساعات العمل الإضافي',
    },
    invoices: {
      en: 'Invoices & Collections',
      ar: 'الفواتير والمطالبات والتحصيل',
      descEn: 'Customer billing, paid receipts & pending receivables',
      descAr: 'فواتير العملاء، المبالغ المستلمة، والمستحقات قيد التحصيل',
    },
    expenses: {
      en: 'Expense Log',
      ar: 'سجل المصروفات التشغيلية',
      descEn: 'Fuel, maintenance, tyres, washing & driver operational costs',
      descAr: 'مصاريف الديزل، قطع الغيار، الصيانة، الغسيل، ومصاريف التشغيل اليومية',
    },
    reports: {
      en: 'Financial Reports & Profit Sharing',
      ar: 'التقارير المالية وتوزيع الأرباح',
      descEn: 'P&L statements, owner percentage payout & printable summaries',
      descAr: 'قائمة الأرباح والخسائر، تقرير حصص الشركاء، وطباعة وتصدير البيانات',
    },
    settings: {
      en: 'Company & System Settings',
      ar: 'إعدادات الشركة والنظام',
      descEn: 'Company profile, default allowances, backup & language',
      descAr: 'اسم المنشأة، البدلات الافتراضية، النسخ الاحتياطي واللغة',
    },
  };

  const currentInfo = sectionTitles[activeSection] || sectionTitles.dashboard;

  const presets: { id: DateFilterPreset; en: string; ar: string }[] = [
    { id: 'all', en: 'All Time', ar: 'الكل' },
    { id: 'today', en: 'Today', ar: 'اليوم' },
    { id: 'week', en: 'This Week', ar: 'هذا الأسبوع' },
    { id: 'month', en: 'This Month', ar: 'هذا الشهر' },
    { id: 'prev_month', en: 'Prev Month', ar: 'الشهر السابق' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
              {language === 'ar' ? currentInfo.ar : currentInfo.en}
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {language === 'ar' ? currentInfo.descAr : currentInfo.descEn}
            </p>
          </div>
        </div>

        {/* Right: Date filter pill bar & Language Switcher */}
        <div className="flex items-center flex-wrap gap-2 self-end sm:self-auto">
          {/* Quick Date Presets (Visible on Dashboard, Invoices, Expenses, Reports) */}
          {['dashboard', 'invoices', 'expenses', 'reports'].includes(activeSection) && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400 ms-2 me-1 hidden md:inline" />
              {presets.map((p) => {
                const isSelected = dateFilter.preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setDateFilter({ preset: p.id })}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {language === 'ar' ? p.ar : p.en}
                  </button>
                );
              })}
            </div>
          )}

          {/* Currency indicator */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
            <span>{language === 'ar' ? 'ر.س' : 'SAR'}</span>
          </div>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
