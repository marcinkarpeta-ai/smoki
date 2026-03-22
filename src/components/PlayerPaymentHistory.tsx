import { useState, useMemo } from 'react';
import { User, ChevronDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMonthPolish } from '@/utils/dateUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Player, PaymentRecord, AttendanceRecord } from '@/types';

interface PlayerPaymentHistoryProps {
  players: Player[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  allMonths: string[];
}

export function PlayerPaymentHistory({ players, payments, attendance, allMonths }: PlayerPaymentHistoryProps) {
  const [openPlayerId, setOpenPlayerId] = useState<string | null>(null);

  const sortedMonths = useMemo(() => [...allMonths].sort(), [allMonths]);

  // Build a set of (playerId, month) where player attended at least once
  const attendanceByPlayerMonth = useMemo(() => {
    const map = new Set<string>();
    attendance.forEach(a => {
      if (a.present) {
        const month = a.date.substring(0, 7); // yyyy-MM
        map.add(`${a.playerId}:${month}`);
      }
    });
    return map;
  }, [attendance]);

  const playerPayments = useMemo(() => {
    return players.map(player => {
      const playerPays = payments.filter(p => p.playerId === player.id && p.paid);
      const byMonth = sortedMonths.map(month => {
        const pay = playerPays.find(p => p.month === month);
        const hadAttendance = attendanceByPlayerMonth.has(`${player.id}:${month}`);
        const paid = !!pay;
        const amount = pay?.amount || 0;
        // Debt: attended but didn't pay
        const isDebt = hadAttendance && !paid;
        return { month, amount, paid, hadAttendance, isDebt };
      });
      const total = playerPays.reduce((sum, p) => sum + p.amount, 0);
      const debtCount = byMonth.filter(m => m.isDebt).length;
      return { player, byMonth, total, paidMonths: playerPays.length, debtCount };
    }).sort((a, b) => b.debtCount - a.debtCount || b.total - a.total);
  }, [players, payments, sortedMonths, attendanceByPlayerMonth]);

  return (
    <section>
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Historia płatności zawodników
      </h2>

      <div className="space-y-2">
        {playerPayments.map(({ player, byMonth, total, paidMonths, debtCount }) => (
          <Collapsible
            key={player.id}
            open={openPlayerId === player.id}
            onOpenChange={(open) => setOpenPlayerId(open ? player.id : null)}
          >
            <CollapsibleTrigger className={cn(
              "w-full glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-muted/30 transition-colors",
              debtCount > 0 && "border border-destructive/30"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground",
                  debtCount > 0 ? "bg-destructive" : "gradient-primary"
                )}>
                  {player.firstName[0]}{player.lastName[0]}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">
                    {player.firstName} {player.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {debtCount > 0 ? (
                      <span className="text-destructive font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                        {debtCount} {debtCount === 1 ? 'zaległy miesiąc' : debtCount < 5 ? 'zaległe miesiące' : 'zaległych miesięcy'}
                      </span>
                    ) : (
                      <>{paidMonths} {paidMonths === 1 ? 'miesiąc' : paidMonths < 5 ? 'miesiące' : 'miesięcy'}</>
                    )}
                    {' • łącznie '}{total.toFixed(0)} zł
                  </p>
                </div>
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                openPlayerId === player.id && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mx-2 mt-1 mb-2 rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Miesiąc</th>
                      <th className="text-center px-4 py-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground">Kwota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byMonth.map(({ month, amount, paid, hadAttendance, isDebt }) => (
                      <tr key={month} className={cn(
                        "border-b border-border/50 last:border-0",
                        isDebt && "bg-destructive/5"
                      )}>
                        <td className="px-4 py-2.5 text-sm font-medium text-foreground">
                          {formatMonthPolish(month)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {paid ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/20 text-success">Zapłacono</span>
                          ) : isDebt ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Zaległość</span>
                          ) : hadAttendance ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Brak wpłaty</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Brak obecności</span>
                          )}
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
                      <td className="px-4 py-2.5 text-sm font-bold text-foreground" colSpan={2}>Razem</td>
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
