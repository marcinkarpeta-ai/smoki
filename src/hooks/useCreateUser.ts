import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export function useCreateUser() {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createUser = async (email: string, password: string, role?: AppRole | null) => {
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { email, password, role: role || undefined }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: 'Użytkownik utworzony',
        description: `Konto dla ${email} zostało utworzone.`
      });

      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd';
      
      toast({
        variant: 'destructive',
        title: 'Błąd tworzenia użytkownika',
        description: errorMessage
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsCreating(false);
    }
  };

  return { createUser, isCreating };
}
