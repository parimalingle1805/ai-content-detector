import React from 'react';
import Sidebar from '../components/Sidebar';
import Scanner from '../components/Scanner';
import ResultDisplay from '../components/ResultDisplay';
import { AnimatePresence } from 'framer-motion';
import { useScanner, type ScanType } from '../hooks/useScanner';
import { useLocation } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { result, onScan, loading, error, setResult } = useScanner();
  const [activeTab, setActiveTab] = React.useState<ScanType>('image');
  const location = useLocation();

  React.useEffect(() => {
    if (location.state?.historicalResult) {
      if (location.state.historicalType === 'text') {
        setActiveTab('text');
      }
      setResult({ type: location.state?.historicalType, ...location.state.historicalResult });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setResult]);

  return (
    <div className="flex h-screen bg-[#020617] text-white font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-10 py-16">
          <header className="mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Content Verification
            </h2>
            <p className="text-xl text-slate-400">
              Detect synthetic media using deep statistical analysis.
            </p>
          </header>

          <div className="space-y-10">
            <Scanner onScanComplete={onScan} isLoading={loading} activeTab={activeTab} onTabChange={setActiveTab} />
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center font-medium">
                {error}
              </div>
            )}

            <AnimatePresence>
              {result && <ResultDisplay result={result} />}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
