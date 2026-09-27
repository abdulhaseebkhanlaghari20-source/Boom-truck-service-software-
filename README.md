# Sahra Boom Truck Expense & Profit Tracker

A modern, responsive Saudi boom truck fleet financial, expense, revenue, fuel, maintenance, driver overtime, and profit share tracking system in Saudi Riyal (SAR) with bilingual English and Arabic RTL support.

## Features

- **Dashboard**: Real-time financial metrics (Revenue, Pending, Expenses, Net Profit, Active Trucks, Completed Jobs) with date range filters.
- **Charts**: Interactive revenue vs expenses line/area chart, expense category donut breakdown, and truck profitability comparison bar chart.
- **Trucks**: Fleet listing, status badges, truck ownership (Company, Shared, Rented) and dedicated individual truck financial detail pages with partner profit share calculations.
- **Drivers**: Driver directory, Iqama numbers, food/mobile allowance tracking, and overtime management.
- **Invoices**: Invoice tracking with one-click "Mark as Paid" updating revenue immediately.
- **Expenses**: Categorized expense entries tied directly to trucks and drivers.
- **Reports & PDF Export**: Comprehensive business, truck, expense, and driver reports with clean print/PDF layouts.
- **Settings**: Company details, default allowances, and English / Arabic RTL toggle.

## GitHub Pages Deployment

This project is configured out-of-the-box for GitHub Pages:
1. Vite's `base` path is configured relatively (`./`) to support any repository name without hardcoding.
2. A GitHub Actions workflow is included at `.github/workflows/deploy.yml`.
3. Push to your `main` branch, enable GitHub Pages via GitHub Actions in repository Settings, and your app will be live!

### Local Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```
