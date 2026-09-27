import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActiveSection,
  CompanySettings,
  DateFilter,
  Driver,
  Expense,
  ExpenseType,
  Invoice,
  Truck,
} from './types.ts';
import {
  DEFAULT_SETTINGS,
  INITIAL_DRIVERS,
  INITIAL_EXPENSES,
  INITIAL_INVOICES,
  INITIAL_TRUCKS,
} from './mockData.ts';

interface SimpleContextType {
  activeSection: ActiveSection;
  setActiveSection: (sec: ActiveSection) => void;

  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;

  settings: CompanySettings;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;

  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;

  selectedTruckId: string | null;
  setSelectedTruckId: (id: string | null) => void;

  // Trucks CRUD
  trucks: Truck[];
  addTruck: (truck: Omit<Truck, 'id'>) => void;
  updateTruck: (id: string, truck: Omit<Truck, 'id'>) => void;
  deleteTruck: (id: string) => void;

  // Drivers CRUD
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, driver: Omit<Driver, 'id'>) => void;
  deleteDriver: (id: string) => void;
  quickAddDriverExpense: (
    driverId: string,
    type: 'food' | 'mobile' | 'overtime',
    hours?: number
  ) => void;

  // Expenses CRUD
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Invoices CRUD
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, invoice: Omit<Invoice, 'id'>) => void;
  deleteInvoice: (id: string) => void;
  markInvoiceAsPaid: (id: string) => void;
  toggleInvoiceStatus: (id: string) => void;

  // Helpers
  isDateInFilter: (dateStr: string, customFilter?: DateFilter) => boolean;
  filteredExpenses: Expense[];
  filteredInvoices: Invoice[];
  formatSAR: (val: number) => string;
  resetData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonData: string) => boolean;
}

const VALID_SECTIONS: ActiveSection[] = [
  'dashboard',
  'trucks',
  'drivers',
  'invoices',
  'expenses',
  'reports',
  'settings',
];

const getSectionFromHash = (): ActiveSection => {
  if (typeof window !== 'undefined' && window.location.hash) {
    const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (VALID_SECTIONS.includes(raw as ActiveSection)) {
      return raw as ActiveSection;
    }
  }
  return 'dashboard';
};

const SimpleContext = createContext<SimpleContextType | undefined>(undefined);

export const SimpleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSectionState] = useState<ActiveSection>(() => getSectionFromHash());
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  const setActiveSection = (sec: ActiveSection) => {
    setActiveSectionState(sec);
    if (typeof window !== 'undefined') {
      const current = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (current !== sec) {
        window.location.hash = `#/${sec}`;
      }
    }
  };

  useEffect(() => {
    const onHashChange = () => {
      const section = getSectionFromHash();
      setActiveSectionState(section);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const [language, setLanguageState] = useState<'en' | 'ar'>(() => {
    return (localStorage.getItem('boom_lang') as 'en' | 'ar') || 'en';
  });

  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('boom_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [dateFilter, setDateFilter] = useState<DateFilter>({
    preset: 'month',
  });

  const [trucks, setTrucks] = useState<Truck[]>(() => {
    const saved = localStorage.getItem('boom_trucks');
    return saved ? JSON.parse(saved) : INITIAL_TRUCKS;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('boom_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('boom_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('boom_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('boom_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('boom_trucks', JSON.stringify(trucks));
  }, [trucks]);

  useEffect(() => {
    localStorage.setItem('boom_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('boom_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('boom_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('boom_settings', JSON.stringify(settings));
  }, [settings]);

  const setLanguage = (lang: 'en' | 'ar') => setLanguageState(lang);

  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const formatSAR = (val: number): string => {
    const formatted = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    const prefix = val < 0 ? '-' : '';
    const currency = language === 'ar' ? 'ر.س' : 'SAR';
    return `${prefix}${formatted} ${currency}`;
  };

  // Date filtering logic
  const isDateInFilter = (dateStr: string, customFilter?: DateFilter): boolean => {
    const filter = customFilter || dateFilter;
    if (filter.preset === 'all') return true;

    const itemDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = today.getFullYear();
    const month = today.getMonth();

    if (filter.preset === 'today') {
      const startOfDay = new Date(today);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return itemDate >= startOfDay && itemDate <= endOfDay;
    }

    if (filter.preset === 'week') {
      const day = today.getDay(); // 0 is Sunday
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday or start of week
      const startOfWeek = new Date(today.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);
      return itemDate >= startOfWeek;
    }

    if (filter.preset === 'month') {
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
      return itemDate >= startOfMonth && itemDate <= endOfMonth;
    }

    if (filter.preset === 'prev_month') {
      const startOfPrevMonth = new Date(year, month - 1, 1);
      const endOfPrevMonth = new Date(year, month, 0, 23, 59, 59);
      return itemDate >= startOfPrevMonth && itemDate <= endOfPrevMonth;
    }

    if (filter.preset === 'custom') {
      if (filter.startDate && itemDate < new Date(filter.startDate)) return false;
      if (filter.endDate) {
        const end = new Date(filter.endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) return false;
      }
      return true;
    }

    return true;
  };

  const filteredExpenses = expenses.filter((e) => isDateInFilter(e.date));
  const filteredInvoices = invoices.filter((i) => isDateInFilter(i.date));

  // Trucks CRUD
  const addTruck = (t: Omit<Truck, 'id'>) => {
    const id = `trk-${Date.now()}`;
    setTrucks((prev) => [...prev, { ...t, id }]);
  };

  const updateTruck = (id: string, t: Omit<Truck, 'id'>) => {
    setTrucks((prev) => prev.map((item) => (item.id === id ? { ...t, id } : item)));
  };

  const deleteTruck = (id: string) => {
    setTrucks((prev) => prev.filter((item) => item.id !== id));
    if (selectedTruckId === id) setSelectedTruckId(null);
  };

  // Drivers CRUD
  const addDriver = (d: Omit<Driver, 'id'>) => {
    const id = `drv-${Date.now()}`;
    setDrivers((prev) => [...prev, { ...d, id }]);
  };

  const updateDriver = (id: string, d: Omit<Driver, 'id'>) => {
    setDrivers((prev) => prev.map((item) => (item.id === id ? { ...d, id } : item)));
  };

  const deleteDriver = (id: string) => {
    setDrivers((prev) => prev.filter((item) => item.id !== id));
  };

  const quickAddDriverExpense = (
    driverId: string,
    type: 'food' | 'mobile' | 'overtime',
    hours: number = 4
  ) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const truckNumber = driver.assignedTruck || 'BT-01';

    let expenseType: ExpenseType = 'Driver Food';
    let amount = settings.defaultDailyFood || 25;
    let description = `Daily Food Allowance - ${driver.name}`;

    if (type === 'mobile') {
      expenseType = 'Mobile';
      amount = settings.defaultMonthlyMobile || 120;
      description = `Monthly Mobile & Data Allowance - ${driver.name}`;
    } else if (type === 'overtime') {
      expenseType = 'Overtime';
      amount = (driver.overtimeRate || 20) * hours;
      description = `${hours} hrs Overtime (${driver.overtimeRate || 20} SAR/hr) - ${driver.name}`;
    }

    addExpense({
      date: todayStr,
      truckNumber,
      driverName: driver.name,
      expenseType,
      amount,
      description,
      notes: 'Quick recorded from driver profile',
    });
  };

  // Expenses CRUD
  const addExpense = (e: Omit<Expense, 'id'>) => {
    const id = `exp-${Date.now()}`;
    setExpenses((prev) => [{ ...e, id }, ...prev]);
  };

  const updateExpense = (id: string, e: Omit<Expense, 'id'>) => {
    setExpenses((prev) => prev.map((item) => (item.id === id ? { ...e, id } : item)));
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // Invoices CRUD
  const addInvoice = (inv: Omit<Invoice, 'id'>) => {
    const id = `inv-${Date.now()}`;
    setInvoices((prev) => [{ ...inv, id }, ...prev]);
  };

  const updateInvoice = (id: string, inv: Omit<Invoice, 'id'>) => {
    setInvoices((prev) => prev.map((item) => (item.id === id ? { ...inv, id } : item)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((item) => item.id !== id));
  };

  const markInvoiceAsPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Paid' } : item))
    );
  };

  const toggleInvoiceStatus = (id: string) => {
    setInvoices((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Paid' ? 'Pending' : 'Paid' }
          : item
      )
    );
  };

  const resetData = () => {
    setTrucks(INITIAL_TRUCKS);
    setDrivers(INITIAL_DRIVERS);
    setExpenses(INITIAL_EXPENSES);
    setInvoices(INITIAL_INVOICES);
    setSettings(DEFAULT_SETTINGS);
    setSelectedTruckId(null);
    localStorage.removeItem('boom_trucks');
    localStorage.removeItem('boom_drivers');
    localStorage.removeItem('boom_expenses');
    localStorage.removeItem('boom_invoices');
    localStorage.removeItem('boom_settings');
  };

  const exportBackupJSON = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      settings,
      trucks,
      drivers,
      expenses,
      invoices,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `boom_truck_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data.trucks)) setTrucks(data.trucks);
      if (Array.isArray(data.drivers)) setDrivers(data.drivers);
      if (Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (Array.isArray(data.invoices)) setInvoices(data.invoices);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Invalid JSON backup file', e);
      return false;
    }
  };

  return (
    <SimpleContext.Provider
      value={{
        activeSection,
        setActiveSection,
        language,
        setLanguage,
        settings,
        updateSettings,
        dateFilter,
        setDateFilter,
        selectedTruckId,
        setSelectedTruckId,
        trucks,
        addTruck,
        updateTruck,
        deleteTruck,
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        quickAddDriverExpense,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoiceAsPaid,
        toggleInvoiceStatus,
        isDateInFilter,
        filteredExpenses,
        filteredInvoices,
        formatSAR,
        resetData,
        exportBackupJSON,
        importBackupJSON,
      }}
    >
      {children}
    </SimpleContext.Provider>
  );
};

export const useSimpleApp = () => {
  const ctx = useContext(SimpleContext);
  if (!ctx) throw new Error('useSimpleApp must be used within SimpleProvider');
  return ctx;
};
