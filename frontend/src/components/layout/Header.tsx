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
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  signInAnonymously, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = useStore((state) => state.userId);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Signed in successfully' });
      setUserMenuOpen(false);
      setEmail('');
      setPassword('');
      setAuthMode('signin');
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        default:
          errorMessage = error.message || 'Failed to sign in';
      }
      
      toast({ 
        title: 'Sign in failed', 
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: 'Account created successfully' });
      setUserMenuOpen(false);
      setEmail('');
      setPassword('');
      setAuthMode('signin');
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account already exists with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = error.message || 'Failed to create account';
      }
      
      toast({ 
        title: 'Sign up failed', 
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ 
        title: 'Password reset email sent', 
        description: 'Check your email for password reset instructions' 
      });
      setAuthMode('signin');
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send password reset email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message || 'Failed to send password reset email';
      }
      
      toast({ 
        title: 'Password reset failed', 
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Sign in anonymously after signing out
      await signInAnonymously(auth);
      toast({ title: 'Signed out successfully' });
      setUserMenuOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Sign out failed', 
        description: error.message || 'Failed to sign out',
        variant: 'destructive'
      });
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
            
            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="rounded-full"
              >
                <User className="h-5 w-5" />
              </Button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 glass border border-white/10 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">User ID</p>
                      <p className="font-mono text-sm truncate">{userId}</p>
                    </div>
                    
                    {userId && !userId.startsWith('dev-') && !userId.startsWith('anonymous') ? (
                      <Button 
                        onClick={handleSignOut}
                        variant="outline" 
                        className="w-full"
                      >
                        Sign Out
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        {authMode === 'signin' && (
                          <>
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
                            <Button 
                              onClick={handleSignIn}
                              className="w-full"
                            >
                              Sign In
                            </Button>
                            <div className="flex justify-between text-xs">
                              <button 
                                onClick={() => setAuthMode('signup')}
                                className="text-primary hover:underline"
                              >
                                Create Account
                              </button>
                              <button 
                                onClick={() => setAuthMode('reset')}
                                className="text-primary hover:underline"
                              >
                                Forgot Password?
                              </button>
                            </div>
                          </>
                        )}
                        
                        {authMode === 'signup' && (
                          <>
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
                                placeholder="Password (6+ characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass border-white/10"
                              />
                            </div>
                            <Button 
                              onClick={handleSignUp}
                              className="w-full"
                            >
                              Sign Up
                            </Button>
                            <button 
                              onClick={() => setAuthMode('signin')}
                              className="text-xs text-primary hover:underline w-full"
                            >
                              Already have an account? Sign In
                            </button>
                          </>
                        )}
                        
                        {authMode === 'reset' && (
                          <>
                            <div className="space-y-2">
                              <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass border-white/10"
                              />
                            </div>
                            <Button 
                              onClick={handlePasswordReset}
                              className="w-full"
                            >
                              Reset Password
                            </Button>
                            <button 
                              onClick={() => setAuthMode('signin')}
                              className="text-xs text-primary hover:underline w-full"
                            >
                              Back to Sign In
                            </button>
                          </>
                        )}
                        
                        <p className="text-xs text-muted-foreground text-center">
                          Currently signed in anonymously
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              
              {/* Mobile User Menu */}
              <div className="pt-2 border-t border-white/10">
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm truncate">{userId}</p>
                </div>
                
                {userId && !userId.startsWith('dev-') && !userId.startsWith('anonymous') ? (
                  <Button 
                    onClick={handleSignOut}
                    variant="outline" 
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {authMode === 'signin' && (
                      <>
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
                        <Button 
                          onClick={handleSignIn}
                          className="w-full"
                        >
                          Sign In
                        </Button>
                        <div className="flex justify-between text-xs">
                          <button 
                            onClick={() => setAuthMode('signup')}
                            className="text-primary hover:underline"
                          >
                            Create Account
                          </button>
                          <button 
                            onClick={() => setAuthMode('reset')}
                            className="text-primary hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </>
                    )}
                    
                    {authMode === 'signup' && (
                      <>
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
                            placeholder="Password (6+ characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass border-white/10"
                          />
                        </div>
                        <Button 
                          onClick={handleSignUp}
                          className="w-full"
                        >
                          Sign Up
                        </Button>
                        <button 
                          onClick={() => setAuthMode('signin')}
                          className="text-xs text-primary hover:underline w-full"
                        >
                          Already have an account? Sign In
                        </button>
                      </>
                    )}
                    
                    {authMode === 'reset' && (
                      <>
                        <div className="space-y-2">
                          <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="glass border-white/10"
                          />
                        </div>
                        <Button 
                          onClick={handlePasswordReset}
                          className="w-full"
                        >
                          Reset Password
                        </Button>
                        <button 
                          onClick={() => setAuthMode('signin')}
                          className="text-xs text-primary hover:underline w-full"
                        >
                          Back to Sign In
                        </button>
                      </>
                    )}
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Currently signed in anonymously
                    </p>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </motion.header>
  );
};