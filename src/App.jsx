import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { WalletProvider } from './contexts/WalletContext';
import { TradingProvider } from './contexts/TradingContext';
import { PerpetualEngineProvider } from './contexts/PerpetualEngineContext';
import { N8nWorkflowsProvider } from './contexts/N8nWorkflowsContext';
import { AIProvider } from './contexts/AIContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import TradingAssistantWidget from './components/AI/TradingAssistantWidget';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <WalletProvider>
          <N8nWorkflowsProvider>
            <TradingProvider>
              <PerpetualEngineProvider>
                <AIProvider>
                  <Router>
                    <div className="min-h-screen bg-dark-900">
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/trading" element={<Trading />} />
                          <Route path="/portfolio" element={<Portfolio />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/settings" element={<Settings />} />
                        </Routes>
                      </Layout>
                      
                      {/* AI Assistant Widget */}
                      <TradingAssistantWidget />
                      
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          style: {
                            background: '#1e293b',
                            color: '#f8fafc',
                            border: '1px solid #334155',
                          },
                        }}
                      />
                    </div>
                  </Router>
                </AIProvider>
              </PerpetualEngineProvider>
            </TradingProvider>
          </N8nWorkflowsProvider>
        </WalletProvider>
      </AppProvider>
    </HelmetProvider>
  );
}

export default App;