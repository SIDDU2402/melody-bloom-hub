
import React from 'react';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import { usePlaySong } from '@/hooks/useSongs';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { toast } from '@/hooks/use-toast';
import { Song } from '@/hooks/useSongs';

interface MusicCardProps {
  id: string;
  title: string;
  artist: string;
  duration?: number;
  albumArt?: string;
  song?: Song;
  allSongs?: Song[];
}

const MusicCard: React.FC<MusicCardProps> = ({ 
  id, 
  title, 
  artist, 
  duration, 
  albumArt,
  song,
  allSongs = []
}) => {
  const { user } = useAuth();
  const { data: favorites = [] } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const playSongMutation = usePlaySong();
  const { playSong, setPlaylist } = useMusicPlayer();
  
  const isFavorite = favorites.includes(id);
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (song) {
      // Set the playlist for the music player
      setPlaylist(allSongs);
      playSong(song);
      
      // Track play in database if user is logged in
      if (user) {
        playSongMutation.mutate(id);
      }
      
      toast({
        title: "Now Playing",
        description: `${title} by ${artist}`,
      });
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add favorites",
        variant: "destructive",
      });
      return;
    }
    toggleFavorite.mutate(id);
  };

  return (
    <Card className="group glass hover:bg-white/10 transition-all duration-300 hover:scale-105 p-4 cursor-pointer">
      <div className="relative">
        <div 
          className={`w-full aspect-square rounded-lg mb-4 ${
            albumArt ? 'bg-cover bg-center' : 'gradient-secondary'
          }`}
          style={albumArt ? { backgroundImage: `url(${albumArt})` } : {}}
        >
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              onClick={handlePlay}
              className="w-12 h-12 rounded-full gradient-primary hover:opacity-90"
            >
              <Play className="h-5 w-5 ml-0.5" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-medium text-white truncate">{title}</h3>
          <p className="text-sm text-gray-400 truncate">{artist}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">{formatDuration(duration)}</span>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 hover:text-red-400 ${
                  isFavorite ? 'text-red-400' : 'text-gray-400'
                }`}
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MusicCard;
