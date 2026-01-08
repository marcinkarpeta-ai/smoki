import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface AttendanceRecord {
  date: string;
  playerId: string;
  present: boolean;
}

export function useAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: attendance = [], isLoading, error } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*');

      if (error) throw error;

      return data.map(a => ({
        date: a.session_date,
        playerId: a.player_id,
        present: a.is_present
      })) as AttendanceRecord[];
    }
  });

  const toggleAttendanceMutation = useMutation({
    mutationFn: async ({ playerId, date }: { playerId: string; date: string }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('*')
        .eq('player_id', playerId)
        .eq('session_date', date)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ 
            is_present: !existing.is_present,
            marked_by: user?.id 
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('attendance')
          .insert({
            player_id: playerId,
            session_date: date,
            is_present: true,
            marked_by: user?.id
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
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
    attendance,
    isLoading,
    error,
    toggleAttendance: (playerId: string, date: string) => 
      toggleAttendanceMutation.mutate({ playerId, date }),
    isToggling: toggleAttendanceMutation.isPending
  };
}
