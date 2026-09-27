import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActiveSection,
  CompanySettings,
  DateFilter,
  DateFilterPreset,
  Driver,
  Expense,
  ExpenseType,
  Invoice,
  Truck,
} from '../types.ts';
import {
  DEFAULT_SETTINGS,
  EXPENSE_COLORS,
  EXPENSE_TYPES,
  INITIAL_DRIVERS,
  INITIAL_EXPENSES,
  INITIAL_INVOICES,
  INITIAL_TRUCKS,
} from '../mockData.ts';

export interface TruckFinancialSummary {
  truck: Truck;
  revenue: number; // Paid invoices
  expenses: number;
  netProfit: number; // Revenue - Expenses
  pendingAmount: number; // Pending invoices
  ownerShareAmount: number;
  companyShareAmount: number;
  expenseBreakdown: { type: ExpenseType; amount: number; color: string }[];
  timeline: { date: string; revenue: number; expenses: number; netProfit: number }[];
}

interface FleetContextType {
  activeSection: ActiveSection;
  setActiveSection: (sec: ActiveSection) => void;
  selectedTruckId: string | null;
  setSelectedTruckId: (id: string | null) => void;

  settings: CompanySettings;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;

  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  setDatePreset: (preset: DateFilterPreset) => void;

  trucks: Truck[];
  addTruck: (truck: Omit<Truck, 'id'>) => void;
  updateTruck: (id: string, truck: Omit<Truck, 'id'>) => void;
  deleteTruck: (id: string) => void;

  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, driver: Omit<Driver, 'id'>) => void;
  deleteDriver: (id: string) => void;
  quickAddFoodExpense: (driverId: string) => boolean;
  quickAddMobileExpense: (driverId: string) => boolean;

  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, invoice: Omit<Invoice, 'id'>) => void;
  deleteInvoice: (id: string) => void;
  markInvoiceAsPaid: (id: string) => void;
  toggleInvoiceStatus: (id: string) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Real-time calculations
  getDashboardMetrics: () => {
    totalRevenue: number;
    pendingInvoices: number;
    totalExpenses: number;
    netProfit: number;
    activeTrucksCount: number;
    totalJobsCount: number;
    expenseBreakdown: { type: ExpenseType; amount: number; color: string }[];
    timeline: { label: string; revenue: number; expenses: number; netProfit: number }[];
    truckProfitability: {
      truckNumber: string;
      revenue: number;
      expenses: number;
      netProfit: number;
    }[];
  };

  getTruckFinancials: (truckId: string) => TruckFinancialSummary | null;
  getDriverFinancials: (driverId: string) => {
    driver: Driver;
    foodExpenses: number;
    mobileExpenses: number;
    overtimeExpenses: number;
    otherExpenses: number;
    totalDriverCost: number;
  } | null;

  formatSAR: (amount: number) => string;
  resetToDemoData: () => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const computeDateRange = (preset: DateFilterPreset): { startDate: string; endDate: string } => {
  const now = new Date('2026-09-27T10:00:00');
  const y = now.getFullYear();
  const m = now.getMonth();

  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (preset) {
    case 'today': {
      const s = fmt(now);
      return { startDate: s, endDate: s };
    }
    case 'week': {
      const day = now.getDay();
      const diff = day;
      const start = new Date(now);
      start.setDate(now.getDate() - diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    case 'month': {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    case 'prev_month': {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    case 'custom':
    default:
      return { startDate: `${y}-09-01`, endDate: `${y}-09-30` };
  }
};

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  const [settings, setSettings] = useState<CompanySettings>(() => {
    const s = localStorage.getItem('fleet_settings');
    return s ? JSON.parse(s) : DEFAULT_SETTINGS;
  });

  const [dateFilter, setDateFilter] = useState<DateFilter>(() => {
    const { startDate, endDate } = computeDateRange('month');
    return { preset: 'month', startDate, endDate };
  });

  const [trucks, setTrucks] = useState<Truck[]>(() => {
    const s = localStorage.getItem('fleet_trucks');
    return s ? JSON.parse(s) : INITIAL_TRUCKS;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const s = localStorage.getItem('fleet_drivers');
    return s ? JSON.parse(s) : INITIAL_DRIVERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const s = localStorage.getItem('fleet_invoices');
    return s ? JSON.parse(s) : INITIAL_INVOICES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const s = localStorage.getItem('fleet_expenses');
    return s ? JSON.parse(s) : INITIAL_EXPENSES;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('fleet_settings', JSON.stringify(settings));
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings]);

  useEffect(() => localStorage.setItem('fleet_trucks', JSON.stringify(trucks)), [trucks]);
  useEffect(() => localStorage.setItem('fleet_drivers', JSON.stringify(drivers)), [drivers]);
  useEffect(() => localStorage.setItem('fleet_invoices', JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem('fleet_expenses', JSON.stringify(expenses)), [expenses]);

  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setLanguage = (lang: 'en' | 'ar') => {
    updateSettings({ language: lang });
  };

  const setDatePreset = (preset: DateFilterPreset) => {
    const { startDate, endDate } = computeDateRange(preset);
    setDateFilter({ preset, startDate, endDate });
  };

  const formatSAR = (amount: number): string => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    const prefix = amount < 0 ? '-' : '';
    const currency = settings.language === 'ar' ? 'ر.س' : 'SAR';
    return `${prefix}${formatted} ${currency}`;
  };

  const isDateInRange = (dateStr: string): boolean => {
    if (!dateFilter.startDate || !dateFilter.endDate) return true;
    return dateStr >= dateFilter.startDate && dateStr <= dateFilter.endDate;
  };

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

  const quickAddFoodExpense = (driverId: string): boolean => {
    const drv = drivers.find((d) => d.id === driverId);
    if (!drv) return false;
    const today = new Date().toISOString().split('T')[0];
    const amount = drv.dailyFoodAllowance || settings.defaultDailyFood || 25;
    addExpense({
      date: today,
      truckNumber: drv.assignedTruck || 'BT-01',
      driverName: drv.name,
      expenseType: 'Driver Food',
      amount,
      description: `Daily Food Allowance (${drv.name})`,
      notes: 'Quick logged via Driver shortcut',
    });
    return true;
  };

  const quickAddMobileExpense = (driverId: string): boolean => {
    const drv = drivers.find((d) => d.id === driverId);
    if (!drv) return false;
    const today = new Date().toISOString().split('T')[0];
    const amount = drv.monthlyMobileAllowance || settings.defaultMonthlyMobile || 120;
    addExpense({
      date: today,
      truckNumber: drv.assignedTruck || 'BT-01',
      driverName: drv.name,
      expenseType: 'Mobile',
      amount,
      description: `Monthly Mobile Allowance (${drv.name})`,
      notes: 'Quick logged via Driver shortcut',
    });
    return true;
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

  // Expenses CRUD
  const addExpense = (exp: Omit<Expense, 'id'>) => {
    const id = `exp-${Date.now()}`;
    setExpenses((prev) => [{ ...exp, id }, ...prev]);
  };

  const updateExpense = (id: string, exp: Omit<Expense, 'id'>) => {
    setExpenses((prev) => prev.map((item) => (item.id === id ? { ...exp, id } : item)));
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // Real-time Dashboard Metrics
  const getDashboardMetrics = () => {
    const filteredInvoices = invoices.filter((i) => isDateInRange(i.date));
    const filteredExpenses = expenses.filter((e) => isDateInRange(e.date));

    // Revenue: sum of PAID invoices only
    const totalRevenue = filteredInvoices
      .filter((i) => i.status === 'Paid')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    // Pending: sum of PENDING invoices
    const pendingInvoices = filteredInvoices
      .filter((i) => i.status === 'Pending')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    // Total Expenses
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Net Profit: Revenue minus Expenses
    const netProfit = totalRevenue - totalExpenses;

    const activeTrucksCount = trucks.filter((t) => t.status === 'Active').length;
    const totalJobsCount = filteredInvoices.length;

    // Expense Breakdown
    const expenseBreakdown = EXPENSE_TYPES.map((type) => {
      const amount = filteredExpenses
        .filter((e) => e.expenseType === type)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      return {
        type,
        amount,
        color: EXPENSE_COLORS[type],
      };
    }).filter((item) => item.amount > 0);

    // Timeline: grouped by date or month
    // Sort records chronologically
    const dateMap = new Map<string, { revenue: number; expenses: number }>();
    filteredInvoices.forEach((i) => {
      const curr = dateMap.get(i.date) || { revenue: 0, expenses: 0 };
      if (i.status === 'Paid') {
        curr.revenue += Number(i.amount || 0);
      }
      dateMap.set(i.date, curr);
    });
    filteredExpenses.forEach((e) => {
      const curr = dateMap.get(e.date) || { revenue: 0, expenses: 0 };
      curr.expenses += Number(e.amount || 0);
      dateMap.set(e.date, curr);
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    const timeline = sortedDates.map((d) => {
      const val = dateMap.get(d)!;
      return {
        label: d.length >= 10 ? d.substring(5) : d,
        revenue: val.revenue,
        expenses: val.expenses,
        netProfit: val.revenue - val.expenses,
      };
    });

    // Fallback if no timeline entries exist
    if (timeline.length === 0) {
      timeline.push({ label: 'Period', revenue: totalRevenue, expenses: totalExpenses, netProfit });
    }

    // Truck Profitability for Bar chart
    const truckProfitability = trucks.map((trk) => {
      const trkRevs = filteredInvoices
        .filter((i) => i.truckNumber === trk.truckNumber && i.status === 'Paid')
        .reduce((sum, i) => sum + Number(i.amount || 0), 0);
      const trkExps = filteredExpenses
        .filter((e) => e.truckNumber === trk.truckNumber)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      return {
        truckNumber: trk.truckNumber,
        revenue: trkRevs,
        expenses: trkExps,
        netProfit: trkRevs - trkExps,
      };
    });

    return {
      totalRevenue,
      pendingInvoices,
      totalExpenses,
      netProfit,
      activeTrucksCount,
      totalJobsCount,
      expenseBreakdown,
      timeline,
      truckProfitability,
    };
  };

  // Dedicated Truck Financials
  const getTruckFinancials = (truckId: string): TruckFinancialSummary | null => {
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck) return null;

    const truckInvoices = invoices.filter((i) => i.truckNumber === truck.truckNumber);
    const truckExpenses = expenses.filter((e) => e.truckNumber === truck.truckNumber);

    const revenue = truckInvoices
      .filter((i) => i.status === 'Paid')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    const pendingAmount = truckInvoices
      .filter((i) => i.status === 'Pending')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    const totalExp = truckExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netProfit = revenue - totalExp;

    const sharePercent = truck.sharePercent || 0;
    const ownerShareAmount = netProfit > 0 ? (netProfit * sharePercent) / 100 : 0;
    const companyShareAmount =
      netProfit > 0 ? (netProfit * Math.max(0, 100 - sharePercent)) / 100 : netProfit;

    const expenseBreakdown = EXPENSE_TYPES.map((type) => {
      const amt = truckExpenses
        .filter((e) => e.expenseType === type)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      return {
        type,
        amount: amt,
        color: EXPENSE_COLORS[type],
      };
    }).filter((i) => i.amount > 0);

    const dateMap = new Map<string, { revenue: number; expenses: number }>();
    truckInvoices.forEach((i) => {
      const curr = dateMap.get(i.date) || { revenue: 0, expenses: 0 };
      if (i.status === 'Paid') curr.revenue += Number(i.amount || 0);
      dateMap.set(i.date, curr);
    });
    truckExpenses.forEach((e) => {
      const curr = dateMap.get(e.date) || { revenue: 0, expenses: 0 };
      curr.expenses += Number(e.amount || 0);
      dateMap.set(e.date, curr);
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    const timeline = sortedDates.map((d) => {
      const val = dateMap.get(d)!;
      return {
        date: d,
        revenue: val.revenue,
        expenses: val.expenses,
        netProfit: val.revenue - val.expenses,
      };
    });

    return {
      truck,
      revenue,
      expenses: totalExp,
      netProfit,
      pendingAmount,
      ownerShareAmount,
      companyShareAmount,
      expenseBreakdown,
      timeline,
    };
  };

  // Driver Financials
  const getDriverFinancials = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return null;

    const drvExpenses = expenses.filter(
      (e) => e.driverName === driver.name || e.truckNumber === driver.assignedTruck
    );

    const foodExpenses = drvExpenses
      .filter((e) => e.expenseType === 'Driver Food')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const mobileExpenses = drvExpenses
      .filter((e) => e.expenseType === 'Mobile')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const overtimeExpenses = drvExpenses
      .filter((e) => e.expenseType === 'Overtime')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const otherExpenses = drvExpenses
      .filter(
        (e) =>
          e.expenseType !== 'Driver Food' &&
          e.expenseType !== 'Mobile' &&
          e.expenseType !== 'Overtime'
      )
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const totalDriverCost =
      Number(driver.monthlySalary || 0) + foodExpenses + mobileExpenses + overtimeExpenses;

    return {
      driver,
      foodExpenses,
      mobileExpenses,
      overtimeExpenses,
      otherExpenses,
      totalDriverCost,
    };
  };

  const resetToDemoData = () => {
    setTrucks(INITIAL_TRUCKS);
    setDrivers(INITIAL_DRIVERS);
    setInvoices(INITIAL_INVOICES);
    setExpenses(INITIAL_EXPENSES);
    setSettings(DEFAULT_SETTINGS);
    const { startDate, endDate } = computeDateRange('month');
    setDateFilter({ preset: 'month', startDate, endDate });
    localStorage.removeItem('fleet_trucks');
    localStorage.removeItem('fleet_drivers');
    localStorage.removeItem('fleet_invoices');
    localStorage.removeItem('fleet_expenses');
    localStorage.removeItem('fleet_settings');
  };

  return (
    <FleetContext.Provider
      value={{
        activeSection,
        setActiveSection,
        selectedTruckId,
        setSelectedTruckId,
        settings,
        updateSettings,
        language: settings.language,
        setLanguage,
        dateFilter,
        setDateFilter,
        setDatePreset,

        trucks,
        addTruck,
        updateTruck,
        deleteTruck,

        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        quickAddFoodExpense,
        quickAddMobileExpense,

        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoiceAsPaid,
        toggleInvoiceStatus,

        expenses,
        addExpense,
        updateExpense,
        deleteExpense,

        getDashboardMetrics,
        getTruckFinancials,
        getDriverFinancials,
        formatSAR,
        resetToDemoData,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet must be used within FleetProvider');
  return ctx;
};
