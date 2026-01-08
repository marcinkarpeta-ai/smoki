import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, Shield, ClipboardCheck, CreditCard } from 'lucide-react';
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
  const { users, isLoading, updateRole, isUpdating } = useUsers();

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
          Zarządzanie rolami użytkowników
        </p>
      </header>

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
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Dołączył: {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
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
