
import React from 'react';
import Layout from '@/components/Layout';
import MusicPlayer from '@/components/MusicPlayer';
import AudioVisualizer from '@/components/AudioVisualizer';
import MusicCard from '@/components/MusicCard';
import UploadZone from '@/components/UploadZone';
import AuthButton from '@/components/AuthButton';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp, Clock, Star, Music } from 'lucide-react';
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
      <div className="space-y-8 pb-32">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl glass p-8 md:p-12">
          <div className="absolute inset-0 gradient-primary opacity-20"></div>
          <div className="relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  Your Music,
                  <br />
                  <span className="text-gradient">Your Experience</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Stream, upload, and discover amazing music. Create playlists, 
                  share your tracks, and enjoy a personalized listening experience.
                </p>
                <div className="flex space-x-4">
                  <Button 
                    onClick={handleStartListening}
                    className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-3"
                    disabled={featuredTracks.length === 0}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Listening
                  </Button>
                  {user ? (
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-3">
                      Upload Music
                    </Button>
                  ) : (
                    <AuthButton />
                  )}
                </div>
              </div>
              
              <div className="relative">
                <div className="glass p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">Now Playing</h3>
                  <AudioVisualizer />
                  <div className="mt-4 text-center">
                    <p className="text-white font-medium">Electric Dreams</p>
                    <p className="text-gray-400 text-sm">Synthwave Artist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Auth Section */}
        <div className="flex justify-end">
          <AuthButton />
        </div>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-xl text-center">
            <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">{featuredTracks.length}</h3>
            <p className="text-gray-400">Songs Available</p>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <Clock className="h-8 w-8 text-pink-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">2.8M</h3>
            <p className="text-gray-400">Hours Streamed</p>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <Star className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">94.5%</h3>
            <p className="text-gray-400">User Satisfaction</p>
          </div>
        </section>

        {/* Upload Section - Only show to authenticated users */}
        {user && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Share Your Music</h2>
              <p className="text-gray-400">Upload your tracks and reach a global audience</p>
            </div>
            <UploadZone />
          </section>
        )}

        {/* Featured Music */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">Featured Tracks</h2>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {featuredTracks.map((track) => (
              <MusicCard
                key={track.id}
                id={track.id}
                title={track.title}
                artist={track.artist}
                duration={track.duration}
                albumArt={track.cover_url}
                song={track}
                allSongs={featuredTracks}
              />
            ))}
          </div>
        </section>

        {/* Recently Played - Only show to authenticated users */}
        {user && recentlyPlayed.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Recently Played</h2>
            <div className="glass rounded-xl overflow-hidden">
              <div className="space-y-0">
                {recentlyPlayed.map((track, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => {
                      setPlaylist(recentlyPlayed);
                      playSong(track);
                    }}
                  >
                    <div className="w-12 h-12 gradient-secondary rounded-lg flex items-center justify-center">
                      <Music className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{track.title}</p>
                      <p className="text-gray-400 text-sm">{track.artist}</p>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : ''}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 hover:text-purple-300"
                    >
                      <Play className="h-4 w-4" />
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
