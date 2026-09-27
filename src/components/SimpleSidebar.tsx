import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  Globe,
  RotateCcw,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useSimpleApp } from '../SimpleContext.tsx';
import { ActiveSection } from '../types.ts';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const SimpleSidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    activeSection,
    setActiveSection,
    setSelectedTruckId,
    language,
    setLanguage,
    resetData,
    settings,
  } = useSimpleApp();

  const navItems: {
    id: ActiveSection;
    label: string;
    labelAr: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'trucks', label: 'Trucks', labelAr: 'الرافعات والشاحنات', icon: Truck },
    { id: 'drivers', label: 'Drivers', labelAr: 'السائقين', icon: Users },
    { id: 'invoices', label: 'Invoices', labelAr: 'الفواتير والتحصيل', icon: FileText },
    { id: 'expenses', label: 'Expenses', labelAr: 'المصاريف', icon: Receipt },
    { id: 'reports', label: 'Reports', labelAr: 'التقارير والأرباح', icon: BarChart3 },
    { id: 'settings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings },
  ];

  const handleNavClick = (id: ActiveSection) => {
    setActiveSection(id);
    if (id === 'trucks') {
      // If clicking trucks, reset truck detail view so they see the full list
      setSelectedTruckId(null);
    }
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 ${
          language === 'ar' ? 'right-0' : 'left-0'
        } z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-e border-slate-800 transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen
            ? 'translate-x-0'
            : language === 'ar'
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
      >
        {/* Branding */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <Truck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight truncate leading-tight">
                {language === 'ar'
                  ? settings.companyNameAr || 'شركة الصحراء للرافعات'
                  : settings.companyName || 'Boom Truck Manager'}
              </h1>
              <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                <span>{language === 'ar' ? 'المصاريف وتوزيع الأرباح' : 'SAR Expense & Profit'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list (all 7 sections) */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{language === 'ar' ? item.labelAr : item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer controls: Language & Reset */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'العربية (Arabic RTL)' : 'English (LTR)'}</span>
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  language === 'ar'
                    ? 'هل تريد استعادة البيانات التجريبية الافتراضية؟'
                    : 'Reset to sample test data?'
                )
              ) {
                resetData();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'ar' ? 'استعادة البيانات التجريبية' : 'Reset Sample Data'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
