
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  file_url: string;
  cover_url?: string;
  genre?: string;
  play_count: number;
  created_at: string;
  user_id: string;
}

export const useSongs = () => {
  return useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Song[];
    },
  });
};

export const useFeaturedSongs = () => {
  return useQuery({
    queryKey: ['featured-songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('play_count', { ascending: false });
      
      if (error) throw error;
      return data as Song[];
    },
  });
};

export const useRecentlyPlayed = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recently-played', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('recently_played')
        .select(`
          id,
          played_at,
          song:songs (*)
        `)
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data.map(item => item.song) as Song[];
    },
    enabled: !!user,
  });
};

export const usePlaySong = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songId: string) => {
      if (!user) return;

      // Add to recently played
      await supabase
        .from('recently_played')
        .insert({
          user_id: user.id,
          song_id: songId,
        });

      // Increment play count
      await supabase.rpc('increment_play_count', { song_uuid: songId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recently-played'] });
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['featured-songs'] });
    },
  });
};
