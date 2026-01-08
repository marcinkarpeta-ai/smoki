import { DragonLogo } from '@/components/DragonLogo';

interface PageHeaderProps {
  subtitle: string;
}

export function PageHeader({ subtitle }: PageHeaderProps) {
  return (
    <header className="pt-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">
            <span className="text-gradient">SMoKi</span>
          </h1>
          <p className="text-muted-foreground mt-1 truncate">{subtitle}</p>
        </div>
        <DragonLogo className="w-16 h-16 shrink-0" />
      </div>
    </header>
  );
}
