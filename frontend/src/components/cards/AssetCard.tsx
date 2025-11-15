import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface AssetCardProps {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  type: 'stock' | 'crypto';
}

export const AssetCard = ({ symbol, name, price, change24h, type }: AssetCardProps) => {
  const navigate = useNavigate();
  const isPositive = change24h >= 0;

  const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
  const validChange24h = typeof change24h === 'number' && !isNaN(change24h) ? change24h : 0;
  const isValidSymbol = symbol && symbol !== 'N/A';

  const handleClick = () => {
    if (isValidSymbol) {
      navigate(`/asset/${symbol}`);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: isValidSymbol ? 1.02 : 1 }}
      whileTap={{ scale: isValidSymbol ? 0.98 : 1 }}
      onClick={handleClick}
      className={`cursor-${isValidSymbol ? 'pointer' : 'not-allowed'}`}
    >
      <Card className={`glass p-4 border-white/10 ${isValidSymbol ? 'hover:border-primary/50' : ''} transition-all`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground uppercase">{type}</p>
            <h3 className="text-lg font-bold">{symbol}</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[150px]">{name}</p>
          </div>
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-success/20' : 'bg-destructive/20'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>
        <div className="flex items-end justify-between mt-4">
          <div>
            <p className="text-xl sm:text-2xl font-bold">${validPrice.toFixed(2)}</p>
          </div>
          <div
            className={`text-sm font-semibold ${
              isPositive ? 'text-success' : 'text-destructive'
            }`}
          >
            {isPositive ? '+' : ''}
            {validChange24h.toFixed(2)}%
          </div>
        </div>
      </Card>
    </motion.div>
  );
};