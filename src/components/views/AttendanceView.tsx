import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Users, Wallet, Ban, AlertTriangle, ChevronDown } from 'lucide-react';
import { DateSelector } from '@/components/DateSelector';
import { AttendanceCard } from '@/components/AttendanceCard';
import { PaymentToggle } from '@/components/PaymentToggle';
import { getNextTrainingDate, getCurrentMonth, formatMonthPolish } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Player, AttendanceRecord, PaymentRecord } from '@/types';

interface AttendanceViewProps {
  players: Player[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  onAttendanceToggle: (playerId: string, date: string) => void;
  onPaymentToggle: (playerId: string, month: string, amount: number) => void;
  onSplitPayment?: (playerId: string, month: string, currentAmount: number, nextMonthAmount: number) => void;
  canEditAttendance?: boolean;
  canEditPayments?: boolean;
  isAdmin?: boolean;
  cancelledDates?: string[];
  onCancelToggle?: (date: string) => void;
  getPaymentAmount: (playerId: string, month: string) => number;
}

export function AttendanceView({ 
  players, 
  attendance, 
  payments, 
  onAttendanceToggle, 
  onPaymentToggle,
  onSplitPayment,
  canEditAttendance = false,
  canEditPayments = false,
  isAdmin = false,
  cancelledDates = [],
  onCancelToggle,
  getPaymentAmount
}: AttendanceViewProps) {
  const [selectedDate, setSelectedDate] = useState(getNextTrainingDate());
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const currentMonth = getCurrentMonth();

  const isCancelled = cancelledDates.includes(selectedDate);

  const attendanceMap = useMemo(() => {
    const map = new Map<string, boolean>();
    attendance
      .filter(a => a.date === selectedDate)
      .forEach(a => map.set(a.playerId, a.present));
    return map;
  }, [attendance, selectedDate]);

  const paymentMap = useMemo(() => {
    const map = new Map<string, boolean>();
    payments
      .filter(p => p.month === currentMonth)
      .forEach(p => map.set(p.playerId, p.paid));
    return map;
  }, [payments, currentMonth]);

  const playersWithAttendance = useMemo(() => {
    const monthStart = currentMonth + '-01';
    const monthEnd = currentMonth + '-31';
    return players.filter(player =>
      attendance.some(a => a.playerId === player.id && a.present && a.date >= monthStart && a.date <= monthEnd)
    );
  }, [players, attendance, currentMonth]);

  const playersWithoutAttendance = useMemo(() => {
    const withAttendanceIds = new Set(playersWithAttendance.map(p => p.id));
    return players.filter(p => !withAttendanceIds.has(p.id));
  }, [players, playersWithAttendance]);

  // Players without attendance but with a paid record (paid in advance)
  const advancePaidCount = playersWithoutAttendance.filter(p => paymentMap.get(p.id)).length;

  const presentCount = Array.from(attendanceMap.values()).filter(Boolean).length;
  const paidCount = playersWithAttendance.filter(p => paymentMap.get(p.id)).length;

  return (
    <div className="space-y-6 pb-24">
      <PageHeader subtitle="Panel obecności" />

      <DateSelector 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate}
        cancelledDates={cancelledDates}
      />

      {isCancelled && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive">Trening odwołany</p>
            <p className="text-sm text-destructive/80">Brak dostępu do hali</p>
          </div>
        </div>
      )}

      {isAdmin && onCancelToggle && (
        <Button
          variant={isCancelled ? "outline" : "default"}
          className={isCancelled ? "w-full" : "w-full gradient-primary"}
          onClick={() => onCancelToggle(selectedDate)}
        >
          <Ban className="w-4 h-4 mr-2" />
          {isCancelled ? 'Przywróć trening' : 'Odwołaj trening'}
        </Button>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Obecność
          </h2>
          <span className="text-sm font-medium text-success bg-success/10 px-3 py-1 rounded-full">
            {presentCount}/{players.length}
          </span>
        </div>

        {players.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">
              Brak zawodników. Dodaj pierwszego zawodnika w zakładce "Zawodnicy".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              <AttendanceCard
                key={player.id}
                player={player}
                present={attendanceMap.get(player.id) || false}
                onToggle={() => onAttendanceToggle(player.id, selectedDate)}
                disabled={!canEditAttendance || isCancelled}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Płatności - {formatMonthPolish(currentMonth)}
          </h2>
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
                amount={getPaymentAmount(player.id, currentMonth)}
                onToggle={(amount) => onPaymentToggle(player.id, currentMonth, amount)}
                onSplitPayment={onSplitPayment ? (cur, next) => onSplitPayment(player.id, currentMonth, cur, next) : undefined}
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
                  amount={getPaymentAmount(player.id, currentMonth)}
                  onToggle={(amount) => onPaymentToggle(player.id, currentMonth, amount)}
                  onSplitPayment={onSplitPayment ? (cur, next) => onSplitPayment(player.id, currentMonth, cur, next) : undefined}
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
