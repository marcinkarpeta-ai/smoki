import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface PaymentRecord {
  month: string;
  playerId: string;
  paid: boolean;
  amount: number;
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
        paid: p.is_paid,
        amount: Number(p.amount)
      })) as PaymentRecord[];
    }
  });

  const togglePaymentMutation = useMutation({
    mutationFn: async ({ playerId, month, amount }: { playerId: string; month: string; amount: number }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from('payments')
        .select('*')
        .eq('player_id', playerId)
        .eq('month', month)
        .maybeSingle();

      if (existing) {
        // Update existing record - toggle off (delete)
        if (existing.is_paid) {
          const { error } = await supabase
            .from('payments')
            .update({ 
              is_paid: false,
              marked_by: user?.id 
            })
            .eq('id', existing.id);

          if (error) throw error;
        } else {
          // Toggle on with amount
          const { error } = await supabase
            .from('payments')
            .update({ 
              is_paid: true,
              amount,
              marked_by: user?.id 
            })
            .eq('id', existing.id);

          if (error) throw error;
        }
      } else {
        // Insert new record with amount
        const { error } = await supabase
          .from('payments')
          .insert({
            player_id: playerId,
            month: month,
            is_paid: true,
            amount,
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

  const getPaymentAmount = (playerId: string, month: string): number => {
    const payment = payments.find(p => p.playerId === playerId && p.month === month);
    return payment?.amount ?? 150;
  };

  const getTotalPaymentsByMonth = (month: string): number => {
    return payments
      .filter(p => p.month === month && p.paid)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  return {
    payments,
    isLoading,
    error,
    getPaymentAmount,
    getTotalPaymentsByMonth,
    togglePayment: (playerId: string, month: string, amount: number = 150) => 
      togglePaymentMutation.mutate({ playerId, month, amount }),
    isToggling: togglePaymentMutation.isPending
  };
}
