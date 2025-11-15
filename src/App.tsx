import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import StockDetail from './components/StockDetail';
import Header from './components/Header';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'stock'>('dashboard');
  const [selectedStock, setSelectedStock] = useState<string>('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/stock/')) {
        const encodedSymbol = hash.substring(8); // Remove '#/stock/'
        const symbol = decodeURIComponent(encodedSymbol);
        setSelectedStock(symbol);
        setCurrentView('stock');
      } else {
        setCurrentView('dashboard');
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleBackToDashboard = () => {
    window.location.hash = '#/';
    setCurrentView('dashboard');
  };

  return (
    <div className="App">
      {currentView === 'dashboard' && <Header />}
      <main className="main-content">
        {currentView === 'dashboard' ? (
          <Dashboard />
        ) : (
          <StockDetail 
            symbol={selectedStock}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
}

export default App;