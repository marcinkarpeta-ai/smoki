import { useState, useMemo } from 'react';
import { Users, Wallet, Ban, AlertTriangle } from 'lucide-react';
import { DateSelector } from '@/components/DateSelector';
import { AttendanceCard } from '@/components/AttendanceCard';
import { PaymentToggle } from '@/components/PaymentToggle';
import { getNextTrainingDate, getCurrentMonth, formatMonthPolish } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import type { Player, AttendanceRecord, PaymentRecord } from '@/types';

interface AttendanceViewProps {
  players: Player[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  onAttendanceToggle: (playerId: string, date: string) => void;
  onPaymentToggle: (playerId: string, month: string, amount: number) => void;
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
  canEditAttendance = false,
  canEditPayments = false,
  isAdmin = false,
  cancelledDates = [],
  onCancelToggle,
  getPaymentAmount
}: AttendanceViewProps) {
  const [selectedDate, setSelectedDate] = useState(getNextTrainingDate());
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

  const presentCount = Array.from(attendanceMap.values()).filter(Boolean).length;
  const paidCount = Array.from(paymentMap.values()).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-4">
        <h1 className="text-2xl font-bold text-foreground">
          Basket<span className="text-gradient">Manager</span>
        </h1>
        <p className="text-muted-foreground mt-1">Panel obecności</p>
      </header>

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
          variant={isCancelled ? "outline" : "destructive"}
          className="w-full"
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
            {paidCount}/{players.length}
          </span>
        </div>

        {players.length > 0 && (
          <div className="space-y-3">
            {players.map((player) => (
              <PaymentToggle
                key={player.id}
                player={player}
                paid={paymentMap.get(player.id) || false}
                amount={getPaymentAmount(player.id, currentMonth)}
                onToggle={(amount) => onPaymentToggle(player.id, currentMonth, amount)}
                disabled={!canEditPayments}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
