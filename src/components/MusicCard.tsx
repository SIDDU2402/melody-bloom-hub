
import React from 'react';
import { Play, Heart, MoreHorizontal, Music, Zap } from 'lucide-react';
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
      setPlaylist(allSongs);
      playSong(song);
      
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
    <Card className={`music-card-enhanced group cursor-pointer relative overflow-hidden ${
      isCurrentSong ? 'ring-2 ring-purple-400 animate-pulse-glow' : ''
    }`}>
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 animate-shimmer-intense opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Current Song Indicator */}
      {isCurrentSong && (
        <div className="absolute top-2 left-2 z-20">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full ultra-mobile-text-xs font-bold shadow-lg">
            <Zap className="h-3 w-3 animate-pulse" />
            <span className="hidden sm:inline">NOW PLAYING</span>
            <span className="sm:hidden">LIVE</span>
          </div>
        </div>
      )}
      
      <div className="relative z-10 p-4 sm:p-6">
        <div className="relative mb-4 sm:mb-6">
          <div 
            className={`w-full aspect-square rounded-xl sm:rounded-2xl mb-3 sm:mb-4 overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl ${
              albumArt ? 'bg-cover bg-center' : 'gradient-secondary'
            }`}
            style={albumArt ? { backgroundImage: `url(${albumArt})` } : {}}
          >
            {!albumArt && (
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 animate-morph opacity-80"></div>
                <Music className="h-12 w-12 sm:h-16 sm:w-16 text-white relative z-10 animate-float-gentle drop-shadow-lg" />
              </div>
            )}
            
            {/* Enhanced Play Button Overlay */}
            <div className={`absolute inset-0 bg-black/60 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 ${
              isCurrentSong && isPlaying 
                ? 'opacity-100' 
                : 'opacity-0 group-hover:opacity-100'
            }`}>
              <Button 
                onClick={handlePlay}
                className={`mobile-player-control-primary sm:player-control-primary group/play hover:scale-125 transition-all duration-300 shadow-2xl ${
                  isCurrentSong ? 'animate-pulse-glow' : ''
                }`}
              >
                <Play className="h-6 w-6 sm:h-8 sm:w-8 ml-1 group-hover/play:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover/play:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>

            {/* Animated Sound Waves for Current Song */}
            {isCurrentSong && isPlaying && (
              <div className="absolute top-3 right-3 flex space-x-1">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="w-1 bg-white rounded-full animate-pulse"
                    style={{
                      height: `${12 + Math.random() * 6}px`,
                      animationDelay: `${index * 0.2}s`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mobile-spacing-tight sm:space-y-3">
          <div className="mobile-spacing-tight sm:space-y-2">
            <h3 className="font-bold text-white truncate mobile-text-base sm:text-lg group-hover:text-gradient transition-all duration-500 text-shadow">
              {title}
            </h3>
            <p className="text-gray-400 truncate group-hover:text-gray-300 transition-colors duration-300 font-medium mobile-text-sm sm:text-base">
              {artist}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              <span className="ultra-mobile-text-xs sm:text-xs text-gray-500 font-semibold bg-white/5 px-2 py-1 rounded-lg">
                {formatDuration(duration)}
              </span>
            </div>
            
            <div className="flex space-x-1 sm:space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500 transform translate-x-0 sm:translate-x-4 sm:group-hover:translate-x-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`mobile-player-control sm:player-control transition-all duration-300 hover:scale-125 ${
                  isFavorite 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-gray-400 hover:text-red-400'
                }`}
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current animate-pulse' : ''}`} />
                {isFavorite && (
                  <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping"></div>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="mobile-player-control sm:player-control text-gray-400 hover:text-white transition-all duration-300 hover:scale-125 hidden sm:flex"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </Card>
  );
};

export default MusicCard;
