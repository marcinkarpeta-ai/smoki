import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { AttendanceView } from '@/components/views/AttendanceView';
import { ReportsView } from '@/components/views/ReportsView';
import { PlayersView } from '@/components/views/PlayersView';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Player, AttendanceRecord, PaymentRecord } from '@/types';

type Tab = 'attendance' | 'reports' | 'players';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  
  const [players, setPlayers] = useLocalStorage<Player[]>('basketmanager_players', []);
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('basketmanager_attendance', []);
  const [payments, setPayments] = useLocalStorage<PaymentRecord[]>('basketmanager_payments', []);

  // Sort players alphabetically by first name
  const sortedPlayers = [...players].sort((a, b) => 
    a.firstName.localeCompare(b.firstName, 'pl')
  );

  const handleAddPlayer = (firstName: string, lastName: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    setAttendance(prev => prev.filter(a => a.playerId !== id));
    setPayments(prev => prev.filter(p => p.playerId !== id));
  };

  const handleAttendanceToggle = (playerId: string, date: string) => {
    setAttendance(prev => {
      const existing = prev.find(a => a.playerId === playerId && a.date === date);
      if (existing) {
        return prev.map(a => 
          a.playerId === playerId && a.date === date 
            ? { ...a, present: !a.present }
            : a
        );
      }
      return [...prev, { playerId, date, present: true }];
    });
  };

  const handlePaymentToggle = (playerId: string, month: string) => {
    setPayments(prev => {
      const existing = prev.find(p => p.playerId === playerId && p.month === month);
      if (existing) {
        return prev.map(p => 
          p.playerId === playerId && p.month === month 
            ? { ...p, paid: !p.paid }
            : p
        );
      }
      return [...prev, { playerId, month, paid: true }];
    });
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
          />
        )}
        
        {activeTab === 'reports' && (
          <ReportsView
            players={sortedPlayers}
            attendance={attendance}
            payments={payments}
          />
        )}
        
        {activeTab === 'players' && (
          <PlayersView
            players={sortedPlayers}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
          />
        )}
      </main>
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
