
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Album as AlbumIcon } from 'lucide-react';
import { useAlbums } from '@/hooks/useAlbums';

interface AlbumSelectorProps {
  selectedAlbumId?: string;
  onAlbumSelect: (albumId: string | null) => void;
  artistName?: string;
}

const AlbumSelector: React.FC<AlbumSelectorProps> = ({ 
  selectedAlbumId, 
  onAlbumSelect, 
  artistName 
}) => {
  const { albums, createAlbum, isCreatingAlbum } = useAlbums();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAlbumData, setNewAlbumData] = useState({
    title: '',
    genre: '',
    release_date: '',
  });

  const handleCreateAlbum = async () => {
    if (!newAlbumData.title.trim()) {
      return;
    }

    try {
      const album = await createAlbum({
        title: newAlbumData.title.trim(),
        genre: newAlbumData.genre.trim() || undefined,
        release_date: newAlbumData.release_date || undefined,
      });
      
      if (album && album.id) {
        onAlbumSelect(album.id);
        setIsCreateDialogOpen(false);
        setNewAlbumData({ title: '', genre: '', release_date: '' });
      }
    } catch (error) {
      console.error('Error creating album:', error);
    }
  };

  const filteredAlbums = artistName 
    ? albums.filter(album => 
        !album.artist_id || // Albums without specific artist
        album.title.toLowerCase().includes(artistName.toLowerCase())
      )
    : albums;

  return (
    <div className="space-y-2">
      <Label className="text-white font-medium">Album</Label>
      <div className="flex space-x-2">
        <Select value={selectedAlbumId || ""} onValueChange={(value) => onAlbumSelect(value || null)}>
          <SelectTrigger className="flex-1 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select an album or leave empty" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-white/20">
            <SelectItem value="">No Album</SelectItem>
            {filteredAlbums.map((album) => (
              <SelectItem key={album.id} value={album.id} className="text-white hover:bg-white/10">
                <div className="flex items-center space-x-2">
                  <AlbumIcon className="h-4 w-4" />
                  <span>{album.title}</span>
                  {album.genre && <span className="text-gray-400 text-sm">({album.genre})</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border border-white/20 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-bold flex items-center">
                <AlbumIcon className="h-5 w-5 mr-2 text-purple-400" />
                Create New Album
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Album Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={newAlbumData.title}
                  onChange={(e) => setNewAlbumData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  placeholder="Enter album title"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white font-medium">Genre</Label>
                <Input
                  value={newAlbumData.genre}
                  onChange={(e) => setNewAlbumData(prev => ({ ...prev, genre: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  placeholder="Enter genre"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white font-medium">Release Date</Label>
                <Input
                  type="date"
                  value={newAlbumData.release_date}
                  onChange={(e) => setNewAlbumData(prev => ({ ...prev, release_date: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleCreateAlbum}
                  disabled={!newAlbumData.title.trim() || isCreatingAlbum}
                  className="flex-1 gradient-primary hover:opacity-90 disabled:opacity-50"
                >
                  {isCreatingAlbum ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Album
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AlbumSelector;
