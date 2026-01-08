import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  onDelete: () => void;
  attendanceCount?: number;
  paid?: boolean;
}

export function PlayerCard({ player, onDelete, attendanceCount, paid }: PlayerCardProps) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center justify-between gap-4 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
          {player.firstName[0]}{player.lastName[0]}
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {player.firstName} {player.lastName}
          </p>
          {attendanceCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              Obecności: {attendanceCount} | 
              <span className={cn(
                "ml-1",
                paid ? "text-success" : "text-destructive"
              )}>
                {paid ? 'Zapłacone' : 'Nie zapłacone'}
              </span>
            </p>
          )}
        </div>
      </div>
      
      <button
        onClick={onDelete}
        className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center tap-target hover:bg-destructive/20 transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
