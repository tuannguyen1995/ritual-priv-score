import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { defineChain } from 'viem';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ScoreDetails from './pages/ScoreDetails';
import './index.css';

const ritualTestnet = defineChain({
  id: 1979,
  name: 'Ritual Testnet',
  network: 'ritual-testnet',
  nativeCurrency: { decimals: 18, name: 'Ritual', symbol: 'RITUAL' },
  rpcUrls: {
    default: { http: ['https://rpc.ritualfoundation.org'] },
    public: { http: ['https://rpc.ritualfoundation.org'] },
  },
});

const config = getDefaultConfig({
  appName: 'Ritual PrivScore',
  projectId: 'c8f7422f4bd0ec623714b62db4eb8b22', // Standard public test ID
  chains: [ritualTestnet],
  transports: {
    [ritualTestnet.id]: http('https://rpc.ritualfoundation.org'),
  },
});

const queryClient = new QueryClient();

function App() {
  const [currentTheme, setCurrentTheme] = React.useState('dark');

  React.useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    setCurrentTheme(theme);
    document.documentElement.className = theme === 'light' ? 'light-theme' : '';
    
    // Listen for custom event if theme is toggled elsewhere
    const handleThemeChange = (e) => setCurrentTheme(e.detail);
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={currentTheme === 'dark' ? darkTheme() : lightTheme()}
          modalSize="compact"
        >
          <div className="bg-grid"></div>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/details/:address" element={<ScoreDetails />} />
            </Routes>
          </Router>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: currentTheme === 'dark' ? '#1E232D' : '#ffffff',
                color: currentTheme === 'dark' ? '#fff' : '#000',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
