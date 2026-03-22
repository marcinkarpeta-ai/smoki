import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface HallCost {
  id: string;
  month: string;
  amount: number;
  createdBy: string | null;
}

export function useHallCosts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: hallCosts = [], isLoading, error } = useQuery({
    queryKey: ['hallCosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hall_costs')
        .select('*');

      if (error) throw error;

      return data.map(h => ({
        id: h.id,
        month: h.month,
        amount: Number(h.amount),
        createdBy: h.created_by
      })) as HallCost[];
    }
  });

  const setHallCostMutation = useMutation({
    mutationFn: async ({ month, amount }: { month: string; amount: number }) => {
      const { data: existing } = await supabase
        .from('hall_costs')
        .select('*')
        .eq('month', month)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('hall_costs')
          .update({ amount })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hall_costs')
          .insert({
            month,
            amount,
            created_by: user?.id
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hallCosts'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.message
      });
    }
  });

  const getHallCost = (month: string): number => {
    const cost = hallCosts.find(h => h.month === month);
    return cost?.amount ?? 0;
  };

  const hasHallCost = (month: string): boolean => {
    return hallCosts.some(h => h.month === month);
  };

  return {
    hallCosts,
    isLoading,
    error,
    getHallCost,
    hasHallCost,
    setHallCost: (month: string, amount: number) => 
      setHallCostMutation.mutate({ month, amount }),
    isUpdating: setHallCostMutation.isPending
  };
}
