import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import Dashboard from './pages/Dashboard';
import AssetDetails from './pages/AssetDetails';
import Portfolio from './pages/Portfolio';
import Leaderboard from './pages/Leaderboard';
import Watchlist from './pages/Watchlist';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const AppContent = () => {
  useFirebaseAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/asset/:symbol" element={<AssetDetails />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
