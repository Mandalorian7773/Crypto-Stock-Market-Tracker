import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Search, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/useStore';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = useStore((state) => state.userId);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const validateAsset = async (symbol: string) => {
    try {
      const cryptoResponse = await axiosInstance.get(`/api/crypto/price?cryptoId=${symbol.toLowerCase()}`);
      if (cryptoResponse.data && (cryptoResponse.data.usd !== undefined || cryptoResponse.data.symbol)) {
        return { isValid: true, type: 'crypto' };
      }
    } catch (cryptoError) {
      try {
        const stockResponse = await axiosInstance.get(`/api/stocks/${symbol.toUpperCase()}/quote`);
        if (stockResponse.data && stockResponse.data.price) {
          return { isValid: true, type: 'stock' };
        }
      } catch (stockError) {
        return { isValid: false, type: null };
      }
    }
    
    return { isValid: false, type: null };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const symbol = searchQuery.trim().toUpperCase();
      
      const loadingToast = toast({ title: 'Searching...', description: `Looking for ${symbol}...` });
      
      try {
        const { isValid, type } = await validateAsset(symbol);
        
        if (isValid) {
          navigate(`/asset/${symbol}`);
          setSearchQuery('');
          setMobileMenuOpen(false);
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

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/watchlist', label: 'Watchlist' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass sticky top-0 z-50 border-b border-white/10"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="gradient-primary p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MarketTracker
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md">
            <form onSubmit={handleSearch} className="w-full">
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
          </div>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  size="sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            
            {/* User Info Display */}
            <div className="flex items-center gap-2 px-3 py-2 glass border border-white/10 rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-mono truncate max-w-24">
                {userId}
              </span>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <form onSubmit={handleSearch} className="w-full">
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
            
            <nav className="flex flex-col gap-2 pb-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 px-3 py-2 glass border border-white/10 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono truncate">
                    {userId}
                  </span>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </motion.header>
  );
};