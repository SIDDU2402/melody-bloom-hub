
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Music, User, List } from 'lucide-react';
import { useSongs } from '@/hooks/useSongs';
import { usePlaylists } from '@/hooks/usePlaylists';
import MusicCard from './MusicCard';

interface SearchBarProps {
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchFocus, onSearchBlur }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data: songs } = useSongs();
  const { data: playlists } = usePlaylists();

  const filteredSongs = songs?.filter(song =>
    song.title.toLowerCase().includes(query.toLowerCase()) ||
    song.artist.toLowerCase().includes(query.toLowerCase()) ||
    song.album?.toLowerCase().includes(query.toLowerCase()) ||
    song.genre?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6) || [];

  const filteredPlaylists = playlists?.filter(playlist =>
    playlist.name.toLowerCase().includes(query.toLowerCase()) ||
    playlist.description?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3) || [];

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search songs, artists, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            onSearchFocus?.();
          }}
          className="pl-10 w-80 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
        />
      </div>

      {isOpen && query && (
        <Card className="absolute top-full left-0 right-0 mt-2 glass border border-white/20 max-h-96 overflow-y-auto z-50">
          <div className="p-4 space-y-4">
            {filteredSongs.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Music className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Songs</span>
                </div>
                <div className="space-y-2">
                  {filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                      }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Music className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{song.title}</p>
                        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredPlaylists.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <List className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Playlists</span>
                </div>
                <div className="space-y-2">
                  {filteredPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <List className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{playlist.name}</p>
                        <p className="text-gray-400 text-sm truncate">{playlist.description || 'Playlist'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredSongs.length === 0 && filteredPlaylists.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No results found for "{query}"</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
