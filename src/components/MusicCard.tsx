
import React from 'react';
import { Play, Heart, MoreHorizontal, Music } from 'lucide-react';
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
  const { playSong, setPlaylist, currentSong, isPlaying } = useMusicPlayer();
  
  const isFavorite = favorites.includes(id);
  const isCurrentSong = currentSong?.id === id;
  
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
        title: "Now Playing 🎵",
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
    <Card className={`group glass music-card-hover p-5 cursor-pointer animate-fade-in relative overflow-hidden ${
      isCurrentSong ? 'ring-2 ring-purple-400 animate-glow' : ''
    }`}>
      {/* Background shimmer effect */}
      <div className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="relative mb-4">
          <div 
            className={`w-full aspect-square rounded-xl mb-4 overflow-hidden ${
              albumArt ? 'bg-cover bg-center' : 'gradient-secondary'
            } transition-transform duration-300 group-hover:scale-105`}
            style={albumArt ? { backgroundImage: `url(${albumArt})` } : {}}
          >
            {!albumArt && (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="h-12 w-12 text-white/70 animate-bounce-gentle" />
              </div>
            )}
            
            {/* Play button overlay */}
            <div className={`absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isCurrentSong && isPlaying 
                ? 'opacity-100' 
                : 'opacity-0 group-hover:opacity-100'
            }`}>
              <Button 
                onClick={handlePlay}
                className={`w-14 h-14 rounded-full gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-110 ${
                  isCurrentSong ? 'animate-pulse' : ''
                }`}
              >
                <Play className="h-6 w-6 ml-0.5" />
              </Button>
            </div>

            {/* Now playing indicator */}
            {isCurrentSong && isPlaying && (
              <div className="absolute top-3 right-3">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-white rounded animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-4 bg-white rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-4 bg-white rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-white truncate text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
            {title}
          </h3>
          <p className="text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">
            {artist}
          </p>
          
          <div className="flex items-center justify-between pt-3">
            <span className="text-xs text-gray-500 font-medium">{formatDuration(duration)}</span>
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 transition-all duration-300 hover:scale-110 ${
                  isFavorite 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-gray-400 hover:text-red-400'
                }`}
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current animate-pulse' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
              >
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
