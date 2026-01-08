import { cn } from '@/lib/utils';
import type { Player } from '@/types';

interface PaymentToggleProps {
  player: Player;
  paid: boolean;
  onToggle: () => void;
}

export function PaymentToggle({ player, paid, onToggle }: PaymentToggleProps) {
  return (
    <div className={cn(
      "w-full p-4 rounded-xl flex items-center justify-between gap-4 transition-all duration-200 border",
      paid 
        ? "bg-success/10 border-success/30" 
        : "bg-destructive/10 border-destructive/30"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
          paid ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
        )}>
          {player.firstName[0]}{player.lastName[0]}
        </div>
        <p className="font-medium text-foreground">
          {player.firstName} {player.lastName}
        </p>
      </div>
      
      <button
        onClick={onToggle}
        className={cn(
          "px-4 py-2 rounded-lg font-semibold text-sm tap-target transition-all duration-200",
          paid 
            ? "gradient-success text-success-foreground glow-success" 
            : "gradient-destructive text-destructive-foreground glow-destructive"
        )}
      >
        {paid ? 'Zapłacone' : 'Nie zapłacone'}
      </button>
    </div>
  );
}
