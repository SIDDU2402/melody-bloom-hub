
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';

const MusicPlayer: React.FC = () => {
  const { user } = useAuth();
  const { data: favorites = [] } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    togglePlayPause,
    setVolume,
    seekTo,
    nextSong,
    previousSong,
  } = useMusicPlayer();

  if (!currentSong) {
    return null;
  }

  const isFavorite = favorites.includes(currentSong.id);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleToggleFavorite = () => {
    if (user && currentSong) {
      toggleFavorite.mutate(currentSong.id);
    }
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-4 backdrop-blur-lg z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Currently Playing */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-lg bg-gradient-primary flex-shrink-0">
            {currentSong.cover_url ? (
              <img 
                src={currentSong.cover_url} 
                alt={currentSong.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary rounded-lg animate-pulse-slow"></div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium truncate">{currentSong.title}</p>
            <p className="text-gray-400 text-sm truncate">{currentSong.artist}</p>
          </div>
          {user && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex-shrink-0 hover:text-red-400 ${
                isFavorite ? 'text-red-400' : 'text-gray-400'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white"
              onClick={previousSong}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full gradient-primary hover:opacity-90 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white"
              onClick={nextSong}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-3 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>
            <Slider
              value={[progress]}
              onValueChange={([value]) => seekTo(value)}
              max={duration}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Options */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <Slider
              value={[volume]}
              onValueChange={([value]) => setVolume(value)}
              max={100}
              step={1}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MusicPlayer;
