
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PlaylistWithSongs extends Playlist {
  songs: Array<{
    id: string;
    song: any;
    position: number;
    added_at: string;
  }>;
}

export const usePlaylists = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['playlists', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Playlist[];
    },
    enabled: !!user,
  });
};

export const usePlaylist = (playlistId: string) => {
  return useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          songs:playlist_songs (
            id,
            position,
            added_at,
            song:songs (*)
          )
        `)
        .eq('id', playlistId)
        .single();

      if (error) throw error;
      return data as PlaylistWithSongs;
    },
    enabled: !!playlistId,
  });
};

export const useCreatePlaylist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlist: { name: string; description?: string; is_public?: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('playlists')
        .insert({
          ...playlist,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};

export const useAddToPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
      // Get the next position
      const { data: existingSongs } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existingSongs && existingSongs.length > 0 
        ? existingSongs[0].position + 1 
        : 0;

      const { error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: songId,
          position: nextPosition,
        });

      if (error) throw error;
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};
