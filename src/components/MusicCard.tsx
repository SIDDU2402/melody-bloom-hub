
import React from 'react';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MusicCardProps {
  title: string;
  artist: string;
  duration: string;
  albumArt?: string;
}

const MusicCard: React.FC<MusicCardProps> = ({ title, artist, duration, albumArt }) => {
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
            <Button className="w-12 h-12 rounded-full gradient-primary hover:opacity-90">
              <Play className="h-5 w-5 ml-0.5" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-medium text-white truncate">{title}</h3>
          <p className="text-sm text-gray-400 truncate">{artist}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">{duration}</span>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-400">
                <Heart className="h-4 w-4" />
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
