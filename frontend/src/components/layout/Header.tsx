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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = useStore((state) => state.userId);
  const setUserId = useStore((state) => state.setUserId);
  const setWatchlist = useStore((state) => state.setWatchlist);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'profile' | 'signin'>('profile');

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

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple local authentication - in a real app, this would call an API
    if (email && password) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({ 
          title: 'Sign in failed', 
          description: 'Please enter a valid email address',
          variant: 'destructive'
        });
        return;
      }
      
      // Store the full email and set user ID to everything before @
      setUserId(email); // Store full email
      setAuthMode('profile');
      setEmail('');
      setPassword('');
      toast({ title: 'Signed in successfully' });
    } else {
      toast({ 
        title: 'Sign in failed', 
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
    }
  };

  const handleSignOut = () => {
    // Generate a new session ID when signing out
    const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(sessionId);
    setWatchlist([]); // Clear the watchlist for anonymous user
    setAuthMode('signin');
    toast({ title: 'Signed out successfully' });
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
            
            {/* Clickable Profile */}
            <Dialog open={profileOpen} onOpenChange={(open) => {
              setProfileOpen(open);
              if (!open) {
                setAuthMode('profile');
                setEmail('');
                setPassword('');
              }
            }}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 glass border border-white/10 rounded-lg"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono truncate max-w-24">
                    {userId && !userId.startsWith('session_') ? userId.split('@')[0] : 'Sign In'}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-white/10">
                <DialogHeader>
                  <DialogTitle>
                    {authMode === 'profile' ? 'User Profile' : 'Sign In'}
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {authMode === 'profile' ? (
                    userId && !userId.startsWith('session_') ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">User ID</p>
                          <p className="font-mono text-sm">{userId.split('@')[0]}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="text-sm">
                            {userId}
                          </p>
                        </div>
                        <Button onClick={handleSignOut} variant="outline" className="w-full">
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Not signed in. Using session ID: {userId}
                        </p>
                        <Button onClick={() => setAuthMode('signin')} className="w-full">
                          Sign In
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="glass border-white/10"
                        />
                        <Input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="glass border-white/10"
                        />
                      </div>
                      <Button onClick={handleSignIn} className="w-full">
                        Sign In
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Local authentication for demo purposes
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
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
              
              {/* Mobile Profile */}
              <div className="pt-2 border-t border-white/10">
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-2 px-3 py-2 glass border border-white/10 rounded-lg justify-start"
                  onClick={() => setProfileOpen(true)}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono truncate">
                    {userId && !userId.startsWith('session_') ? userId.split('@')[0] : 'Sign In'}
                  </span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </motion.header>
  );
};