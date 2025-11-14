import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { PortfolioItemCard } from '@/components/cards/PortfolioItemCard';
import { PlotlyChart } from '@/components/charts/PlotlyChart';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export default function Portfolio() {
  const { toast } = useToast();

  const { data: portfolio, isLoading, refetch } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/portfolio/list');
      const items = response.data;

      const enrichedItems = await Promise.all(
        items.map(async (item: any) => {
          try {
            let currentPrice = 0;
            if (item.type === 'crypto') {
              // Use our backend API for crypto prices
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
    refetchInterval: 60000, // Reduced frequency to avoid rate limiting
    staleTime: 30000,
  });

  const handleRemove = async (symbol: string) => {
    try {
      await axiosInstance.delete(`/api/portfolio/remove/${symbol}`);
      toast({ title: 'Removed from portfolio' });
      refetch();
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
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Portfolio
        </h1>
        <p className="text-muted-foreground">Track your investments</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="glass p-6 border-white/10">
          <p className="text-sm text-muted-foreground mb-1">Total Value</p>
          <p className="text-4xl font-bold">${totalValue.toFixed(2)}</p>
        </Card>
        <Card className="glass p-6 border-white/10">
          <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
          <p
            className={`text-4xl font-bold ${
              totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'
            }`}
          >
            {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)}
          </p>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] glass" />
          ))}
        </div>
      ) : portfolio && portfolio.length > 0 ? (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Asset Allocation</h2>
            <PlotlyChart data={pieData} layout={{ height: 400 }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.map((item: any) => (
              <PortfolioItemCard
                key={item.symbol}
                symbol={item.symbol}
                quantity={item.quantity}
                buyPrice={item.buyPrice}
                currentPrice={item.currentPrice}
                profitLoss={item.profitLoss}
                roiPercent={item.roiPercent}
                onRemove={() => handleRemove(item.symbol)}
              />
            ))}
          </div>
        </>
      ) : (
        <Card className="glass p-12 text-center border-white/10">
          <p className="text-muted-foreground">
            Your portfolio is empty. Add some assets to get started!
          </p>
        </Card>
      )}
    </div>
  );
}