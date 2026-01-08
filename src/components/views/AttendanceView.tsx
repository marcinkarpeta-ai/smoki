import { useState, useMemo } from 'react';
import { Users, Wallet } from 'lucide-react';
import { DateSelector } from '@/components/DateSelector';
import { AttendanceCard } from '@/components/AttendanceCard';
import { PaymentToggle } from '@/components/PaymentToggle';
import { getNextTrainingDate, getCurrentMonth, formatMonthPolish } from '@/utils/dateUtils';
import type { Player, AttendanceRecord, PaymentRecord } from '@/types';

interface AttendanceViewProps {
  players: Player[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  onAttendanceToggle: (playerId: string, date: string) => void;
  onPaymentToggle: (playerId: string, month: string) => void;
  canEditAttendance?: boolean;
  canEditPayments?: boolean;
}

export function AttendanceView({ 
  players, 
  attendance, 
  payments, 
  onAttendanceToggle, 
  onPaymentToggle,
  canEditAttendance = false,
  canEditPayments = false
}: AttendanceViewProps) {
  const [selectedDate, setSelectedDate] = useState(getNextTrainingDate());
  const currentMonth = getCurrentMonth();

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

      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

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
                disabled={!canEditAttendance}
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
                onToggle={() => onPaymentToggle(player.id, currentMonth)}
                disabled={!canEditPayments}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
