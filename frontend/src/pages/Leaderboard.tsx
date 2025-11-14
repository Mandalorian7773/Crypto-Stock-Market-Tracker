import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/leaderboard/top');
      return response.data;
    },
    refetchInterval: 60000,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-muted-foreground">{rank}</span>;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500/50';
      case 2:
        return 'bg-gray-400/10 border-gray-400/50';
      case 3:
        return 'bg-orange-600/10 border-orange-600/50';
      default:
        return 'glass border-white/10';
    }
  };

  const maskUserId = (userId: string) => {
    if (userId.length <= 8) return userId;
    return `${userId.slice(0, 4)}...${userId.slice(-4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">Top performing portfolios</p>
      </motion.div>

      <Card className="glass border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 glass" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead className="text-right">Portfolio Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard?.map((entry: any, index: number) => (
                  <motion.tr
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-white/10 ${getRankClass(entry.rank)}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {maskUserId(entry.userId)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        entry.roiPercent >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {entry.roiPercent >= 0 ? '+' : ''}
                      {entry.roiPercent.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${entry.portfolioValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}