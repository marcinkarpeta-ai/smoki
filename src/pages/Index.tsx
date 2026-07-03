import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { AttendanceView } from '@/components/views/AttendanceView';
import { PaymentsView } from '@/components/views/PaymentsView';
import { ReportsView } from '@/components/views/ReportsView';
import { PlayersView } from '@/components/views/PlayersView';
import { UsersView } from '@/components/views/UsersView';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';
import { useAttendance } from '@/hooks/useAttendance';
import { usePayments } from '@/hooks/usePayments';
import { useCancelledSessions } from '@/hooks/useCancelledSessions';
import { Loader2 } from 'lucide-react';

export type Tab = 'attendance' | 'payments' | 'reports' | 'players' | 'users';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, canAddPlayers, canDeletePlayers, canViewPlayersTab, canManageUsers, canManageAttendance, canManagePayments, isAdmin, isPlayer } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(() => 'attendance');
  
  const { players, addPlayer, deletePlayer } = usePlayers();
  const { attendance, toggleAttendance } = useAttendance();
  const { payments, togglePayment, splitPayment, getPaymentAmount, getTotalPaymentsByMonth } = usePayments();
  const { cancelledSessions, toggleCancel } = useCancelledSessions();
  
  const cancelledDates = cancelledSessions.map(s => s.sessionDate);

  const sortedPlayers = [...players].sort((a, b) => 
    a.firstName.localeCompare(b.firstName, 'pl')
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (activeTab === 'players' && !canViewPlayersTab) {
      setActiveTab('attendance');
    }
    if (activeTab === 'users' && !canManageUsers) {
      setActiveTab('attendance');
    }
  }, [activeTab, canViewPlayersTab, canManageUsers]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeTab]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleAttendanceToggle = (playerId: string, date: string) => {
    if (canManageAttendance) {
      toggleAttendance(playerId, date);
    }
  };

  const handlePaymentToggle = (playerId: string, month: string, amount: number) => {
    if (canManagePayments) {
      togglePayment(playerId, month, amount);
    }
  };

  const handleSplitPayment = (playerId: string, month: string, currentAmount: number, nextMonthAmount: number) => {
    if (canManagePayments) {
      splitPayment(playerId, month, currentAmount, nextMonthAmount);
    }
  };

  const handleAddPlayer = (firstName: string, lastName: string) => {
    if (canAddPlayers) {
      addPlayer(firstName, lastName);
    }
  };

  const handleDeletePlayer = (id: string) => {
    if (canDeletePlayers) {
      deletePlayer(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-lg mx-auto px-4">
        {activeTab === 'attendance' && (
          <AttendanceView
            players={sortedPlayers}
            attendance={attendance}
            onAttendanceToggle={handleAttendanceToggle}
            canEditAttendance={canManageAttendance}
            isAdmin={isAdmin}
            cancelledDates={cancelledDates}
            onCancelToggle={toggleCancel}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            players={sortedPlayers}
            attendance={attendance}
            payments={payments}
            onPaymentToggle={handlePaymentToggle}
            onSplitPayment={handleSplitPayment}
            canEditPayments={canManagePayments}
            getPaymentAmount={getPaymentAmount}
          />
        )}
        
        {activeTab === 'reports' && (
          <ReportsView
            players={sortedPlayers}
            attendance={attendance}
            payments={payments}
            cancelledSessions={cancelledSessions}
            getTotalPaymentsByMonth={getTotalPaymentsByMonth}
          />
        )}
        
        {activeTab === 'players' && canViewPlayersTab && (
          <PlayersView
            players={sortedPlayers}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
            canAdd={canAddPlayers}
            canDelete={canDeletePlayers}
          />
        )}

        {activeTab === 'users' && canManageUsers && (
          <UsersView />
        )}
      </main>
      
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        showPlayers={canViewPlayersTab}
        showUsers={canManageUsers}
      />
    </div>
  );
};

export default Index;
