import dragonLogo from '@/assets/dragon-logo.png';
import { cn } from '@/lib/utils';

export function DragonLogo({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-full p-0.5 bg-gradient-to-br from-primary to-fuchsia-500",
      className
    )}>
      <img 
        src={dragonLogo}
        alt="SMoKi - Smok z piłką do koszykówki"
        className="w-full h-full rounded-full object-cover bg-card"
      />
    </div>
  );
}
