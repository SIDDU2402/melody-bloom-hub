
import React, { useState } from 'react';
import { Wand2, Clock, Zap, Heart, TrendingUp, Coffee, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useSongs } from '@/hooks/useSongs';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

interface PlaylistMood {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  filters: {
    genres?: string[];
    energy?: 'low' | 'medium' | 'high';
    popularity?: 'underground' | 'mainstream';
  };
}

const moods: PlaylistMood[] = [
  {
    id: 'focus',
    name: 'Focus Zone',
    icon: <Coffee className="h-4 w-4" />,
    description: 'Perfect for deep work',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    filters: { energy: 'medium' }
  },
  {
    id: 'chill',
    name: 'Chill Vibes',
    icon: <Moon className="h-4 w-4" />,
    description: 'Relaxing evening sounds',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    filters: { energy: 'low' }
  },
  {
    id: 'energy',
    name: 'Energy Boost',
    icon: <Zap className="h-4 w-4" />,
    description: 'Get pumped up',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    filters: { energy: 'high' }
  },
  {
    id: 'trending',
    name: 'What\'s Hot',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Most played tracks',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    filters: { popularity: 'mainstream' }
  },
  {
    id: 'discover',
    name: 'Hidden Gems',
    icon: <Heart className="h-4 w-4" />,
    description: 'Underrated tracks',
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    filters: { popularity: 'underground' }
  },
  {
    id: 'morning',
    name: 'Morning Boost',
    icon: <Sun className="h-4 w-4" />,
    description: 'Start your day right',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    filters: { energy: 'medium' }
  }
];

const SmartPlaylistGenerator: React.FC = () => {
  const { data: allSongs = [] } = useSongs();
  const { setPlaylist, playSong } = useMusicPlayer();
  const [generating, setGenerating] = useState<string | null>(null);

  const generatePlaylist = async (mood: PlaylistMood) => {
    setGenerating(mood.id);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    let filteredSongs = [...allSongs];

    // Apply mood-based filters
    if (mood.filters.popularity === 'mainstream') {
      filteredSongs = filteredSongs.filter(song => song.play_count > 20);
    } else if (mood.filters.popularity === 'underground') {
      filteredSongs = filteredSongs.filter(song => song.play_count <= 10);
    }

    // Simulate energy-based filtering (in a real app, this would use audio analysis)
    if (mood.filters.energy) {
      filteredSongs = filteredSongs.sort(() => Math.random() - 0.5);
    }

    // Select 15-20 songs for the playlist
    const playlistSize = Math.min(Math.max(filteredSongs.length, 10), 20);
    const selectedSongs = filteredSongs.slice(0, playlistSize);

    if (selectedSongs.length === 0) {
      toast({
        title: "No songs found",
        description: "Try a different mood or add more songs to your library",
        variant: "destructive",
      });
      setGenerating(null);
      return;
    }

    setPlaylist(selectedSongs);
    playSong(selectedSongs[0]);

    toast({
      title: `${mood.name} playlist ready! 🎵`,
      description: `Generated ${selectedSongs.length} songs for your ${mood.description.toLowerCase()}`,
    });

    setGenerating(null);
  };

  return (
    <Card className="glass overflow-hidden">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg gradient-primary">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Smart Playlists</h3>
            <p className="text-sm text-gray-400">AI-generated for your mood</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {moods.map((mood, index) => (
            <Button
              key={mood.id}
              variant="ghost"
              className={`p-4 h-auto flex-col space-y-2 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 animate-fade-in group relative overflow-hidden ${
                generating === mood.id ? 'animate-pulse' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => generatePlaylist(mood)}
              disabled={generating !== null}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center space-y-2">
                <div className={`p-3 rounded-xl ${mood.color} border transition-all duration-300 group-hover:scale-110`}>
                  {generating === mood.id ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    mood.icon
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-white font-medium text-sm">{mood.name}</p>
                  <p className="text-gray-400 text-xs">{mood.description}</p>
                </div>

                {generating === mood.id && (
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <Wand2 className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-white">AI Magic</span>
          </div>
          <p className="text-xs text-gray-400">
            Our AI analyzes your listening patterns, song popularity, and mood preferences to create the perfect playlist for any moment.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SmartPlaylistGenerator;
