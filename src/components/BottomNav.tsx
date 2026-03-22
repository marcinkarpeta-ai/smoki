import { ClipboardCheck, Wallet, BarChart3, Users, UserCog, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import type { Tab } from '@/pages/Index';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  showPlayers?: boolean;
  showUsers?: boolean;
}

export function BottomNav({ activeTab, onTabChange, showPlayers = false, showUsers = false }: BottomNavProps) {
  const { signOut } = useAuth();

  const tabs = [
    { id: 'attendance' as const, label: 'Obecność', icon: ClipboardCheck, show: true },
    { id: 'reports' as const, label: 'Raporty', icon: BarChart3, show: true },
    { id: 'players' as const, label: 'Zawodnicy', icon: Users, show: showPlayers },
    { id: 'users' as const, label: 'Użytkownicy', icon: UserCog, show: showUsers },
  ].filter(tab => tab.show);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full tap-target gap-1 transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-200",
                isActive && "gradient-primary glow-primary"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive && "text-primary-foreground"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive && "text-primary"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="flex flex-col items-center justify-center h-full gap-1 text-muted-foreground hover:text-foreground"
        >
          <div className="p-2">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">Wyloguj</span>
        </Button>
      </div>
    </nav>
  );
}
