import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PlayerFormProps {
  onAdd: (firstName: string, lastName: string) => void;
}

export function PlayerForm({ onAdd }: PlayerFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      onAdd(firstName.trim(), lastName.trim());
      setFirstName('');
      setLastName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-4">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-primary" />
        Dodaj zawodnika
      </h3>
      <div className="space-y-3">
        <Input
          placeholder="Imię"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="bg-secondary border-border h-12 text-base"
        />
        <Input
          placeholder="Nazwisko"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="bg-secondary border-border h-12 text-base"
        />
        <Button 
          type="submit" 
          className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base"
          disabled={!firstName.trim() || !lastName.trim()}
        >
          Dodaj do drużyny
        </Button>
      </div>
    </form>
  );
}
