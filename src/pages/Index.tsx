
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import MusicPlayer from '@/components/MusicPlayer';
import AudioVisualizer from '@/components/AudioVisualizer';
import MusicCard from '@/components/MusicCard';
import AuthButton from '@/components/AuthButton';
import AIRecommendations from '@/components/AIRecommendations';
import SmartPlaylistGenerator from '@/components/SmartPlaylistGenerator';
import LiveActivityFeed from '@/components/LiveActivityFeed';
import VoiceSearch from '@/components/VoiceSearch';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp, Clock, Star, Music, Sparkles, Search, Filter } from 'lucide-react';
import { useFeaturedSongs, useRecentlyPlayed, useSongs } from '@/hooks/useSongs';
import { useAuth } from '@/contexts/AuthContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { user } = useAuth();
  const { data: featuredTracks = [] } = useFeaturedSongs();
  const { data: recentlyPlayed = [] } = useRecentlyPlayed();
  const { data: allSongs = [] } = useSongs();
  const { playSong, setPlaylist } = useMusicPlayer();
  const [searchResults, setSearchResults] = useState(featuredTracks);
  const [isSearching, setIsSearching] = useState(false);
  const isMobile = useIsMobile();

  const handleStartListening = () => {
    if (featuredTracks.length > 0) {
      setPlaylist(featuredTracks);
      playSong(featuredTracks[0]);
    }
  };

  const handleSearch = (query: string) => {
    setIsSearching(true);
    
    if (!query.trim()) {
      setSearchResults(featuredTracks);
      setIsSearching(false);
      return;
    }

    const filtered = allSongs.filter(song =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase()) ||
      song.genre?.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
    setIsSearching(false);
  };

  return (
    <Layout>
      <div className="space-y-8 md:space-y-12 pb-32">
        {/* Enhanced Hero Section - Mobile Optimized */}
        <section className={`relative overflow-hidden rounded-2xl md:rounded-3xl glass ${isMobile ? 'p-6' : 'p-8 md:p-16'} animate-fade-in`}>
          <div className="absolute inset-0 gradient-primary opacity-10 animate-shimmer"></div>
          {!isMobile && (
            <div className="absolute top-4 right-4">
              <Sparkles className="h-8 w-8 text-purple-400 animate-bounce-gentle" />
            </div>
          )}
          <div className="relative z-10">
            <div className={`${isMobile ? 'space-y-6' : 'grid md:grid-cols-2 gap-12 items-center'}`}>
              <div className="space-y-6 md:space-y-8 animate-slide-up">
                <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl md:text-7xl'} font-bold text-white leading-tight`}>
                  Your Music,
                  <br />
                  <span className="text-gradient animate-glow">Reimagined</span>
                </h1>
                <p className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} text-gray-300 leading-relaxed`}>
                  Experience AI-powered music discovery, smart playlists, and real-time collaboration.
                </p>
                
                {/* Enhanced Search Bar */}
                <div className="max-w-lg">
                  <VoiceSearch 
                    onSearch={handleSearch}
                    placeholder={isMobile ? "Ask AI..." : "Ask AI to find your perfect song..."}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleStartListening}
                    className={`gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 ${
                      isMobile ? 'text-lg px-8 py-3' : 'text-xl px-10 py-4'
                    } rounded-full shadow-2xl hover:shadow-purple-500/25`}
                    disabled={featuredTracks.length === 0}
                  >
                    <Play className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} mr-3`} />
                    Start Listening
                  </Button>
                  {!user && <AuthButton />}
                </div>
              </div>
              
              {!isMobile && (
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
              )}
            </div>
          </div>
        </section>

        {/* Quick Stats - Mobile Optimized */}
        <section className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-8'}`}>
          {[
            { icon: TrendingUp, value: featuredTracks.length, label: "Songs Available", color: "text-purple-400", delay: "0s" },
            { icon: Clock, value: "2.8M", label: "Hours Streamed", color: "text-pink-400", delay: "0.1s" },
            { icon: Star, value: "94.5%", label: "User Satisfaction", color: "text-yellow-400", delay: "0.2s" }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`glass ${isMobile ? 'p-6' : 'p-8'} rounded-2xl text-center hover-lift animate-fade-in group relative overflow-hidden`}
              style={{ animationDelay: stat.delay }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <stat.icon className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} ${stat.color} mx-auto mb-4 animate-bounce-gentle relative z-10`} />
              <h3 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white mb-2 relative z-10`}>{stat.value}</h3>
              <p className={`text-gray-400 ${isMobile ? 'text-base' : 'text-lg'} relative z-10`}>{stat.label}</p>
            </div>
          ))}
        </section>

        {/* AI-Powered Features - Mobile Responsive */}
        {user && (
          <section className={`${isMobile ? 'space-y-6' : 'grid lg:grid-cols-3 gap-8'} animate-fade-in`} style={{ animationDelay: "0.3s" }}>
            <div className={isMobile ? 'space-y-6' : 'lg:col-span-2 space-y-8'}>
              <AIRecommendations />
              <SmartPlaylistGenerator />
            </div>
            <div>
              <LiveActivityFeed />
            </div>
          </section>
        )}

        {/* Featured Music - Mobile Grid */}
        <section className="space-y-6 md:space-y-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white`}>
                {isSearching ? 'Searching...' : searchResults.length !== featuredTracks.length ? 'Search Results' : 'Featured Tracks'}
              </h2>
              {searchResults.length !== featuredTracks.length && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    setSearchResults(featuredTracks);
                    setIsSearching(false);
                  }}
                >
                  Clear Search
                </Button>
              )}
            </div>
            {!isMobile && (
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            )}
          </div>
          
          <div className={`grid ${
            isMobile 
              ? 'grid-cols-2 gap-4' 
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8'
          }`}>
            {searchResults.map((track, index) => (
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
                  allSongs={searchResults}
                />
              </div>
            ))}
          </div>

          {searchResults.length === 0 && !isSearching && (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No songs found</h3>
              <p className="text-gray-400">Try adjusting your search terms</p>
            </div>
          )}
        </section>

        {/* Recently Played - Mobile Optimized */}
        {user && recentlyPlayed.length > 0 && (
          <section className="space-y-6 md:space-y-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white`}>Recently Played</h2>
            <div className="glass rounded-2xl overflow-hidden shadow-2xl">
              <div className="space-y-0">
                {recentlyPlayed.map((track, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 md:space-x-6 ${isMobile ? 'p-4' : 'p-6'} hover:bg-white/5 transition-all duration-300 cursor-pointer group animate-fade-in relative overflow-hidden`}
                    style={{ animationDelay: `${0.1 * index}s` }}
                    onClick={() => {
                      setPlaylist(recentlyPlayed);
                      playSong(track);
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} gradient-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                      <Music className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-white`} />
                    </div>
                    <div className="flex-1 relative z-10 min-w-0">
                      <p className={`text-white font-semibold ${isMobile ? 'text-base' : 'text-lg'} group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300 truncate`}>
                        {track.title}
                      </p>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm truncate">
                        {track.artist}
                      </p>
                    </div>
                    {!isMobile && (
                      <>
                        <div className="text-gray-400 text-sm font-medium relative z-10">
                          {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : ''}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-purple-400 hover:text-purple-300 transform translate-x-4 group-hover:translate-x-0 relative z-10"
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      </>
                    )}
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
