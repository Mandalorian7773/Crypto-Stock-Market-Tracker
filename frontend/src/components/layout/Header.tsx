import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => location.pathname === path;

  const validateAsset = async (symbol: string) => {
    try {
      // First try to fetch as crypto
      const cryptoResponse = await axiosInstance.get(`/api/crypto/price?cryptoId=${symbol.toLowerCase()}`);
      if (cryptoResponse.data && (cryptoResponse.data.usd !== undefined || cryptoResponse.data.symbol)) {
        return { isValid: true, type: 'crypto' };
      }
    } catch (cryptoError) {
      // Crypto not found, try stock
      try {
        const stockResponse = await axiosInstance.get(`/api/stocks/${symbol.toUpperCase()}/quote`);
        if (stockResponse.data && stockResponse.data.price) {
          return { isValid: true, type: 'stock' };
        }
      } catch (stockError) {
        // Neither crypto nor stock found
        return { isValid: false, type: null };
      }
    }
    
    return { isValid: false, type: null };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const symbol = searchQuery.trim().toUpperCase();
      
      // Show loading state
      const loadingToast = toast({ title: 'Searching...', description: `Looking for ${symbol}...` });
      
      try {
        const { isValid, type } = await validateAsset(symbol);
        
        if (isValid) {
          navigate(`/asset/${symbol}`);
          setSearchQuery('');
        } else {
          toast({ 
            title: 'Asset not found', 
            description: `Could not find asset with symbol: ${symbol}`,
            variant: 'destructive'
          });
        }
      } catch (error) {
        toast({ 
          title: 'Search failed', 
          description: 'An error occurred while searching for the asset',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass sticky top-0 z-50 border-b border-white/10"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="gradient-primary p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MarketTracker
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks or crypto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass border-white/10"
              />
            </div>
          </form>

          <nav className="flex items-center gap-2">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button
                variant={isActive('/portfolio') ? 'default' : 'ghost'}
                size="sm"
              >
                Portfolio
              </Button>
            </Link>
            <Link to="/watchlist">
              <Button
                variant={isActive('/watchlist') ? 'default' : 'ghost'}
                size="sm"
              >
                Watchlist
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button
                variant={isActive('/leaderboard') ? 'default' : 'ghost'}
                size="sm"
              >
                Leaderboard
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </motion.header>
  );
};