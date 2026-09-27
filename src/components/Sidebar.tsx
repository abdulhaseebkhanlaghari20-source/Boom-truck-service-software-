import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  X,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { useFleet } from '../context/FleetContext.tsx';
import { ActiveSection } from '../types.ts';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    activeSection,
    setActiveSection,
    setSelectedTruckId,
    language,
    setLanguage,
    resetToDemoData,
    settings,
  } = useFleet();

  const navItems: { id: ActiveSection; label: string; labelAr: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'trucks', label: 'Trucks', labelAr: 'الرافعات والشاحنات', icon: Truck },
    { id: 'drivers', label: 'Drivers', labelAr: 'السائقين والمشغلين', icon: Users },
    { id: 'invoices', label: 'Invoices', labelAr: 'الفواتير والتحصيل', icon: FileText },
    { id: 'expenses', label: 'Expenses', labelAr: 'المصاريف والتشغيل', icon: Receipt },
    { id: 'reports', label: 'Reports', labelAr: 'التقارير المالية', icon: BarChart3 },
    { id: 'settings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings },
  ];

  const handleNavClick = (id: ActiveSection) => {
    setActiveSection(id);
    setSelectedTruckId(null);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 ${
          language === 'ar' ? 'right-0' : 'left-0'
        } z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-e border-slate-800 transition-transform duration-300 print:hidden md:translate-x-0 ${
          isMobileOpen
            ? 'translate-x-0'
            : language === 'ar'
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Truck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-white tracking-tight truncate leading-tight">
                {language === 'ar' ? settings.companyNameAr || 'أسطول الصحراء' : settings.companyName}
              </h1>
              <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                {language === 'ar' ? 'نظام إدارة الرافعات' : 'Boom Truck Fleet Ops'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (7 Sections) */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{language === 'ar' ? item.labelAr : item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer controls: Language & Reset */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'العربية (RTL)' : 'English (LTR)'}</span>
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  language === 'ar'
                    ? 'هل تريد استعادة البيانات التجريبية الافتراضية؟'
                    : 'Reset to standard demo data?'
                )
              ) {
                resetToDemoData();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'ar' ? 'استعادة البيانات التجريبية' : 'Reload Demo Data'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
