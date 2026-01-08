import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole {
  id: string;
  email: string;
  role: AppRole | null;
  createdAt: string;
}

export function useUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Map profiles with roles
      return profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          role: userRole?.role ?? null,
          createdAt: profile.created_at
        } as UserWithRole;
      });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole | null }) => {
      // First, delete existing role if any
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // If new role is specified, insert it
      if (role) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Rola zaktualizowana',
        description: 'Rola użytkownika została zmieniona.'
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.message
      });
    }
  });

  return {
    users,
    isLoading,
    error,
    updateRole: (userId: string, role: AppRole | null) => 
      updateRoleMutation.mutate({ userId, role }),
    isUpdating: updateRoleMutation.isPending
  };
}
