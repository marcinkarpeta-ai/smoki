import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Wallet, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaymentToggle } from '@/components/PaymentToggle';
import { getCurrentMonth, formatMonthPolish } from '@/utils/dateUtils';
import { PageHeader } from '@/components/PageHeader';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addMonths, subMonths, format } from 'date-fns';
import type { Player, AttendanceRecord, PaymentRecord } from '@/types';

interface PaymentsViewProps {
  players: Player[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  onPaymentToggle: (playerId: string, month: string, amount: number) => void;
  onSplitPayment?: (playerId: string, month: string, currentAmount: number, nextMonthAmount: number) => void;
  canEditPayments?: boolean;
  getPaymentAmount: (playerId: string, month: string) => number;
}

export function PaymentsView({
  players,
  attendance,
  payments,
  onPaymentToggle,
  onSplitPayment,
  canEditPayments = false,
  getPaymentAmount
}: PaymentsViewProps) {
  const currentMonth = getCurrentMonth();
  const [paymentMonth, setPaymentMonth] = useState(currentMonth);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [advanceOpen, setAdvanceOpen] = useState(false);

  const maxMonth = format(addMonths(new Date(), 2), 'yyyy-MM');
  const minMonth = '2026-01';

  const availableMonths = useMemo(() => {
    const months: string[] = [];
    let current = new Date(minMonth + '-01');
    const max = new Date(maxMonth + '-01');
    while (current <= max) {
      months.push(format(current, 'yyyy-MM'));
      current = addMonths(current, 1);
    }
    return months;
  }, [maxMonth]);

  const handlePrevMonth = () => {
    const prev = format(subMonths(new Date(paymentMonth + '-01'), 1), 'yyyy-MM');
    if (prev >= minMonth) setPaymentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = format(addMonths(new Date(paymentMonth + '-01'), 1), 'yyyy-MM');
    if (next <= maxMonth) setPaymentMonth(next);
  };

  const paymentMap = useMemo(() => {
    const map = new Map<string, boolean>();
    payments
      .filter(p => p.month === paymentMonth)
      .forEach(p => map.set(p.playerId, p.paid));
    return map;
  }, [payments, paymentMonth]);

  const playersWithAttendance = useMemo(() => {
    const monthStart = paymentMonth + '-01';
    const monthEnd = paymentMonth + '-31';
    return players.filter(player =>
      attendance.some(a => a.playerId === player.id && a.present && a.date >= monthStart && a.date <= monthEnd)
    );
  }, [players, attendance, paymentMonth]);

  const playersWithoutAttendance = useMemo(() => {
    const withAttendanceIds = new Set(playersWithAttendance.map(p => p.id));
    return players.filter(p => !withAttendanceIds.has(p.id));
  }, [players, playersWithAttendance]);

  const advancePaidCount = playersWithoutAttendance.filter(p => paymentMap.get(p.id)).length;
  const paidCount = playersWithAttendance.filter(p => paymentMap.get(p.id)).length;

  return (
    <div className="space-y-6 pb-24">
      <PageHeader subtitle="Panel płatności" />

      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <button
              onClick={handlePrevMonth}
              disabled={paymentMonth <= minMonth}
              className="p-1 rounded-lg hover:bg-muted/50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
              <PopoverTrigger asChild>
                <button className="text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                  {formatMonthPolish(paymentMonth)}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 max-h-64 overflow-y-auto pointer-events-auto" align="center">
                <div className="space-y-0.5">
                  {availableMonths.map(month => (
                    <button
                      key={month}
                      onClick={() => { setPaymentMonth(month); setMonthPickerOpen(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        month === paymentMonth
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {formatMonthPolish(month)}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <button
              onClick={handleNextMonth}
              disabled={paymentMonth >= maxMonth}
              className="p-1 rounded-lg hover:bg-muted/50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
          <span className="text-sm font-medium text-success bg-success/10 px-3 py-1 rounded-full">
            {paidCount}/{playersWithAttendance.length}
          </span>
        </div>

        {playersWithAttendance.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">
              Brak zawodników z obecnością w tym miesiącu.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {playersWithAttendance.map((player) => (
              <PaymentToggle
                key={player.id}
                player={player}
                paid={paymentMap.get(player.id) || false}
                amount={getPaymentAmount(player.id, paymentMonth)}
                onToggle={(amount) => onPaymentToggle(player.id, paymentMonth, amount)}
                onSplitPayment={onSplitPayment ? (cur, next) => onSplitPayment(player.id, paymentMonth, cur, next) : undefined}
                disabled={!canEditPayments}
              />
            ))}
          </div>
        )}

        {playersWithoutAttendance.length > 0 && canEditPayments && (
          <Collapsible open={advanceOpen} onOpenChange={setAdvanceOpen} className="mt-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">
                Opłać z góry ({playersWithoutAttendance.length - advancePaidCount} bez obecności)
              </span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", advanceOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {playersWithoutAttendance.map((player) => (
                <PaymentToggle
                  key={player.id}
                  player={player}
                  paid={paymentMap.get(player.id) || false}
                  amount={getPaymentAmount(player.id, paymentMonth)}
                  onToggle={(amount) => onPaymentToggle(player.id, paymentMonth, amount)}
                  onSplitPayment={onSplitPayment ? (cur, next) => onSplitPayment(player.id, paymentMonth, cur, next) : undefined}
                  disabled={!canEditPayments}
                  variant="advance"
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </section>
    </div>
  );
}
