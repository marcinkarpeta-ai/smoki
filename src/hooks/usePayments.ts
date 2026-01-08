import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface PaymentRecord {
  month: string;
  playerId: string;
  paid: boolean;
}

export function usePayments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*');

      if (error) throw error;

      return data.map(p => ({
        month: p.month,
        playerId: p.player_id,
        paid: p.is_paid
      })) as PaymentRecord[];
    }
  });

  const togglePaymentMutation = useMutation({
    mutationFn: async ({ playerId, month }: { playerId: string; month: string }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from('payments')
        .select('*')
        .eq('player_id', playerId)
        .eq('month', month)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('payments')
          .update({ 
            is_paid: !existing.is_paid,
            marked_by: user?.id 
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('payments')
          .insert({
            player_id: playerId,
            month: month,
            is_paid: true,
            marked_by: user?.id
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
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
    payments,
    isLoading,
    error,
    togglePayment: (playerId: string, month: string) => 
      togglePaymentMutation.mutate({ playerId, month }),
    isToggling: togglePaymentMutation.isPending
  };
}
