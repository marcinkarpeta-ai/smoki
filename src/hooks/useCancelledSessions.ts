import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface CancelledSession {
  id: string;
  sessionDate: string;
  reason: string;
  cancelledBy: string | null;
  createdAt: string;
}

export function useCancelledSessions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: cancelledSessions = [], isLoading, error } = useQuery({
    queryKey: ['cancelled_sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cancelled_sessions')
        .select('*');

      if (error) throw error;

      return data.map(s => ({
        id: s.id,
        sessionDate: s.session_date,
        reason: s.reason,
        cancelledBy: s.cancelled_by,
        createdAt: s.created_at
      })) as CancelledSession[];
    }
  });

  const toggleCancelMutation = useMutation({
    mutationFn: async (date: string) => {
      const existing = cancelledSessions.find(s => s.sessionDate === date);

      if (existing) {
        const { error } = await supabase
          .from('cancelled_sessions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cancelled_sessions')
          .insert({
            session_date: date,
            reason: 'Brak dostępu do hali',
            cancelled_by: user?.id
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cancelled_sessions'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.message
      });
    }
  });

  const isCancelled = (date: string) => {
    return cancelledSessions.some(s => s.sessionDate === date);
  };

  const getCancelledForMonth = (monthStr: string) => {
    return cancelledSessions.filter(s => s.sessionDate.startsWith(monthStr));
  };

  return {
    cancelledSessions,
    isLoading,
    error,
    toggleCancel: (date: string) => toggleCancelMutation.mutate(date),
    isToggling: toggleCancelMutation.isPending,
    isCancelled,
    getCancelledForMonth
  };
}
