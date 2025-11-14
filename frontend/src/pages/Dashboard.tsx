import { motion } from 'framer-motion';
import { AssetCard } from '@/components/cards/AssetCard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import axiosInstance from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: cryptoData, isLoading: cryptoLoading } = useQuery({
    queryKey: ['crypto-list'],
    queryFn: async () => {
      const topCryptosResponse = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 10,
            page: 1,
            sparkline: false,
          },
        }
      );
      
      const topCryptoIds = topCryptosResponse.data.map((crypto: any) => crypto.id).join(',');
      
      const pricesResponse = await axiosInstance.get(`/api/crypto/price?cryptoId=${topCryptoIds}`);
      
      return topCryptosResponse.data.map((crypto: any) => ({
        ...crypto,
        current_price: pricesResponse.data.prices?.[crypto.id]?.usd || crypto.current_price,
      }));
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ['popular-stocks'],
    queryFn: async () => {
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];
      const requests = symbols.map((symbol) =>
        axiosInstance.get(`/api/stocks/${symbol}/quote`)
      );
      const responses = await Promise.all(requests);
      return responses.map((r) => r.data);
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Market Overview
        </h1>
        <p className="text-muted-foreground">
          Track stocks and cryptocurrencies in real-time
        </p>
      </motion.div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Top Cryptocurrencies</h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {cryptoLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[160px] glass" />
              ))
            ) : (
              cryptoData?.map((crypto: any) => (
                <motion.div key={crypto.id} variants={item}>
                  <AssetCard
                    symbol={crypto.symbol?.toUpperCase() || 'N/A'}
                    name={crypto.name || 'Unknown'}
                    price={crypto.current_price || 0}
                    change24h={crypto.price_change_percentage_24h || 0}
                    type="crypto"
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Popular Stocks</h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {stockLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[160px] glass" />
              ))
            ) : (
              stockData?.map((stock: any, index: number) => (
                <motion.div key={stock.symbol || index} variants={item}>
                  <AssetCard
                    symbol={stock.symbol || 'N/A'}
                    name={stock.name || 'Unknown'}
                    price={stock.price || 0}
                    change24h={stock.changePercent || stock.change || 0}
                    type="stock"
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}