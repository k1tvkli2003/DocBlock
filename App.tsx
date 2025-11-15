import React, { useState } from 'react';
import Header from './components/Header';
import SearchPatient from './components/SearchPatient';
import ReportWarning from './components/ReportWarning';
import WithdrawWarning from './components/WithdrawWarning';
import { PatientProvider } from './context/PatientContext';

export type View = 'search' | 'report' | 'withdraw';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('search');

  const renderView = () => {
    switch(activeView) {
      case 'search':
        return <SearchPatient />;
      case 'report':
        return <ReportWarning />;
      case 'withdraw':
        return <WithdrawWarning />;
      default:
        return <SearchPatient />;
    }
  }

  return (
    <PatientProvider>
      <div className="bg-black min-h-screen text-gray-200">
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
          <Header activeView={activeView} setActiveView={setActiveView} />
          <main className="mt-8">
            {renderView()}
          </main>
        </div>
        <footer className="text-center py-4 mt-8 text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} DocBlock. All rights reserved.</p>
          <p>امنیت شما، اولویت ماست.</p>
        </footer>
      </div>
    </PatientProvider>
  );
};

export default App;