import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { AttendanceView } from '@/components/views/AttendanceView';
import { ReportsView } from '@/components/views/ReportsView';
import { PlayersView } from '@/components/views/PlayersView';
import { UsersView } from '@/components/views/UsersView';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';
import { useAttendance } from '@/hooks/useAttendance';
import { usePayments } from '@/hooks/usePayments';
import { useCancelledSessions } from '@/hooks/useCancelledSessions';
import { Loader2 } from 'lucide-react';

export type Tab = 'attendance' | 'reports' | 'players' | 'users';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, canManagePlayers, canManageUsers, canManageAttendance, canManagePayments, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  
  const { players, addPlayer, deletePlayer } = usePlayers();
  const { attendance, toggleAttendance } = useAttendance();
  const { payments, togglePayment } = usePayments();
  const { cancelledSessions, toggleCancel } = useCancelledSessions();
  
  const cancelledDates = cancelledSessions.map(s => s.sessionDate);

  // Sort players alphabetically by first name
  const sortedPlayers = [...players].sort((a, b) => 
    a.firstName.localeCompare(b.firstName, 'pl')
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Reset tab if user doesn't have permission
  useEffect(() => {
    if (activeTab === 'players' && !canManagePlayers) {
      setActiveTab('attendance');
    }
    if (activeTab === 'users' && !canManageUsers) {
      setActiveTab('attendance');
    }
  }, [activeTab, canManagePlayers, canManageUsers]);

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

  const handlePaymentToggle = (playerId: string, month: string) => {
    if (canManagePayments) {
      togglePayment(playerId, month);
    }
  };

  const handleAddPlayer = (firstName: string, lastName: string) => {
    if (canManagePlayers) {
      addPlayer(firstName, lastName);
    }
  };

  const handleDeletePlayer = (id: string) => {
    if (canManagePlayers) {
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
            payments={payments}
            onAttendanceToggle={handleAttendanceToggle}
            onPaymentToggle={handlePaymentToggle}
            canEditAttendance={canManageAttendance}
            canEditPayments={canManagePayments}
            isAdmin={isAdmin}
            cancelledDates={cancelledDates}
            onCancelToggle={toggleCancel}
          />
        )}
        
        {activeTab === 'reports' && (
          <ReportsView
            players={sortedPlayers}
            attendance={attendance}
            payments={payments}
            cancelledSessions={cancelledSessions}
          />
        )}
        
        {activeTab === 'players' && canManagePlayers && (
          <PlayersView
            players={sortedPlayers}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
          />
        )}

        {activeTab === 'users' && canManageUsers && (
          <UsersView />
        )}
      </main>
      
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        showPlayers={canManagePlayers}
        showUsers={canManageUsers}
      />
    </div>
  );
};

export default Index;
