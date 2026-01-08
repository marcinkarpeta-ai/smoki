import dragonLogo from '@/assets/dragon-logo.png';

export function DragonLogo({ className }: { className?: string }) {
  return (
    <img 
      src={dragonLogo}
      alt="SMoKi - Smok z piłką do koszykówki"
      className={className}
    />
  );
}
