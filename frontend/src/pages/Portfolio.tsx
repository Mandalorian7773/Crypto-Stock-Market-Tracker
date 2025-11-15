import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { PortfolioItemCard } from '@/components/cards/PortfolioItemCard';
import { PlotlyChart } from '@/components/charts/PlotlyChart';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useStore } from '@/store/useStore';
import { getPortfolio, removeFromPortfolio } from '@/services/portfolioService';

export default function Portfolio() {
  const { toast } = useToast();
  const userId = useStore((state) => state.userId);

  const { data: portfolio, isLoading, refetch } = useQuery({
    queryKey: ['portfolio', userId],
    queryFn: async () => {
      if (!userId || userId.startsWith('session_')) {
        return [];
      }

      // Fetch portfolio from Firebase
      const result = await getPortfolio(userId);
      if (!result.success) {
        toast({ title: 'Failed to load portfolio', variant: 'destructive' });
        return [];
      }

      const items = result.data;

      const enrichedItems = await Promise.all(
        items.map(async (item: any) => {
          try {
            let currentPrice = 0;
            if (item.type === 'crypto') {
              const cryptoRes = await axiosInstance.get(
                `/api/crypto/price?cryptoId=${item.symbol.toLowerCase()}`
              );
              currentPrice = cryptoRes.data?.usd || 0;
            } else {
              const stockRes = await axiosInstance.get(
                `/api/stocks/${item.symbol}/quote`
              );
              currentPrice = stockRes.data.price;
            }

            const profitLoss = (currentPrice - item.buyPrice) * item.quantity;
            const roiPercent = ((currentPrice - item.buyPrice) / item.buyPrice) * 100;

            return {
              ...item,
              currentPrice,
              profitLoss,
              roiPercent,
            };
          } catch (error) {
            return {
              ...item,
              currentPrice: item.buyPrice,
              profitLoss: 0,
              roiPercent: 0,
            };
          }
        })
      );

      return enrichedItems;
    },
    refetchInterval: 60000,
    staleTime: 30000,
    enabled: !!userId && !userId.startsWith('session_'),
  });

  const handleRemove = async (symbol: string, type: string) => {
    try {
      if (!userId || userId.startsWith('session_')) {
        toast({ title: 'Please sign in to manage portfolio', variant: 'destructive' });
        return;
      }

      const result = await removeFromPortfolio(userId, symbol, type);
      if (result.success) {
        toast({ title: 'Removed from portfolio' });
        refetch();
      } else {
        toast({ title: 'Failed to remove', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to remove', variant: 'destructive' });
    }
  };

  const totalValue = portfolio?.reduce(
    (sum: number, item: any) => sum + item.quantity * item.currentPrice,
    0
  ) || 0;

  const totalProfitLoss = portfolio?.reduce(
    (sum: number, item: any) => sum + item.profitLoss,
    0
  ) || 0;

  const pieData = portfolio
    ? [
        {
          values: portfolio.map((item: any) => item.quantity * item.currentPrice),
          labels: portfolio.map((item: any) => item.symbol),
          type: 'pie',
          marker: {
            colors: [
              '#06b6d4',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
              '#ec4899',
            ],
          },
        },
      ]
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Portfolio
        </h1>
        <p className="text-muted-foreground">Track your investments</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="glass p-6 border-white/10">
          <p className="text-sm text-muted-foreground mb-1">Total Value</p>
          <p className="text-3xl sm:text-4xl font-bold">${totalValue.toFixed(2)}</p>
        </Card>
        <Card className="glass p-6 border-white/10">
          <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
          <p
            className={`text-3xl sm:text-4xl font-bold ${
              totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'
            }`}
          >
            {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)}
          </p>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] glass" />
          ))}
        </div>
      ) : portfolio && portfolio.length > 0 ? (
        <>
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Asset Allocation</h2>
            <PlotlyChart data={pieData} layout={{ height: 300, width: '100%' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.map((item: any) => (
              <PortfolioItemCard
                key={`${item.symbol}-${item.type}`}
                symbol={item.symbol}
                quantity={item.quantity}
                buyPrice={item.buyPrice}
                currentPrice={item.currentPrice}
                profitLoss={item.profitLoss}
                roiPercent={item.roiPercent}
                onRemove={() => handleRemove(item.symbol, item.type)}
              />
            ))}
          </div>
        </>
      ) : (
        <Card className="glass p-8 sm:p-12 text-center border-white/10">
          <p className="text-muted-foreground">
            {userId && !userId.startsWith('session_') 
              ? "Your portfolio is empty. Add some assets to get started!" 
              : "Please sign in to view and manage your portfolio!"}
          </p>
        </Card>
      )}
    </div>
  );
}