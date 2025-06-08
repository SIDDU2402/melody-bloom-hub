
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Song } from './useSongs';

interface AIRecommendation {
  song: Song;
  score: number;
  reason: string;
  mood?: string;
}

export const useAIRecommendations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async (): Promise<AIRecommendation[]> => {
      if (!user) return [];

      // Get user's listening history
      const { data: recentlyPlayed } = await supabase
        .from('recently_played')
        .select('song:songs(*)')
        .eq('user_id', user.id)
        .limit(20);

      // Get user's favorites
      const { data: favorites } = await supabase
        .from('user_favorites')
        .select('song:songs(*)')
        .eq('user_id', user.id);

      // Get all available songs
      const { data: allSongs } = await supabase
        .from('songs')
        .select('*')
        .limit(100);

      if (!allSongs) return [];

      // Simple AI-like recommendation algorithm
      const userGenres = new Set();
      const userArtists = new Set();
      
      // Analyze user preferences
      [...(recentlyPlayed || []), ...(favorites || [])].forEach(item => {
        const song = item.song;
        if (song?.genre) userGenres.add(song.genre);
        if (song?.artist) userArtists.add(song.artist);
      });

      const recommendations: AIRecommendation[] = allSongs
        .filter(song => {
          // Don't recommend songs user already has in favorites
          const isFavorite = favorites?.some(fav => fav.song?.id === song.id);
          const isRecentlyPlayed = recentlyPlayed?.some(recent => recent.song?.id === song.id);
          return !isFavorite && !isRecentlyPlayed;
        })
        .map(song => {
          let score = Math.random() * 0.3; // Base randomness
          let reason = 'Discover new music';
          let mood = 'discovery';

          // Boost score for matching genres
          if (song.genre && userGenres.has(song.genre)) {
            score += 0.4;
            reason = `Because you like ${song.genre}`;
            mood = 'familiar';
          }

          // Boost score for same artists
          if (userArtists.has(song.artist)) {
            score += 0.3;
            reason = `More from ${song.artist}`;
            mood = 'artist-match';
          }

          // Boost popular songs
          if (song.play_count > 50) {
            score += 0.2;
            reason = 'Trending now';
            mood = 'trending';
          }

          return {
            song,
            score: Math.min(score, 1),
            reason,
            mood
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return recommendations;
    },
    enabled: !!user,
  });
};
