import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface OtherExpense {
  id: string;
  month: string;
  description: string;
  amount: number;
  createdBy: string | null;
  createdAt: string;
}

export function useOtherExpenses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: ['otherExpenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('other_expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(e => ({
        id: e.id,
        month: e.month,
        description: e.description,
        amount: Number(e.amount),
        createdBy: e.created_by,
        createdAt: e.created_at
      })) as OtherExpense[];
    }
  });

  const addExpenseMutation = useMutation({
    mutationFn: async ({ month, description, amount }: { month: string; description: string; amount: number }) => {
      const { error } = await supabase
        .from('other_expenses')
        .insert({
          month,
          description,
          amount,
          created_by: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otherExpenses'] });
      toast({
        title: 'Sukces',
        description: 'Wydatek został dodany'
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

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('other_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otherExpenses'] });
      toast({
        title: 'Sukces',
        description: 'Wydatek został usunięty'
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

  const getExpensesByMonth = (month: string): OtherExpense[] => {
    return expenses.filter(e => e.month === month);
  };

  const getTotalExpensesByMonth = (month: string): number => {
    return getExpensesByMonth(month).reduce((sum, e) => sum + e.amount, 0);
  };

  return {
    expenses,
    isLoading,
    error,
    getExpensesByMonth,
    getTotalExpensesByMonth,
    addExpense: (month: string, description: string, amount: number) =>
      addExpenseMutation.mutate({ month, description, amount }),
    deleteExpense: (id: string) => deleteExpenseMutation.mutate(id),
    isAdding: addExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending
  };
}
