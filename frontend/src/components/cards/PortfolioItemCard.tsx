import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PortfolioItemCardProps {
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  profitLoss: number;
  roiPercent: number;
  onRemove: () => void;
}

export const PortfolioItemCard = ({
  symbol,
  quantity,
  buyPrice,
  currentPrice,
  profitLoss,
  roiPercent,
  onRemove,
}: PortfolioItemCardProps) => {
  const isProfit = profitLoss >= 0;
  const totalValue = quantity * currentPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="glass p-4 border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold">{symbol}</h3>
            <p className="text-sm text-muted-foreground">
              {quantity} shares @ ${buyPrice.toFixed(2)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Price</p>
            <p className="text-base sm:text-lg font-semibold">${currentPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-base sm:text-lg font-semibold">${totalValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">P&L</p>
            <p
              className={`text-base sm:text-lg font-semibold ${
                isProfit ? 'text-success' : 'text-destructive'
              }`}
            >
              {isProfit ? '+' : ''}${profitLoss.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ROI</p>
            <p
              className={`text-base sm:text-lg font-semibold ${
                isProfit ? 'text-success' : 'text-destructive'
              }`}
            >
              {isProfit ? '+' : ''}
              {roiPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};