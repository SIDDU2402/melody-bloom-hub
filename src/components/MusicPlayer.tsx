
import React, { useState } from 'react';
import { Play, Pause, Shuffle, Heart, Volume2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState([35]);

  return (
    <Card className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-4 backdrop-blur-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Currently Playing */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-lg bg-gradient-primary animate-pulse-slow flex-shrink-0"></div>
          <div className="min-w-0">
            <p className="text-white font-medium truncate">Electric Dreams</p>
            <p className="text-gray-400 text-sm truncate">Synthwave Artist</p>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 flex-shrink-0">
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Shuffle className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full gradient-primary hover:opacity-90 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-3 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">1:23</span>
            <Slider
              value={progress}
              onValueChange={setProgress}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-10">3:45</span>
          </div>
        </div>

        {/* Volume & Options */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <Slider
              value={volume}
              onValueChange={setVolume}
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
