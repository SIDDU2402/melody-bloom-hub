
import React from 'react';
import Layout from '@/components/Layout';
import MusicPlayer from '@/components/MusicPlayer';
import AudioVisualizer from '@/components/AudioVisualizer';
import MusicCard from '@/components/MusicCard';
import UploadZone from '@/components/UploadZone';
import AuthButton from '@/components/AuthButton';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp, Clock, Star, Music, Sparkles } from 'lucide-react';
import { useFeaturedSongs, useRecentlyPlayed } from '@/hooks/useSongs';
import { useAuth } from '@/contexts/AuthContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const Index = () => {
  const { user } = useAuth();
  const { data: featuredTracks = [] } = useFeaturedSongs();
  const { data: recentlyPlayed = [] } = useRecentlyPlayed();
  const { playSong, setPlaylist } = useMusicPlayer();

  const handleStartListening = () => {
    if (featuredTracks.length > 0) {
      setPlaylist(featuredTracks);
      playSong(featuredTracks[0]);
    }
  };

  return (
    <Layout>
      <div className="space-y-12 pb-32">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl glass p-8 md:p-16 animate-fade-in">
          <div className="absolute inset-0 gradient-primary opacity-10 animate-shimmer"></div>
          <div className="absolute top-4 right-4">
            <Sparkles className="h-8 w-8 text-purple-400 animate-bounce-gentle" />
          </div>
          <div className="relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-slide-up">
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                  Your Music,
                  <br />
                  <span className="text-gradient animate-glow">Your Experience</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                  Stream, upload, and discover amazing music. Create playlists, 
                  share your tracks, and enjoy a personalized listening experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleStartListening}
                    className="gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 text-xl px-10 py-4 rounded-full shadow-2xl hover:shadow-purple-500/25"
                    disabled={featuredTracks.length === 0}
                  >
                    <Play className="h-6 w-6 mr-3" />
                    Start Listening
                  </Button>
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="border-white/20 text-white hover:bg-white/10 text-xl px-10 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                      <Music className="h-6 w-6 mr-3" />
                      Upload Music
                    </Button>
                  ) : (
                    <AuthButton />
                  )}
                </div>
              </div>
              
              <div className="relative animate-float">
                <div className="glass p-8 rounded-3xl shadow-2xl">
                  <h3 className="text-xl font-semibold text-white mb-6 text-center">Now Playing</h3>
                  <AudioVisualizer />
                  <div className="mt-6 text-center space-y-2">
                    <p className="text-white font-medium text-lg">Electric Dreams</p>
                    <p className="text-gray-400">Synthwave Artist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: TrendingUp, value: featuredTracks.length, label: "Songs Available", color: "text-purple-400", delay: "0s" },
            { icon: Clock, value: "2.8M", label: "Hours Streamed", color: "text-pink-400", delay: "0.1s" },
            { icon: Star, value: "94.5%", label: "User Satisfaction", color: "text-yellow-400", delay: "0.2s" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="glass p-8 rounded-2xl text-center hover-lift animate-fade-in"
              style={{ animationDelay: stat.delay }}
            >
              <stat.icon className={`h-10 w-10 ${stat.color} mx-auto mb-4 animate-bounce-gentle`} />
              <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-gray-400 text-lg">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Upload Section - Only show to authenticated users */}
        {user && (
          <section className="space-y-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Share Your Music</h2>
              <p className="text-gray-400 text-xl">Upload your tracks and reach a global audience</p>
            </div>
            <UploadZone />
          </section>
        )}

        {/* Featured Music */}
        <section className="space-y-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold text-white">Featured Tracks</h2>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            {featuredTracks.map((track, index) => (
              <div 
                key={track.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <MusicCard
                  id={track.id}
                  title={track.title}
                  artist={track.artist}
                  duration={track.duration}
                  albumArt={track.cover_url}
                  song={track}
                  allSongs={featuredTracks}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Recently Played - Only show to authenticated users */}
        {user && recentlyPlayed.length > 0 && (
          <section className="space-y-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <h2 className="text-4xl font-bold text-white">Recently Played</h2>
            <div className="glass rounded-2xl overflow-hidden shadow-2xl">
              <div className="space-y-0">
                {recentlyPlayed.map((track, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-6 p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${0.1 * index}s` }}
                    onClick={() => {
                      setPlaylist(recentlyPlayed);
                      playSong(track);
                    }}
                  >
                    <div className="w-16 h-16 gradient-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Music className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                        {track.title}
                      </p>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        {track.artist}
                      </p>
                    </div>
                    <div className="text-gray-400 text-sm font-medium">
                      {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : ''}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-purple-400 hover:text-purple-300 transform translate-x-4 group-hover:translate-x-0"
                    >
                      <Play className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <MusicPlayer />
    </Layout>
  );
};

export default Index;
