import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp, CalendarX, CalendarCheck, Wallet, Building2, Receipt, PiggyBank, Plus, Trash2, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths } from 'date-fns';
import { getTrainingSessions, formatMonthPolish, formatDatePolish } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHallCosts } from '@/hooks/useHallCosts';
import { useOtherExpenses } from '@/hooks/useOtherExpenses';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import type { Player, AttendanceRecord, PaymentRecord, CancelledSession } from '@/types';

interface ReportsViewProps {
  players: Player[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  cancelledSessions?: CancelledSession[];
  getTotalPaymentsByMonth: (month: string) => number;
}

export function ReportsView({ players, attendance, payments, cancelledSessions = [], getTotalPaymentsByMonth }: ReportsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const monthStr = format(selectedMonth, 'yyyy-MM');
  
  const { canManagePayments } = useAuth();
  const { getHallCost, setHallCost, isUpdating: isUpdatingHallCost } = useHallCosts();
  const { getExpensesByMonth, getTotalExpensesByMonth, addExpense, deleteExpense, isAdding, isDeleting } = useOtherExpenses();

  const [isEditingHallCost, setIsEditingHallCost] = useState(false);
  const [hallCostInput, setHallCostInput] = useState('');
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

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
        amount: payment?.amount || 0,
      };
    }).sort((a, b) => b.attendanceCount - a.attendanceCount);
  }, [players, attendance, payments, activeSessionDates, activeSessions.length, monthStr]);

  const totalPaid = playerStats.filter(s => s.paid).length;
  const avgAttendance = playerStats.length > 0 
    ? Math.round(playerStats.reduce((sum, s) => sum + s.attendanceCount, 0) / playerStats.length)
    : 0;

  // Financial data
  const totalIncome = getTotalPaymentsByMonth(monthStr);
  const hallCost = getHallCost(monthStr);
  const otherExpenses = getExpensesByMonth(monthStr);
  const totalOtherExpenses = getTotalExpensesByMonth(monthStr);
  const monthlyBalance = totalIncome - hallCost - totalOtherExpenses;

  // Calculate total cash balance (all months)
  const allMonths = useMemo(() => {
    const months = new Set<string>();
    payments.forEach(p => months.add(p.month));
    return Array.from(months);
  }, [payments]);

  const totalCashBalance = useMemo(() => {
    let total = 0;
    allMonths.forEach(month => {
      const income = getTotalPaymentsByMonth(month);
      const hall = getHallCost(month);
      const other = getTotalExpensesByMonth(month);
      total += income - hall - other;
    });
    return total;
  }, [allMonths, getTotalPaymentsByMonth, getHallCost, getTotalExpensesByMonth]);

  const handlePrevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const handleNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));

  const handleSaveHallCost = () => {
    const amount = parseFloat(hallCostInput) || 1100;
    setHallCost(monthStr, amount);
    setIsEditingHallCost(false);
  };

  const handleAddExpense = () => {
    if (newExpenseDesc.trim() && newExpenseAmount) {
      addExpense(monthStr, newExpenseDesc.trim(), parseFloat(newExpenseAmount) || 0);
      setNewExpenseDesc('');
      setNewExpenseAmount('');
      setIsAddingExpense(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader subtitle="Raporty miesięczne" />

      {/* Global cash balance */}
      <div className={cn(
        "glass-card rounded-2xl p-4 border-2",
        totalCashBalance >= 0 ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              totalCashBalance >= 0 ? "bg-success/20" : "bg-destructive/20"
            )}>
              <PiggyBank className={cn("w-6 h-6", totalCashBalance >= 0 ? "text-success" : "text-destructive")} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stan kasy</p>
              <p className={cn(
                "text-2xl font-bold",
                totalCashBalance >= 0 ? "text-success" : "text-destructive"
              )}>
                {totalCashBalance.toFixed(0)} zł
              </p>
            </div>
          </div>
          {totalCashBalance >= 0 ? (
            <TrendingUp className="w-8 h-8 text-success/50" />
          ) : (
            <TrendingDown className="w-8 h-8 text-destructive/50" />
          )}
        </div>
      </div>

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

      {/* Financial summary */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Podsumowanie finansowe
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-success mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Wpływy</span>
            </div>
            <p className="text-2xl font-bold text-success">{totalIncome.toFixed(0)} zł</p>
            <p className="text-sm text-muted-foreground">{totalPaid} osób zapłaciło</p>
          </div>
          
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-medium">Koszt hali</span>
            </div>
            {isEditingHallCost ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={hallCostInput}
                  onChange={(e) => setHallCostInput(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="1100"
                />
                <Button size="sm" onClick={handleSaveHallCost} disabled={isUpdatingHallCost}>
                  OK
                </Button>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-destructive">{hallCost.toFixed(0)} zł</p>
                {canManagePayments && (
                  <button 
                    onClick={() => {
                      setHallCostInput(hallCost.toString());
                      setIsEditingHallCost(true);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Zmień
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <Receipt className="w-5 h-5" />
              <span className="text-sm font-medium">Inne koszty</span>
            </div>
            <p className="text-2xl font-bold text-orange-500">{totalOtherExpenses.toFixed(0)} zł</p>
            <p className="text-sm text-muted-foreground">{otherExpenses.length} pozycji</p>
          </div>
          
          <div className={cn(
            "glass-card rounded-2xl p-4",
            monthlyBalance >= 0 ? "ring-2 ring-success/30" : "ring-2 ring-destructive/30"
          )}>
            <div className={cn(
              "flex items-center gap-2 mb-2",
              monthlyBalance >= 0 ? "text-success" : "text-destructive"
            )}>
              <PiggyBank className="w-5 h-5" />
              <span className="text-sm font-medium">Bilans</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              monthlyBalance >= 0 ? "text-success" : "text-destructive"
            )}>
              {monthlyBalance >= 0 ? '+' : ''}{monthlyBalance.toFixed(0)} zł
            </p>
            <p className="text-sm text-muted-foreground">za miesiąc</p>
          </div>
        </div>
      </section>

      {/* Other expenses section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-500" />
            Inne wydatki
          </h2>
          {canManagePayments && !isAddingExpense && (
            <Button size="sm" variant="outline" onClick={() => setIsAddingExpense(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Dodaj
            </Button>
          )}
        </div>

        {isAddingExpense && (
          <div className="glass-card rounded-2xl p-4 mb-4">
            <div className="space-y-3">
              <Input
                placeholder="Opis wydatku (np. Piłki treningowe)"
                value={newExpenseDesc}
                onChange={(e) => setNewExpenseDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    placeholder="Kwota"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    zł
                  </span>
                </div>
                <Button onClick={handleAddExpense} disabled={isAdding || !newExpenseDesc.trim() || !newExpenseAmount}>
                  Dodaj
                </Button>
                <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
                  Anuluj
                </Button>
              </div>
            </div>
          </div>
        )}

        {otherExpenses.length === 0 ? (
          <div className="glass-card rounded-2xl p-4 text-center text-muted-foreground">
            Brak dodatkowych wydatków w tym miesiącu
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-4">
            <div className="space-y-2">
              {otherExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="font-medium text-foreground">{expense.description}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-destructive font-semibold">-{expense.amount.toFixed(0)} zł</span>
                    {canManagePayments && (
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        disabled={isDeleting}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

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
                  {playerStats.map(({ player, attendanceCount, totalSessions, paid, amount }) => (
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
                          {paid ? `${amount.toFixed(0)} zł` : 'Nie'}
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
