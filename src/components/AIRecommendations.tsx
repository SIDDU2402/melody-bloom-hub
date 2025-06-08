
import React from 'react';
import { Sparkles, TrendingUp, Heart, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MusicCard from './MusicCard';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const AIRecommendations: React.FC = () => {
  const { data: recommendations = [], isLoading } = useAIRecommendations();
  const { setPlaylist, playSong } = useMusicPlayer();

  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case 'trending': return <TrendingUp className="h-3 w-3" />;
      case 'artist-match': return <User className="h-3 w-3" />;
      case 'familiar': return <Heart className="h-3 w-3" />;
      default: return <Sparkles className="h-3 w-3" />;
    }
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'trending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'artist-match': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'familiar': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    }
  };

  const handlePlayAllRecommendations = () => {
    if (recommendations.length > 0) {
      const songs = recommendations.map(rec => rec.song);
      setPlaylist(songs);
      playSong(songs[0]);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass p-6 animate-pulse">
        <div className="h-6 bg-white/20 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <Card className="glass overflow-hidden group hover-lift">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg gradient-primary">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
              <p className="text-sm text-gray-400">Curated just for you</p>
            </div>
          </div>
          <Button 
            onClick={handlePlayAllRecommendations}
            className="gradient-secondary hover:opacity-90 transition-all duration-300 transform hover:scale-105"
            size="sm"
          >
            Play All
          </Button>
        </div>

        <div className="space-y-3">
          {recommendations.slice(0, 5).map((rec, index) => (
            <div 
              key={rec.song.id}
              className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer group/item animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => {
                setPlaylist(recommendations.map(r => r.song));
                playSong(rec.song);
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm">{index + 1}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate group-hover/item:text-transparent group-hover/item:bg-clip-text group-hover/item:bg-gradient-to-r group-hover/item:from-purple-400 group-hover/item:to-pink-400 transition-all duration-300">
                  {rec.song.title}
                </p>
                <p className="text-gray-400 text-sm truncate">{rec.song.artist}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${getMoodColor(rec.mood)} border`}>
                  {getMoodIcon(rec.mood)}
                  <span className="ml-1">{rec.reason}</span>
                </Badge>
                <div className="text-right">
                  <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000"
                      style={{ width: `${rec.score * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{Math.round(rec.score * 100)}% match</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AIRecommendations;
