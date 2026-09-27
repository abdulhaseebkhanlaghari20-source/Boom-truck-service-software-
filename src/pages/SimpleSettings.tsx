import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  DollarSign,
  Coffee,
  Smartphone,
  Globe,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useSimpleApp } from '../SimpleContext.tsx';

export const SimpleSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    language,
    setLanguage,
    resetData,
    exportBackupJSON,
    importBackupJSON,
  } = useSimpleApp();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyNameAr, setCompanyNameAr] = useState(settings.companyNameAr);
  const [currency, setCurrency] = useState(settings.currency || 'SAR');
  const [defaultDailyFood, setDefaultDailyFood] = useState(settings.defaultDailyFood || 25);
  const [defaultMonthlyMobile, setDefaultMonthlyMobile] = useState(
    settings.defaultMonthlyMobile || 120
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName: companyName.trim(),
      companyNameAr: companyNameAr.trim(),
      currency,
      defaultDailyFood: Number(defaultDailyFood),
      defaultMonthlyMobile: Number(defaultMonthlyMobile),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        setImportStatus(
          language === 'ar'
            ? 'تم استيراد النسخة الاحتياطية بنجاح!'
            : 'Backup imported successfully!'
        );
      } else {
        setImportStatus(
          language === 'ar'
            ? 'فشل استيراد الملف. تأكد من صحة ملف JSON.'
            : 'Import failed. Invalid JSON structure.'
        );
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {savedSuccess && (
        <div className="fixed top-16 start-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {language === 'ar'
              ? 'تم حفظ الإعدادات بنجاح!'
              : 'Settings updated successfully!'}
          </span>
        </div>
      )}

      {importStatus && (
        <div className="fixed top-16 start-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {language === 'ar' ? 'إعدادات المنشأة والنظام' : 'Company & System Settings'}
        </h2>
        <p className="text-xs text-slate-500">
          {language === 'ar'
            ? 'تخصيص اسم الشركة، البدلات التشغيلية الافتراضية، اللغة، والنسخ الاحتياطي للبيانات'
            : 'Configure company profile, default operational allowances, language, and data backup'}
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Card 1: Company Profile */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ar' ? 'بيانات المنشأة والاسم التجاري' : 'Company Profile'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'ar' ? 'اسم الشركة (English)' : 'Company Name (English)'}
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'ar' ? 'اسم الشركة بالعربي' : 'Company Name (Arabic)'}
              </label>
              <input
                type="text"
                required
                value={companyNameAr}
                onChange={(e) => setCompanyNameAr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Financial Defaults & Allowances */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ar' ? 'العملة والبدلات الافتراضية' : 'Currency & Operational Allowances'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'ar' ? 'العملة الرئيسية' : 'Operating Currency'}
              </label>
              <input
                type="text"
                disabled
                value="Saudi Riyal (SAR · ر.س)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {language === 'ar' ? 'مثبتة بالريال السعودي للمملكة' : 'Fixed to Saudi Riyal (SAR)'}
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'ar' ? 'بدل الإعاشة اليومي الافتراضي' : 'Default Daily Food Allowance'}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={defaultDailyFood}
                  onChange={(e) => setDefaultDailyFood(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  SAR
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-cyan-600" />
                <span>{language === 'ar' ? 'بدل الجوال الشهري الافتراضي' : 'Default Monthly Mobile'}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={defaultMonthlyMobile}
                  onChange={(e) => setDefaultMonthlyMobile(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  SAR
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              {language === 'ar' ? 'حفظ التعديلات' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>

      {/* Card 3: Language & RTL Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'ar' ? 'لغة واجهة النظام والمحاذاة' : 'System Language & Layout'}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
              language === 'en'
                ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold shadow-2xs'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <p className="text-sm font-bold">English (LTR)</p>
            <p className="text-xs text-slate-500 mt-1">
              Standard Left-to-Right English business layout
            </p>
          </button>

          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`flex-1 p-4 rounded-xl border-2 text-right transition-all ${
              language === 'ar'
                ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold shadow-2xs'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <p className="text-sm font-bold">العربية (RTL)</p>
            <p className="text-xs text-slate-500 mt-1">
              واجهة كاملة باللغة العربية مع دعم فوري من اليمين لليسار
            </p>
          </button>
        </div>
      </div>

      {/* Card 4: Data Management & Backup */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Download className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'ar' ? 'إدارة البيانات والنسخ الاحتياطي' : 'Data Management & Backup'}
          </h3>
        </div>

        <p className="text-xs text-slate-500">
          {language === 'ar'
            ? 'تستطيع تصدير ملف النسخة الاحتياطية (JSON) الكامل للشاحنات والفواتير والمصاريف، أو استيراده في أي وقت'
            : 'Export a full local JSON backup of your fleet, invoices, and expenses, or restore it on any device'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={exportBackupJSON}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{language === 'ar' ? 'تصدير نسخة احتياطية (JSON)' : 'Export Backup (JSON)'}</span>
          </button>

          {/* Import JSON */}
          <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>{language === 'ar' ? 'استيراد نسخة احتياطية' : 'Import Backup'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  language === 'ar'
                    ? 'هل تريد استعادة البيانات التجريبية الافتراضية؟ سيتم مسح التغييرات الأخيرة.'
                    : 'Reset to default sample dataset? Unsaved changes will be cleared.'
                )
              ) {
                resetData();
              }
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'ar' ? 'استعادة البيانات التجريبية' : 'Reset Sample Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
