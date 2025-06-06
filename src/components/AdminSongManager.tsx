
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Music, Search, Edit, Trash2, Plus, Play } from 'lucide-react';
import { useFeaturedSongs } from '@/hooks/useSongs';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import UploadModal from './UploadModal';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const AdminSongManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { data: songs = [], isLoading } = useFeaturedSongs();
  const queryClient = useQueryClient();
  const { playSong, setPlaylist } = useMusicPlayer();

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['songs'] });
      await queryClient.invalidateQueries({ queryKey: ['featured-songs'] });

      toast({
        title: "Song deleted",
        description: "The song has been successfully removed.",
      });
    } catch (error) {
      console.error('Error deleting song:', error);
      toast({
        title: "Error",
        description: "Failed to delete the song. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePlaySong = (song: any) => {
    setPlaylist(songs);
    playSong(song);
  };

  if (isLoading) {
    return (
      <Card className="glass p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Music className="h-6 w-6 mr-2 text-purple-400" />
            Song Management
          </h2>
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
            className="gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Song
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Songs List */}
        <div className="space-y-3">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {searchQuery ? 'No songs found matching your search.' : 'No songs uploaded yet.'}
              </p>
            </div>
          ) : (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{song.title}</h3>
                    <p className="text-gray-400 truncate">{song.artist}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {song.album && (
                        <Badge variant="outline" className="text-xs">
                          {song.album}
                        </Badge>
                      )}
                      {song.genre && (
                        <Badge variant="outline" className="text-xs">
                          {song.genre}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlaySong(song)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSong(song.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
};

export default AdminSongManager;
