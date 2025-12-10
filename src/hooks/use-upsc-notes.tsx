import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Note {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  topic: string | null;
  file_url: string;
  file_size: number | null;
  download_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useUPSCNotes = (subject?: string) => {
  return useQuery({
    queryKey: ['upsc-notes', subject],
    queryFn: async () => {
      let query = (supabase
        .from('upsc_notes' as any)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false }) as any);

      if (subject) {
        query = query.eq('subject', subject);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Note[];
    },
  });
};

export const useAllNotes = () => {
  return useQuery({
    queryKey: ['upsc-notes-admin'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('upsc_notes' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      return (data || []) as Note[];
    },
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'download_count'>) => {
      const { data, error } = await (supabase
        .from('upsc_notes' as any)
        .insert([note])
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upsc-notes'] });
      queryClient.invalidateQueries({ queryKey: ['upsc-notes-admin'] });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data, error } = await (supabase
        .from('upsc_notes' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upsc-notes'] });
      queryClient.invalidateQueries({ queryKey: ['upsc-notes-admin'] });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('upsc_notes' as any)
        .delete()
        .eq('id', id) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upsc-notes'] });
      queryClient.invalidateQueries({ queryKey: ['upsc-notes-admin'] });
    },
  });
};

export const useIncrementNoteDownload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      try {
        const { error } = await (supabase.rpc as any)('increment_note_download_count', {
          note_uuid: noteId,
        });
        if (error) throw error;
      } catch (e) {
        console.log('Download count increment not available');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upsc-notes'] });
    },
  });
};
