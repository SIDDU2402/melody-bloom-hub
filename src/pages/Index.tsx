
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
import { Play, TrendingUp, Clock, Star, Music, Sparkles, Search, Filter, Zap, Heart, Users } from 'lucide-react';
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
      <div className="space-y-12 pb-32 scrollbar-custom">
        {/* Spectacular Hero Section */}
        <section className={`relative overflow-hidden rounded-3xl glass-intense ${isMobile ? 'p-8' : 'p-16'} animate-slide-up-stagger`}>
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 gradient-primary rounded-full animate-morph opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 gradient-secondary rounded-full animate-morph opacity-20 blur-3xl" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 gradient-tertiary rounded-full animate-morph opacity-10 blur-3xl" style={{ animationDelay: '4s' }}></div>
          </div>
          
          {/* Floating Elements */}
          {!isMobile && (
            <>
              <div className="absolute top-8 right-8 animate-float-gentle">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <div className="absolute top-20 left-16 animate-float-gentle" style={{ animationDelay: '1s' }}>
                <Music className="h-6 w-6 text-pink-400" />
              </div>
              <div className="absolute bottom-16 right-24 animate-float-gentle" style={{ animationDelay: '2s' }}>
                <Heart className="h-7 w-7 text-red-400" />
              </div>
            </>
          )}

          <div className="relative z-10">
            <div className={`${isMobile ? 'space-y-8' : 'grid md:grid-cols-2 gap-16 items-center'}`}>
              <div className="space-y-8 animate-slide-up-stagger" style={{ animationDelay: '0.2s' }}>
                <div className="space-y-4">
                  <h1 className={`${isMobile ? 'text-4xl' : 'text-6xl md:text-8xl'} font-black text-white leading-tight text-shadow`}>
                    Your Music,
                    <br />
                    <span className="text-gradient animate-pulse-glow">Reimagined</span>
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                </div>
                
                <p className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} text-gray-300 leading-relaxed font-medium`}>
                  Experience AI-powered music discovery with stunning visuals, 
                  smart playlists, and real-time collaboration in the most beautiful music platform ever created.
                </p>
                
                {/* Enhanced Search Bar */}
                <div className="relative max-w-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-75"></div>
                  <div className="relative">
                    <VoiceSearch 
                      onSearch={handleSearch}
                      placeholder={isMobile ? "Ask AI to find your vibe..." : "Ask AI to discover your perfect sound..."}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleStartListening}
                    className={`gradient-primary group ${
                      isMobile ? 'text-lg px-8 py-4' : 'text-xl px-12 py-5'
                    } rounded-2xl shadow-2xl relative overflow-hidden`}
                    disabled={featuredTracks.length === 0}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Play className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} transition-transform group-hover:scale-110`} />
                        <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 animate-ping"></div>
                      </div>
                      <span className="font-bold">Start Your Journey</span>
                    </div>
                  </Button>
                  {!user && (
                    <div className="animate-slide-up-stagger" style={{ animationDelay: '0.4s' }}>
                      <AuthButton />
                    </div>
                  )}
                </div>
              </div>
              
              {!isMobile && (
                <div className="relative animate-float-gentle" style={{ animationDelay: '0.6s' }}>
                  <div className="glass-intense p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-shimmer-intense"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Now Playing</h3>
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                      <AudioVisualizer />
                      <div className="mt-8 text-center space-y-3">
                        <p className="text-white font-bold text-xl">Electric Dreams</p>
                        <p className="text-gray-300 text-lg">Synthwave Collective</p>
                        <div className="flex items-center justify-center space-x-4 mt-4">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Spectacular Stats Section */}
        <section className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-3 gap-8'} animate-slide-up-stagger`} style={{ animationDelay: '0.8s' }}>
          {[
            { icon: TrendingUp, value: featuredTracks.length, label: "Songs Available", color: "text-purple-400", gradient: "from-purple-500 to-purple-700", delay: "0s" },
            { icon: Users, value: "2.8M", label: "Active Listeners", color: "text-pink-400", gradient: "from-pink-500 to-pink-700", delay: "0.1s" },
            { icon: Zap, value: "94.5%", label: "User Satisfaction", color: "text-yellow-400", gradient: "from-yellow-400 to-yellow-600", delay: "0.2s" }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`glass-card group cursor-pointer animate-slide-up-stagger ${isMobile ? 'p-8' : 'p-10'} text-center relative overflow-hidden`}
              style={{ animationDelay: stat.delay }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-6 animate-pulse-glow`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-black text-white mb-3 text-shadow`}>{stat.value}</h3>
                <p className={`${stat.color} ${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>{stat.label}</p>
                <div className={`w-12 h-1 bg-gradient-to-r ${stat.gradient} rounded-full mx-auto mt-4 opacity-60`}></div>
              </div>
            </div>
          ))}
        </section>

        {/* AI-Powered Features - Enhanced Design */}
        {user && (
          <section className={`${isMobile ? 'space-y-8' : 'grid lg:grid-cols-3 gap-8'} animate-slide-up-stagger`} style={{ animationDelay: '1s' }}>
            <div className={isMobile ? 'space-y-8' : 'lg:col-span-2 space-y-8'}>
              <div className="animate-slide-up-stagger" style={{ animationDelay: '1.2s' }}>
                <AIRecommendations />
              </div>
              <div className="animate-slide-up-stagger" style={{ animationDelay: '1.4s' }}>
                <SmartPlaylistGenerator />
              </div>
            </div>
            <div className="animate-slide-up-stagger" style={{ animationDelay: '1.6s' }}>
              <LiveActivityFeed />
            </div>
          </section>
        )}

        {/* Featured Music - Stunning Grid */}
        <section className="space-y-8 animate-slide-up-stagger" style={{ animationDelay: '1.8s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-black text-white text-shadow`}>
                {isSearching ? (
                  <span className="animate-pulse">Searching...</span>
                ) : searchResults.length !== featuredTracks.length ? (
                  <>Search Results <span className="text-gradient">({searchResults.length})</span></>
                ) : (
                  <>Featured <span className="text-gradient">Tracks</span></>
                )}
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            </div>
            
            <div className="flex items-center space-x-4">
              {searchResults.length !== featuredTracks.length && (
                <Button 
                  variant="outline" 
                  className="btn-ghost"
                  onClick={() => {
                    setSearchResults(featuredTracks);
                    setIsSearching(false);
                  }}
                >
                  Clear Search
                </Button>
              )}
              {!isMobile && (
                <Button className="btn-ghost">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              )}
            </div>
          </div>
          
          <div className={`grid ${
            isMobile 
              ? 'grid-cols-2 gap-4' 
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8'
          }`}>
            {searchResults.map((track, index) => (
              <div 
                key={track.id}
                className="animate-slide-up-stagger"
                style={{ animationDelay: `${2 + 0.1 * index}s` }}
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
            <div className="text-center py-24 space-y-6">
              <div className="relative inline-block">
                <Search className="h-24 w-24 text-gray-400 mx-auto animate-pulse-glow" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">No songs found</h3>
                <p className="text-gray-400 text-lg">Try adjusting your search terms or explore our featured tracks</p>
              </div>
            </div>
          )}
        </section>

        {/* Recently Played - Enhanced Design */}
        {user && recentlyPlayed.length > 0 && (
          <section className="space-y-8 animate-slide-up-stagger" style={{ animationDelay: '2.2s' }}>
            <div className="space-y-4">
              <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-black text-white text-shadow`}>
                Recently <span className="text-gradient">Played</span>
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
            </div>
            
            <div className="glass-intense rounded-3xl overflow-hidden shadow-2xl">
              <div className="space-y-0">
                {recentlyPlayed.map((track, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-6 ${isMobile ? 'p-6' : 'p-8'} hover:bg-white/5 transition-all duration-500 cursor-pointer group relative overflow-hidden animate-slide-up-stagger border-b border-white/5 last:border-b-0`}
                    style={{ animationDelay: `${2.4 + 0.1 * index}s` }}
                    onClick={() => {
                      setPlaylist(recentlyPlayed);
                      playSong(track);
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} gradient-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-lg`}>
                      <Music className={`${isMobile ? 'h-7 w-7' : 'h-10 w-10'} text-white`} />
                    </div>
                    
                    <div className="flex-1 relative z-10 min-w-0 space-y-1">
                      <p className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-xl'} group-hover:text-gradient transition-all duration-300 truncate`}>
                        {track.title}
                      </p>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors truncate font-medium">
                        {track.artist}
                      </p>
                    </div>
                    
                    {!isMobile && (
                      <>
                        <div className="text-gray-400 text-sm font-medium relative z-10 bg-white/5 px-3 py-1 rounded-lg">
                          {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : ''}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 player-control relative z-10"
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
