import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const playerNameSchema = z.string()
  .min(2, 'Minimum 2 znaki')
  .max(50, 'Maksymalnie 50 znaków')
  .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-']+$/, 'Tylko litery, spacje i myślniki');

interface PlayerFormProps {
  onAdd: (firstName: string, lastName: string) => void;
}

export function PlayerForm({ onAdd }: PlayerFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const firstResult = playerNameSchema.safeParse(firstName.trim());
    const lastResult = playerNameSchema.safeParse(lastName.trim());
    
    const newErrors: { firstName?: string; lastName?: string } = {};
    if (!firstResult.success) newErrors.firstName = firstResult.error.errors[0].message;
    if (!lastResult.success) newErrors.lastName = lastResult.error.errors[0].message;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onAdd(firstName.trim(), lastName.trim());
    setFirstName('');
    setLastName('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-4">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-primary" />
        Dodaj zawodnika
      </h3>
      <div className="space-y-3">
        <div>
          <Input
            placeholder="Imię"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: undefined })); }}
            className="bg-secondary border-border h-12 text-base"
            maxLength={50}
          />
          {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <Input
            placeholder="Nazwisko"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: undefined })); }}
            className="bg-secondary border-border h-12 text-base"
            maxLength={50}
          />
          {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
        </div>
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
