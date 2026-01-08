import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export function usePlayers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: players = [], isLoading, error } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;

      return data.map(p => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        createdAt: p.created_at
      })) as Player[];
    }
  });

  const addPlayerMutation = useMutation({
    mutationFn: async ({ firstName, lastName }: { firstName: string; lastName: string }) => {
      const { data, error } = await supabase
        .from('players')
        .insert({ first_name: firstName, last_name: lastName })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: 'Zawodnik dodany',
        description: 'Nowy zawodnik został dodany do listy.'
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

  const deletePlayerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Zawodnik usunięty',
        description: 'Zawodnik został usunięty z listy.'
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
    players,
    isLoading,
    error,
    addPlayer: (firstName: string, lastName: string) => 
      addPlayerMutation.mutate({ firstName, lastName }),
    deletePlayer: (id: string) => deletePlayerMutation.mutate(id),
    isAdding: addPlayerMutation.isPending,
    isDeleting: deletePlayerMutation.isPending
  };
}
