export type OwnershipType = 'Company' | 'Shared' | 'Rented';
export type TruckStatus = 'Active' | 'Maintenance' | 'Inactive';
export type DriverStatus = 'Active' | 'On Leave' | 'Inactive';
export type InvoiceStatus = 'Pending' | 'Paid';

export type ExpenseType =
  | 'Driver Food'
  | 'Mobile'
  | 'Fuel'
  | 'Maintenance'
  | 'Tyre'
  | 'Washing'
  | 'Overtime'
  | 'Other';

export interface Truck {
  id: string;
  truckNumber: string; // e.g. BT-01
  plateNumber: string; // e.g. 4512 KSA
  driverName: string; // e.g. Ahmed Al-Ghamdi
  ownershipType: OwnershipType;
  ownerName?: string; // e.g. Sheikh Fahad Al-Otaibi
  sharePercent: number; // e.g. 40 (%)
  status: TruckStatus;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  iqamaNumber: string;
  assignedTruck: string; // e.g. BT-01
  monthlySalary: number; // SAR
  dailyFoodAllowance: number; // SAR (default 25)
  monthlyMobileAllowance: number; // SAR (default 120)
  overtimeRate: number; // SAR / hour
  status: DriverStatus;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. #1001
  date: string; // YYYY-MM-DD
  truckNumber: string; // e.g. BT-01
  driverName: string;
  customerName: string;
  jobDescription: string;
  amount: number; // SAR
  status: InvoiceStatus;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  truckNumber: string; // e.g. BT-01
  driverName: string;
  expenseType: ExpenseType;
  amount: number; // SAR
  description: string;
  notes?: string;
}

export type DateFilterPreset = 'all' | 'today' | 'week' | 'month' | 'prev_month' | 'custom';

export interface DateFilter {
  preset: DateFilterPreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface CompanySettings {
  companyName: string;
  companyNameAr: string;
  currency: string;
  defaultDailyFood: number;
  defaultMonthlyMobile: number;
  language: 'en' | 'ar';
}

export type ActiveSection =
  | 'dashboard'
  | 'trucks'
  | 'drivers'
  | 'invoices'
  | 'expenses'
  | 'reports'
  | 'settings';
