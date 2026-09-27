import React, { useState } from 'react';
import { SimpleProvider, useSimpleApp } from './SimpleContext.tsx';
import { SimpleSidebar } from './components/SimpleSidebar.tsx';
import { SimpleHeader } from './components/SimpleHeader.tsx';
import { SimpleDashboard } from './pages/SimpleDashboard.tsx';
import { SimpleTrucks } from './pages/SimpleTrucks.tsx';
import { SimpleDrivers } from './pages/SimpleDrivers.tsx';
import { SimpleInvoices } from './pages/SimpleInvoices.tsx';
import { SimpleExpenses } from './pages/SimpleExpenses.tsx';
import { SimpleReports } from './pages/SimpleReports.tsx';
import { SimpleSettings } from './pages/SimpleSettings.tsx';

const AppLayout: React.FC = () => {
  const { activeSection, language } = useSimpleApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <SimpleDashboard />;
      case 'trucks':
        return <SimpleTrucks />;
      case 'drivers':
        return <SimpleDrivers />;
      case 'invoices':
        return <SimpleInvoices />;
      case 'expenses':
        return <SimpleExpenses />;
      case 'reports':
        return <SimpleReports />;
      case 'settings':
        return <SimpleSettings />;
      default:
        return <SimpleDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-amber-200">
      {/* Sidebar for navigation */}
      <SimpleSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content View with margin for fixed sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          language === 'ar' ? 'md:mr-64' : 'md:ml-64'
        }`}
      >
        <SimpleHeader onToggleMobileMenu={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SimpleProvider>
      <AppLayout />
    </SimpleProvider>
  );
}
