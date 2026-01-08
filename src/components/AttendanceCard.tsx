import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player } from '@/types';

interface AttendanceCardProps {
  player: Player;
  present: boolean;
  onToggle: () => void;
}

export function AttendanceCard({ player, present, onToggle }: AttendanceCardProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full p-4 rounded-xl tap-target flex items-center justify-between gap-4 transition-all duration-200 border",
        present 
          ? "gradient-success glow-success border-success/30" 
          : "bg-card border-border hover:border-muted-foreground/30"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors",
          present 
            ? "bg-success-foreground/20 text-success-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          {player.firstName[0]}{player.lastName[0]}
        </div>
        <div className="text-left">
          <p className={cn(
            "font-semibold text-base transition-colors",
            present ? "text-success-foreground" : "text-foreground"
          )}>
            {player.firstName} {player.lastName}
          </p>
          <p className={cn(
            "text-sm transition-colors",
            present ? "text-success-foreground/70" : "text-muted-foreground"
          )}>
            {present ? 'Obecny/a' : 'Nieobecny/a'}
          </p>
        </div>
      </div>
      
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
        present 
          ? "bg-success-foreground/20" 
          : "bg-muted border-2 border-dashed border-muted-foreground/30"
      )}>
        {present && <Check className="w-6 h-6 text-success-foreground" />}
      </div>
    </button>
  );
}
