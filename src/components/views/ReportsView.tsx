import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp, CalendarX, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths } from 'date-fns';
import { getTrainingSessions, formatMonthPolish, formatDatePolish } from '@/utils/dateUtils';
import type { Player, AttendanceRecord, PaymentRecord, CancelledSession } from '@/types';

interface ReportsViewProps {
  players: Player[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  cancelledSessions?: CancelledSession[];
}

export function ReportsView({ players, attendance, payments, cancelledSessions = [] }: ReportsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const monthStr = format(selectedMonth, 'yyyy-MM');

  const sessions = useMemo(() => getTrainingSessions(selectedMonth), [selectedMonth]);
  
  const cancelledInMonth = useMemo(() => 
    cancelledSessions.filter(s => s.sessionDate.startsWith(monthStr)),
    [cancelledSessions, monthStr]
  );
  
  const cancelledDates = new Set(cancelledInMonth.map(s => s.sessionDate));
  const activeSessions = sessions.filter(s => !cancelledDates.has(s.date));
  const activeSessionDates = new Set(activeSessions.map(s => s.date));

  const playerStats = useMemo(() => {
    return players.map(player => {
      const attendanceCount = attendance.filter(
        a => a.playerId === player.id && 
             a.present && 
             activeSessionDates.has(a.date)
      ).length;

      const payment = payments.find(
        p => p.playerId === player.id && p.month === monthStr
      );

      return {
        player,
        attendanceCount,
        totalSessions: activeSessions.length,
        paid: payment?.paid || false,
      };
    }).sort((a, b) => b.attendanceCount - a.attendanceCount);
  }, [players, attendance, payments, activeSessionDates, activeSessions.length, monthStr]);

  const totalPaid = playerStats.filter(s => s.paid).length;
  const avgAttendance = playerStats.length > 0 
    ? Math.round(playerStats.reduce((sum, s) => sum + s.attendanceCount, 0) / playerStats.length)
    : 0;

  const handlePrevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const handleNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-4">
        <h1 className="text-2xl font-bold text-foreground">
          Basket<span className="text-gradient">Manager</span>
        </h1>
        <p className="text-muted-foreground mt-1">Raporty miesięczne</p>
      </header>

      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="w-12 h-12 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center tap-target transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <p className="text-primary font-bold text-lg">
              {formatMonthPolish(monthStr)}
            </p>
            <p className="text-sm text-muted-foreground">
              {sessions.length} zaplanowanych
            </p>
          </div>
          
          <button
            onClick={handleNextMonth}
            className="w-12 h-12 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center tap-target transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 text-success mb-2">
            <CalendarCheck className="w-5 h-5" />
            <span className="text-sm font-medium">Odbyte</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{activeSessions.length}</p>
          <p className="text-sm text-muted-foreground">z {sessions.length} treningów</p>
        </div>
        
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <CalendarX className="w-5 h-5" />
            <span className="text-sm font-medium">Odwołane</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{cancelledInMonth.length}</p>
          <p className="text-sm text-muted-foreground">brak hali</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Śr. obecność</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{avgAttendance}</p>
          <p className="text-sm text-muted-foreground">z {activeSessions.length} treningów</p>
        </div>
        
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 text-success mb-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">Zapłacone</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalPaid}</p>
          <p className="text-sm text-muted-foreground">z {players.length} osób</p>
        </div>
      </div>

      {cancelledInMonth.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <CalendarX className="w-5 h-5 text-destructive" />
            Odwołane treningi
          </h2>
          <div className="glass-card rounded-2xl p-4">
            <div className="space-y-2">
              {cancelledInMonth.map(session => (
                <div key={session.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="font-medium text-foreground">{formatDatePolish(session.sessionDate)}</span>
                  <span className="text-sm text-muted-foreground">{session.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Szczegóły
        </h2>

        {playerStats.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Brak danych za ten miesiąc.</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Zawodnik</th>
                    <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Obecności</th>
                    <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Płatność</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStats.map(({ player, attendanceCount, totalSessions, paid }) => (
                    <tr key={player.id} className="border-b border-border/50 last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                            {player.firstName[0]}{player.lastName[0]}
                          </div>
                          <span className="font-medium text-foreground">
                            {player.firstName} {player.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-foreground">{attendanceCount}</span>
                        <span className="text-muted-foreground">/{totalSessions}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium",
                          paid 
                            ? "bg-success/20 text-success" 
                            : "bg-destructive/20 text-destructive"
                        )}>
                          {paid ? 'Tak' : 'Nie'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
