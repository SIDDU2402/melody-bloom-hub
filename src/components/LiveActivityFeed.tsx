
import React, { useState, useEffect } from 'react';
import { Activity, Users, Play, Heart, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityItem {
  id: string;
  type: 'play' | 'favorite' | 'playlist' | 'follow';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: {
    title: string;
    artist?: string;
  };
  timestamp: Date;
  isLive?: boolean;
}

const LiveActivityFeed: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [liveCount, setLiveCount] = useState(42);

  // Simulate live activity feed
  useEffect(() => {
    const generateActivity = (): ActivityItem => {
      const types: ActivityItem['type'][] = ['play', 'favorite', 'playlist'];
      const users = [
        { id: '1', name: 'Alex Rivera', avatar: '' },
        { id: '2', name: 'Sam Chen', avatar: '' },
        { id: '3', name: 'Jordan Taylor', avatar: '' },
        { id: '4', name: 'Casey Morgan', avatar: '' },
      ];
      const songs = [
        { title: 'Midnight Dreams', artist: 'Luna Eclipse' },
        { title: 'Electric Pulse', artist: 'Neon Lights' },
        { title: 'Ocean Waves', artist: 'Blue Horizon' },
        { title: 'City Nights', artist: 'Urban Sound' },
      ];

      const type = types[Math.floor(Math.random() * types.length)];
      const selectedUser = users[Math.floor(Math.random() * users.length)];
      const song = songs[Math.floor(Math.random() * songs.length)];

      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        user: selectedUser,
        content: song,
        timestamp: new Date(),
        isLive: Math.random() > 0.7
      };
    };

    // Initial activities
    const initialActivities = Array.from({ length: 8 }, generateActivity);
    setActivities(initialActivities);

    // Add new activity every 10-15 seconds
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity = generateActivity();
        return [newActivity, ...prev.slice(0, 9)]; // Keep last 10 activities
      });
      
      // Update live user count
      setLiveCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'play': return <Play className="h-3 w-3" />;
      case 'favorite': return <Heart className="h-3 w-3" />;
      case 'playlist': return <Activity className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'play': return 'is listening to';
      case 'favorite': return 'liked';
      case 'playlist': return 'added to playlist';
      default: return 'interacted with';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'play': return 'text-green-400';
      case 'favorite': return 'text-red-400';
      case 'playlist': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="glass overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg gradient-primary relative">
              <Activity className="h-5 w-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Live Activity</h3>
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-400">{liveCount} users online</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 animate-fade-in group cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Avatar className="h-8 w-8 border-2 border-white/20 group-hover:border-purple-400/50 transition-colors duration-300">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                  {activity.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium text-sm truncate">
                    {activity.user.name}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {getActivityText(activity)}
                  </span>
                  {activity.isLive && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-1 py-0">
                      LIVE
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <div className={`${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <span className="text-gray-300 text-sm truncate">
                    {activity.content.title}
                  </span>
                  {activity.content.artist && (
                    <>
                      <span className="text-gray-500 text-xs">by</span>
                      <span className="text-gray-400 text-xs truncate">
                        {activity.content.artist}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{formatTimeAgo(activity.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10">
          <p className="text-xs text-gray-400 text-center">
            ✨ Connect with other music lovers and discover what's trending in real-time
          </p>
        </div>
      </div>
    </Card>
  );
};

export default LiveActivityFeed;
