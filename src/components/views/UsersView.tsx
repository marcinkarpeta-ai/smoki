import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useCreateUser } from '@/hooks/useCreateUser';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, Shield, ClipboardCheck, CreditCard, UserPlus, ShieldAlert } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrator',
  attendance_manager: 'Menedżer obecności',
  payment_manager: 'Menedżer płatności'
};

const roleIcons: Record<AppRole, typeof Shield> = {
  admin: Shield,
  attendance_manager: ClipboardCheck,
  payment_manager: CreditCard
};

const roleColors: Record<AppRole, string> = {
  admin: 'bg-primary text-primary-foreground',
  attendance_manager: 'bg-blue-500 text-white',
  payment_manager: 'bg-green-500 text-white'
};

export function UsersView() {
  const { isAdmin } = useAuth();
  const { users, isLoading, updateRole, isUpdating } = useUsers();
  const { createUser, isCreating } = useCreateUser();
  
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<string>('none');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const errors: { email?: string; password?: string } = {};
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      errors.email = 'Podaj prawidłowy adres email';
    }
    if (!newPassword || newPassword.length < 6) {
      errors.password = 'Hasło musi mieć co najmniej 6 znaków';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    
    const role = newRole === 'none' ? null : newRole as AppRole;
    const result = await createUser(newEmail, newPassword, role);
    
    if (result.success) {
      setNewEmail('');
      setNewPassword('');
      setNewRole('none');
    }
  };

  // Sprawdzenie uprawnień - tylko admin może zarządzać użytkownikami
  if (!isAdmin) {
    return (
      <div className="py-12 text-center animate-fade-in">
        <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">Brak uprawnień</h2>
        <p className="text-muted-foreground text-sm">
          Tylko administratorzy mogą zarządzać użytkownikami
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-6 pb-24 space-y-6 animate-fade-in">
      <header className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Użytkownicy
        </h1>
        <p className="text-muted-foreground text-sm">
          Zarządzanie użytkownikami i rolami
        </p>
      </header>

      {/* Add new user form */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Dodaj nowego użytkownika
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="uzytkownik@email.pl"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={formErrors.email ? 'border-destructive' : ''}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Hasło</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={formErrors.password ? 'border-destructive' : ''}
                />
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-role">Rola (opcjonalnie)</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger id="new-role">
                    <SelectValue placeholder="Wybierz rolę" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Brak roli</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="attendance_manager">Menedżer obecności</SelectItem>
                    <SelectItem value="payment_manager">Menedżer płatności</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto gradient-primary"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Dodaj użytkownika
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Zarejestrowani użytkownicy
          </span>
          <span className="text-sm text-muted-foreground">
            {users.length}
          </span>
        </div>

        {users.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-8 text-center text-muted-foreground">
              Brak zarejestrowanych użytkowników
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {users.map((user) => {
              const RoleIcon = user.role ? roleIcons[user.role] : null;
              
              return (
                <Card key={user.id} className="glass-card card-hover">
                  <CardContent className="py-4">
                    <div className="flex flex-col gap-3">
                      <div className="w-full">
                        <p className="font-medium break-all">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Dołączył: {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {user.role && (
                          <Badge className={roleColors[user.role]}>
                            {RoleIcon && <RoleIcon className="w-3 h-3 mr-1" />}
                            {roleLabels[user.role]}
                          </Badge>
                        )}
                        <Select
                          value={user.role || 'none'}
                          onValueChange={(value) => {
                            const newRole = value === 'none' ? null : value as AppRole;
                            updateRole(user.id, newRole);
                          }}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Wybierz rolę" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Brak roli</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="attendance_manager">Menedżer obecności</SelectItem>
                            <SelectItem value="payment_manager">Menedżer płatności</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
