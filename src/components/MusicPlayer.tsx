
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, MoreHorizontal, Repeat, Shuffle } from 'lucide-react';
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
    <Card className="fixed bottom-0 left-0 right-0 glass-intense border-t border-white/20 backdrop-blur-intense z-50 shadow-2xl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 animate-morph"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500 rounded-full blur-3xl opacity-20 animate-morph" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-shimmer-intense"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Currently Playing - Enhanced */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-xl group">
              {currentSong.cover_url ? (
                <img 
                  src={currentSong.cover_url} 
                  alt={currentSong.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 animate-morph"></div>
              )}
              
              {/* Playing Animation Overlay */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="w-1 bg-white rounded-full animate-pulse"
                        style={{
                          height: `${8 + Math.random() * 4}px`,
                          animationDelay: `${index * 0.15}s`,
                          animationDuration: '0.6s'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="min-w-0 space-y-1">
              <p className="text-white font-bold truncate text-lg text-shadow">{currentSong.title}</p>
              <p className="text-gray-300 text-sm truncate font-medium">{currentSong.artist}</p>
            </div>
            
            {user && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`player-control flex-shrink-0 transition-all duration-300 ${
                  isFavorite ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-red-400'
                }`}
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite && (
                  <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping"></div>
                )}
              </Button>
            )}
          </div>

          {/* Player Controls - Enhanced */}
          <div className="flex flex-col items-center space-y-4 flex-1 max-w-2xl">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="player-control text-gray-400 hover:text-white"
                onClick={previousSong}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={togglePlayPause}
                className="player-control-primary shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                {isPlaying ? (
                  <Pause className="h-6 w-6 relative z-10" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5 relative z-10" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="player-control text-gray-400 hover:text-white"
                onClick={nextSong}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="flex items-center space-x-4 w-full">
              <span className="text-xs text-gray-400 font-semibold w-12 text-right bg-white/5 px-2 py-1 rounded-lg">
                {formatTime(progress)}
              </span>
              <div className="flex-1 relative">
                <Slider
                  value={[progress]}
                  onValueChange={([value]) => seekTo(value)}
                  max={duration}
                  step={1}
                  className="w-full"
                />
                {/* Progress Glow Effect */}
                <div 
                  className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transform -translate-y-1/2 pointer-events-none blur-sm opacity-50"
                  style={{ width: `${(progress / duration) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400 font-semibold w-12 bg-white/5 px-2 py-1 rounded-lg">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Options - Enhanced */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="player-control text-gray-400 hover:text-white hidden md:flex"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="player-control text-gray-400 hover:text-white hidden md:flex"
            >
              <Repeat className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-3 hidden lg:flex">
              <Volume2 className="h-5 w-5 text-gray-400" />
              <div className="relative w-24">
                <Slider
                  value={[volume]}
                  onValueChange={([value]) => setVolume(value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                {/* Volume Glow Effect */}
                <div 
                  className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full transform -translate-y-1/2 pointer-events-none blur-sm opacity-50"
                  style={{ width: `${volume}%` }}
                ></div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="player-control text-gray-400 hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MusicPlayer;
