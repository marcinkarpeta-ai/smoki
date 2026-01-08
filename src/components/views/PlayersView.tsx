import { Users } from 'lucide-react';
import { PlayerForm } from '@/components/PlayerForm';
import { PlayerCard } from '@/components/PlayerCard';
import { PageHeader } from '@/components/PageHeader';
import type { Player } from '@/types';

interface PlayersViewProps {
  players: Player[];
  onAddPlayer: (firstName: string, lastName: string) => void;
  onDeletePlayer: (id: string) => void;
}

export function PlayersView({ players, onAddPlayer, onDeletePlayer }: PlayersViewProps) {
  return (
    <div className="space-y-6 pb-24">
      <PageHeader subtitle="Stowarzyszenie Miłośników Koszykówki" />

      <PlayerForm onAdd={onAddPlayer} />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Zawodnicy
          </h2>
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            {players.length} osób
          </span>
        </div>

        {players.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground">
              Twoja drużyna jest pusta. Dodaj pierwszego zawodnika powyżej.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onDelete={() => onDeletePlayer(player.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
