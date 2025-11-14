import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { AssetCard } from '@/components/cards/AssetCard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Watchlist() {
  const { watchlist } = useStore();

  const { data: assets, isLoading } = useQuery({
    queryKey: ['watchlist-assets', watchlist],
    queryFn: async () => {
      if (watchlist.length === 0) return [];

      const results = await Promise.all(
        watchlist.map(async (symbol) => {
          try {
    
            const cryptoRes = await axios.get(
              `https://api.coingecko.com/api/v3/coins/markets`,
              {
                params: {
                  vs_currency: 'usd',
                  ids: symbol.toLowerCase(),
                },
              }
            );
            if (cryptoRes.data.length > 0) {
              const crypto = cryptoRes.data[0];
              
              // Then get price from our backend API
              const priceRes = await axiosInstance.get(`/api/crypto/price?cryptoId=${symbol.toLowerCase()}`);
              
              return {
                symbol: crypto.symbol.toUpperCase(),
                name: crypto.name,
                price: priceRes.data?.usd || crypto.current_price,
                change24h: crypto.price_change_percentage_24h,
                type: 'crypto' as const,
              };
            }
          } catch (error) {
            console.error('Error fetching crypto:', error);
          }

          try {
            const stockRes = await axiosInstance.get(`/api/stocks/${symbol}/quote`);
            return {
              symbol: stockRes.data.symbol,
              name: stockRes.data.name,
              price: stockRes.data.price,
              change24h: stockRes.data.changePercent,
              type: 'stock' as const,
            };
          } catch (error) {
            console.error('Error fetching stock:', error);
            return null;
          }
        })
      );

      return results.filter((r) => r !== null);
    },
    refetchInterval: 60000, // Reduced frequency to avoid rate limiting
    enabled: watchlist.length > 0,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Watchlist
        </h1>
        <p className="text-muted-foreground">Monitor your favorite assets</p>
      </motion.div>

      {watchlist.length === 0 ? (
        <Card className="glass p-12 text-center border-white/10">
          <p className="text-muted-foreground">
            Your watchlist is empty. Add assets from the asset details page!
          </p>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: watchlist.length }).map((_, i) => (
            <Skeleton key={i} className="h-[160px] glass" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {assets?.map((asset: any) => (
            <AssetCard
              key={asset.symbol}
              symbol={asset.symbol}
              name={asset.name}
              price={asset.price}
              change24h={asset.change24h}
              type={asset.type}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}