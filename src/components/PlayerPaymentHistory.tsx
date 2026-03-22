import { useState, useMemo } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMonthPolish } from '@/utils/dateUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Player, PaymentRecord } from '@/types';

interface PlayerPaymentHistoryProps {
  players: Player[];
  payments: PaymentRecord[];
  allMonths: string[];
}

export function PlayerPaymentHistory({ players, payments, allMonths }: PlayerPaymentHistoryProps) {
  const [openPlayerId, setOpenPlayerId] = useState<string | null>(null);

  const sortedMonths = useMemo(() => [...allMonths].sort(), [allMonths]);

  const playerPayments = useMemo(() => {
    return players.map(player => {
      const playerPays = payments.filter(p => p.playerId === player.id && p.paid);
      const byMonth = sortedMonths.map(month => {
        const pay = playerPays.find(p => p.month === month);
        return { month, amount: pay?.amount || 0, paid: !!pay };
      });
      const total = playerPays.reduce((sum, p) => sum + p.amount, 0);
      return { player, byMonth, total, paidMonths: playerPays.length };
    }).sort((a, b) => b.total - a.total);
  }, [players, payments, sortedMonths]);

  return (
    <section>
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Historia płatności zawodników
      </h2>

      <div className="space-y-2">
        {playerPayments.map(({ player, byMonth, total, paidMonths }) => (
          <Collapsible
            key={player.id}
            open={openPlayerId === player.id}
            onOpenChange={(open) => setOpenPlayerId(open ? player.id : null)}
          >
            <CollapsibleTrigger className="w-full glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {player.firstName[0]}{player.lastName[0]}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">
                    {player.firstName} {player.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {paidMonths} {paidMonths === 1 ? 'miesiąc' : paidMonths < 5 ? 'miesiące' : 'miesięcy'} • łącznie {total.toFixed(0)} zł
                  </p>
                </div>
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 text-muted-foreground transition-transform",
                openPlayerId === player.id && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mx-2 mt-1 mb-2 rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Miesiąc</th>
                      <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground">Kwota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byMonth.map(({ month, amount, paid }) => (
                      <tr key={month} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-2.5 text-sm font-medium text-foreground">
                          {formatMonthPolish(month)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {paid ? (
                            <span className="text-sm font-semibold text-success">{amount.toFixed(0)} zł</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/20">
                      <td className="px-4 py-2.5 text-sm font-bold text-foreground">Razem</td>
                      <td className="px-4 py-2.5 text-right text-sm font-bold text-success">{total.toFixed(0)} zł</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </section>
  );
}
