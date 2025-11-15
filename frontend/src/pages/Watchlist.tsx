import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { AssetCard } from '@/components/cards/AssetCard';
import { useQuery } from '@tanstack/react-query';
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
            // Map symbol to CoinGecko ID like in AssetDetails
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

            const cryptoId = cryptoIdMap[symbol?.toLowerCase() || ''] || symbol?.toLowerCase();

            // Try to get crypto data first
            const cryptoRes = await axiosInstance.get(`/api/crypto/price?cryptoId=${cryptoId}`);
            if (cryptoRes.data) {
              // Check if this is a multi-price response
              if (cryptoRes.data.prices && Object.keys(cryptoRes.data.prices).length > 0) {
                // Get the first price from the prices object
                const priceKeys = Object.keys(cryptoRes.data.prices);
                const firstPrice = cryptoRes.data.prices[priceKeys[0]];
                return {
                  symbol: firstPrice.symbol || symbol,
                  name: firstPrice.name || symbol,
                  price: firstPrice.usd || 0,
                  change24h: firstPrice.usd_24h_change || 0,
                  type: 'crypto' as const,
                };
              } else {
                // Single price response
                return {
                  symbol: cryptoRes.data.symbol || symbol,
                  name: cryptoRes.data.name || symbol,
                  price: cryptoRes.data.usd || 0,
                  change24h: cryptoRes.data.usd_24h_change || 0,
                  type: 'crypto' as const,
                };
              }
            }
          } catch (cryptoError) {
            // Crypto failed, try stock data
            try {
              const stockRes = await axiosInstance.get(`/api/stocks/${symbol}/quote`);
              if (stockRes.data) {
                return {
                  symbol: stockRes.data.symbol,
                  name: stockRes.data.name,
                  price: stockRes.data.price,
                  change24h: stockRes.data.changePercent,
                  type: 'stock' as const,
                };
              }
            } catch (stockError) {
              console.error(`Error fetching data for ${symbol}:`, stockError);
              // Return basic data if both fail
              return {
                symbol: symbol,
                name: symbol,
                price: 0,
                change24h: 0,
                type: 'unknown' as const,
              };
            }
          }
        })
      );

      // Filter out any null results and ensure unique keys
      return results.filter((r) => r !== null);
    },
    refetchInterval: 60000,
    enabled: watchlist.length > 0,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Watchlist
        </h1>
        <p className="text-muted-foreground">Monitor your favorite assets</p>
      </motion.div>

      {watchlist.length === 0 ? (
        <Card className="glass p-8 sm:p-12 text-center border-white/10">
          <p className="text-muted-foreground">
            Your watchlist is empty. Add assets from the asset details page!
          </p>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: watchlist.length }).map((_, i) => (
            <Skeleton key={i} className="h-[160px] glass" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {assets?.map((asset: any, index: number) => (
            <AssetCard
              key={`${asset.symbol}-${asset.type}-${index}`}
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