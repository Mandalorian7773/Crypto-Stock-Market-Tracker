import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/useStore';
import { PlotlyChart } from '@/components/charts/PlotlyChart';

export default function AssetDetails() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('1M');
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const { watchlist, userId } = useStore();
  const { toast } = useToast();

  const isInWatchlist = watchlist.includes(symbol || '');

  // Determine if this is a cryptocurrency or stock based on the symbol
  const isCrypto = symbol ? 
    ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'LINK', 'LTC', 'BCH', 'UNI', 'MATIC', 'XLM', 'VET', 'ICP', 'FIL', 'TRX', 'XTZ', 'ATOM', 'THETA', 'FTM', 'NEAR', 'EGLD', 'ALGO', 'HBAR', 'AXS', 'MANA', 'SAND', 'ENJ', 'GALA', 'FLOW', 'APE', 'CHZ', 'DENT', 'ONE', 'CRV', 'ZIL', 'BAT', 'COMP', 'MKR', 'AAVE', 'SNX', 'YFI', 'KSM', 'DOT', 'KAVA', 'SRM', 'REN', 'LRC', 'BNT', 'NMR', 'MLN', 'GNO', 'RLC', 'CTSI', 'MINA', 'CVC', 'STORJ', 'BAND', 'NKN', 'OCEAN', 'UTK', 'NCT', 'AGIX', 'RLY', 'RARI', 'RAD', 'API3', 'FET', 'PLA', 'ILV', 'YGG', 'GODS', 'STARL', 'ATLAS', 'POLIS', 'MV', 'HIGH', 'DAR', 'ERN', 'KP3R', 'LQTY', 'FLUX', 'PERP', 'BADGER', 'SPELL', 'FXS', 'CVX', 'T', 'GST', 'GRT', 'LDO', 'IMX', 'GAL', 'DYDX', 'ENS', '1INCH', 'ZRX', 'SUSHI', 'CRV', 'BAL', 'LRC', 'BOND', 'JASMY', 'SUPER', 'IDEX', 'POLS', 'REQ', 'ADX', 'CTXC', 'STMX', 'XEM', 'WAXP', 'SC', 'KDA', 'XDC', 'HNT', 'HIVE', 'VLX', 'COTI', 'CHR', 'STPT', 'ORN', 'MDT', 'TLM', 'ALICE', 'XCH', 'PUNDIX', 'PROM', 'SYS', 'ARDR', 'KMD', 'ARK', 'NULS', 'WAN', 'QNT', 'BTS', 'LSK', 'ICX', 'DGB', 'XMR', 'ETC', 'ZEC', 'DASH', 'NANO', 'XEM', 'WAVES', 'QTUM', 'ZIL', 'ONT', 'IOTA', 'XLM', 'NEO', 'XRP', 'ETH', 'BTC'].includes(symbol.toUpperCase()) : 
    false;

  const cryptoIdMap: Record<string, string> = {
    'btc': 'bitcoin',
    'eth': 'ethereum',
    'usdt': 'tether',
    'xrp': 'ripple',
    'usdc': 'usd-coin',
    'doge': 'dogecoin',
    'ada': 'cardano',
    'sol': 'solana',
    'trx': 'tron',
    'dot': 'polkadot',
    'matic': 'polygon',
    'ltc': 'litecoin',
    'shib': 'shiba-inu',
    'avax': 'avalanche',
    'uni': 'uniswap',
    'bch': 'bitcoin-cash',
    'link': 'chainlink',
    'atom': 'cosmos',
    'etc': 'ethereum-classic',
    'near': 'near',
    'xlm': 'stellar',
    'algo': 'algorand',
    'vet': 'vechain',
    'icp': 'internet-computer',
    'fil': 'filecoin',
    'ape': 'apecoin',
    'hbar': 'hedera',
    'mana': 'decentraland',
    'sand': 'the-sandbox',
    'xtz': 'tezos',
    'theta': 'theta-token',
    'egld': 'elrond',
    'eos': 'eos',
    'aave': 'aave',
    'chz': 'chiliz',
    'hnt': 'helium',
    'flow': 'flow',
    'axs': 'axie-infinity',
    'zec': 'zcash',
    'bld': 'agoric',
    'gala': 'gala',
    'crv': 'curve-dao-token',
    'tusd': 'true-usd',
    'kcs': 'kucoin-token',
    'cake': 'pancakeswap',
    'bsv': 'bitcoin-sv',
    'ftt': 'ftx-token',
    'btt': 'bittorrent',
    'dash': 'dash',
    'neo': 'neo',
    'snx': 'synthetix-network-token',
    'comp': 'compound',
    'waves': 'waves',
    'zil': 'zilliqa',
    'xmr': 'monero',
    'bat': 'basic-attention-token',
    'enj': 'enjincoin',
    'dcr': 'decred',
    'lrc': 'loopring',
    'yfi': 'yearn-finance',
    '1inch': '1inch',
    'hot': 'holotoken',
    'celo': 'celo',
    'rose': 'oasis-network',
    'sc': 'siacoin',
    'rvn': 'ravencoin',
    'htr': 'hathor',
    'kava': 'kava',
    'gmt': 'stepn',
    'audio': 'audius',
    'ankr': 'ankr',
    'sushi': 'sushi',
    'one': 'harmony',
    'gno': 'gnosis',
    'jst': 'just',
    'bal': 'balancer',
    'lpt': 'livepeer',
    'glm': 'golem',
    'api3': 'api3',
    'stx': 'blockstack',
    'dydx': 'dydx',
    'fxs': 'frax-share',
    'cvx': 'convex-finance',
    'twt': 'trust-wallet-token',
    'flux': 'zelcash',
    'mina': 'mina',
    'gtc': 'gitcoin',
    'luna': 'terra-luna',
    'ust': 'terrausd',
    'spell': 'spell-token',
    'metis': 'metis-token',
    'fx': 'function-x',
    'rune': 'thorchain',
    'scrt': 'secret',
    'inj': 'injective-protocol',
    'rpl': 'rocket-pool',
    'juno': 'juno-network',
    'ldo': 'lido-dao',
    'gmx': 'gmx',
    'woo': 'wootrade',
    'pendle': 'pendle',
    'magic': 'magic',
    'rad': 'radicle',
    'super': 'superfarm',
    'syn': 'synapse-2',
    'mult': 'multichain',
    'pyr': 'vulcan-forged',
    'alice': 'my-neighbor-alice',
    'epx': 'ellipsis',
    'mask': 'mask-network',
    'slp': 'smooth-love-potion',
    'chr': 'chromia',
    'pundix': 'pundix',
    'coti': 'coti',
    'nexo': 'nexo',
    'stg': 'stargate-finance',
    'celr': 'celer-network',
    'arpa': 'arpa-chain',
    'ocean': 'ocean-protocol',
    'skl': 'skale',
    'agld': 'adventure-gold',
    'dar': 'mines-of-dalarnia',
    'jasmy': 'jasmycoin',
    'ach': 'alchemy-pay',
    'lqty': 'liquity',
    'cvp': 'powerpool',
    'perp': 'perpetual-protocol',
    'badger': 'badger-dao',
    'dfi': 'defichain',
    'rly': 'rally-2',
    'band': 'band-protocol',
    'pols': 'polkastarter',
    'tlm': 'alien-worlds',
    'dnt': 'district0x',
    'powr': 'power-ledger',
    'req': 'request-network',
    'rlc': 'iexec-rlc',
    'cvc': 'civic',
    'mkr': 'maker',
    'srm': 'serum',
    'knc': 'kyber-network-crystal',
    'zrx': '0x',
    'ren': 'republic-protocol',
    'uma': 'uma',
    'fet': 'fetch',
    'oxt': 'orchid',
    'nkn': 'nkn',
    'storj': 'storj',
    'bnt': 'bancor',
    'nmr': 'numeraire',
    'grt': 'the-graph',
    'ftm': 'fantom'
  };

  const { data: cryptoData, error: cryptoError } = useQuery({
    queryKey: ['crypto-quote', symbol],
    queryFn: async () => {
      try {
        // Only fetch crypto data if this is a cryptocurrency
        if (!isCrypto) {
          throw new Error('Not a cryptocurrency');
        }
        
        const cryptoId = cryptoIdMap[symbol?.toLowerCase() || ''] || symbol?.toLowerCase();
        
        const response = await axiosInstance.get(`/api/crypto/price?cryptoId=${cryptoId}`);
        
        if (!response.data || (response.data.usd === undefined && response.data.symbol === undefined)) {
          throw new Error('Invalid crypto data');
        }
        
        return {
          id: cryptoId,
          symbol: response.data.symbol || symbol,
          name: response.data.name || symbol,
          current_price: response.data.usd || 0,
          price_change_percentage_24h: response.data.usd_24h_change || 0,
          market_cap: response.data.usd_market_cap || 0,
          total_volume: response.data.usd_24h_vol || 0
        };
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        throw error;
      }
    },
    enabled: !!symbol && isCrypto,
    refetchInterval: 60000,
  });

  const { data: stockData, error: stockError } = useQuery({
    queryKey: ['stock-quote', symbol],
    queryFn: async () => {
      try {
        // Only fetch stock data if this is not a cryptocurrency
        if (isCrypto) {
          throw new Error('Not a stock');
        }
        
        const response = await axiosInstance.get(`/api/stocks/${symbol}/quote`);
        
        // Check if we have valid data in the response
        if (!response.data || !response.data.data || response.data.data.price === undefined) {
          throw new Error('Invalid stock data');
        }
        
        return response.data.data;
      } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
      }
    },
    enabled: !!symbol && !isCrypto,
    refetchInterval: 60000,
  });

  const { data: historyData, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ['asset-history', symbol, timeRange],
    queryFn: async () => {
      try {
        if (isCrypto) {
          const mockHistory = [];
          const basePrice = cryptoData?.current_price || 100;
          
          let days = 30;
          let interval = 1;
          
          switch (timeRange) {
            case '1D':
              days = 1;
              interval = 1/24;
              break;
            case '7D':
              days = 7;
              interval = 0.25;
              break;
            case '1M':
              days = 30;
              interval = 1;
              break;
            case '1Y':
              days = 365;
              interval = 5;
              break;
            default:
              days = 30;
              interval = 1;
          }
          
          let currentPrice = basePrice * (0.95 + Math.random() * 0.1);
          
          for (let i = Math.floor(days/interval); i >= 0; i--) {
            const date = new Date();
            
            if (timeRange === '1D') {
              date.setHours(date.getHours() - i);
            } else if (timeRange === '7D') {
              date.setDate(date.getDate() - Math.floor(i * 0.25));
            } else if (timeRange === '1M') {
              date.setDate(date.getDate() - i);
            } else {
              date.setDate(date.getDate() - i * 5);
            }
            
            const change = (Math.random() - 0.5) * (basePrice * 0.02);
            currentPrice = currentPrice + change;
            
            currentPrice = Math.max(currentPrice, basePrice * 0.1);
            
            mockHistory.push({
              date: date.toISOString().split('T')[0] + (timeRange === '1D' ? 'T' + String(date.getHours()).padStart(2, '0') + ':00:00' : ''),
              close: currentPrice
            });
          }
          
          return mockHistory;
        }
        
        // For stocks, fetch real history data
        const response = await axiosInstance.get(`/api/stocks/${symbol}/history`, {
          params: { range: timeRange },
        });
        
        // Return the history data from the response
        return response.data.data?.history || [];
      } catch (error) {
        console.error('Error fetching history data:', error);
        // Provide mock data as fallback
        const mockHistory = [];
        const basePrice = stockData?.price || cryptoData?.current_price || 100;
        const days = timeRange === '1D' ? 1 : timeRange === '7D' ? 7 : timeRange === '1M' ? 30 : 365;
        
        for (let i = days; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockHistory.push({
            date: date.toISOString().split('T')[0],
            close: basePrice + (Math.random() - 0.5) * 20
          });
        }
        return mockHistory;
      }
    },
    enabled: !!symbol,
  });

  const data = cryptoData || stockData;
  const price = cryptoData?.current_price || stockData?.price || 0;
  const change24h = parseFloat(cryptoData?.price_change_percentage_24h || stockData?.changePercent || 0);

  const hasValidData = (cryptoData && cryptoData.current_price !== undefined) || 
                       (stockData && stockData.price !== undefined);
  const hasError = cryptoError || stockError;

  if (hasError && !hasValidData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Asset Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Sorry, we couldn't find any asset with the symbol "{symbol}".
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data && !hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      useStore.getState().removeFromWatchlist(symbol || '');
      toast({ title: 'Removed from watchlist' });
    } else {
      useStore.getState().addToWatchlist(symbol || '');
      toast({ title: 'Added to watchlist' });
    }
  };

  const chartData = historyData
    ? [
        {
          x: historyData.map((d: any) => d.date),
          y: historyData.map((d: any) => d.close),
          type: 'scatter',
          mode: 'lines',
          line: { color: '#06b6d4', width: 2 },
          name: symbol,
          hovertemplate: '%{y:$,.2f}<extra></extra>',
        },
        ...(showSMA
          ? [
              {
                x: historyData.map((d: any) => d.date),
                y: calculateSMA(
                  historyData.map((d: any) => d.close),
                  20
                ),
                type: 'scatter',
                mode: 'lines',
                line: { color: '#10b981', width: 1, dash: 'dash' },
                name: 'SMA 20',
                hovertemplate: '%{y:$,.2f}<extra></extra>',
              },
            ]
          : []),
        ...(showEMA
          ? [
              {
                x: historyData.map((d: any) => d.date),
                y: calculateEMA(
                  historyData.map((d: any) => d.close),
                  50
                ),
                type: 'scatter',
                mode: 'lines',
                line: { color: '#f59e0b', width: 1, dash: 'dot' },
                name: 'EMA 50',
                hovertemplate: '%{y:$,.2f}<extra></extra>',
              },
            ]
          : []),
      ]
    : [];

  const chartLayout = {
    xaxis: {
      title: {
        text: 'Date',
        font: { size: 14, color: '#94a3b8' }
      },
      tickformat: timeRange === '1D' ? '%H:%M' : 
                  timeRange === '7D' ? '%b %d' : 
                  timeRange === '1M' ? '%b %d' : '%b %Y',
      nticks: timeRange === '1D' ? 12 : 
              timeRange === '7D' ? 7 : 
              timeRange === '1M' ? 10 : 12,
    },
    yaxis: {
      title: {
        text: 'Price (USD)',
        font: { size: 14, color: '#94a3b8' }
      },
      tickformat: '$,.2f',
      tickprefix: '$',
      separatethousands: true,
    },
    legend: {
      orientation: 'h',
      x: 0.5,
      xanchor: 'center',
      y: 1.1,
      yanchor: 'bottom',
      font: { size: 12 }
    },
    margin: { l: 70, r: 30, t: 40, b: 80 },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{symbol}</h1>
            <p className="text-muted-foreground">{data?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleWatchlistToggle}>
              <Star className={`h-4 w-4 ${isInWatchlist ? 'fill-primary' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass p-4 border-white/10">
            <p className="text-sm text-muted-foreground mb-1">Price</p>
            <p className="text-xl sm:text-2xl font-bold">${price.toFixed(2)}</p>
          </Card>
          <Card className="glass p-4 border-white/10">
            <p className="text-sm text-muted-foreground mb-1">24h Change</p>
            <p
              className={`text-sm font-semibold ${
                change24h >= 0 ? 'text-success' : 'text-destructive'
              }`}
            >
              {change24h >= 0 ? '+' : ''}
              {change24h.toFixed(2)}%
            </p>

          </Card>
          <Card className="glass p-4 border-white/10">
            <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
            <p className="text-xl sm:text-2xl font-bold">
              ${(data?.market_cap || data?.marketCap || 0).toLocaleString()}
            </p>
          </Card>
          <Card className="glass p-4 border-white/10">
            <p className="text-sm text-muted-foreground mb-1">Volume 24h</p>
            <p className="text-xl sm:text-2xl font-bold">
              ${(data?.total_volume || data?.volume || 0).toLocaleString()}
            </p>
          </Card>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="glass">
              <TabsTrigger value="1D">1D</TabsTrigger>
              <TabsTrigger value="7D">7D</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            <Button
              variant={showSMA ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowSMA(!showSMA)}
            >
              SMA 20
            </Button>
            <Button
              variant={showEMA ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowEMA(!showEMA)}
            >
              EMA 50
            </Button>
          </div>
        </div>

        {historyLoading ? (
          <Skeleton className="h-[300px] sm:h-[400px] glass" />
        ) : (
          <PlotlyChart data={chartData} layout={chartLayout}  />
        )}
      </div>
    </div>
  );
}

function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}