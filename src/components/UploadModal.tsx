
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X } from 'lucide-react';
import { useUpload } from '@/hooks/useUpload';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
  });
  const { uploadSong, uploadProgress } = useUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      // Auto-fill title from filename
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setMetadata(prev => ({ ...prev, title: fileName }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !metadata.title || !metadata.artist) {
      return;
    }

    try {
      await uploadSong(selectedFile, metadata);
      // Reset form and close modal
      setSelectedFile(null);
      setMetadata({ title: '', artist: '', album: '', genre: '' });
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleClose = () => {
    if (!uploadProgress.isUploading) {
      setSelectedFile(null);
      setMetadata({ title: '', artist: '', album: '', genre: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Music</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Choose an audio file to upload</p>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button className="gradient-primary">
                  Select File
                </Button>
              </Label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-white/10 rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                {!uploadProgress.isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Title *</Label>
                  <Input
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Song title"
                    disabled={uploadProgress.isUploading}
                  />
                </div>
                <div>
                  <Label className="text-white">Artist *</Label>
                  <Input
                    value={metadata.artist}
                    onChange={(e) => setMetadata(prev => ({ ...prev, artist: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Artist name"
                    disabled={uploadProgress.isUploading}
                  />
                </div>
                <div>
                  <Label className="text-white">Album</Label>
                  <Input
                    value={metadata.album}
                    onChange={(e) => setMetadata(prev => ({ ...prev, album: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Album name"
                    disabled={uploadProgress.isUploading}
                  />
                </div>
                <div>
                  <Label className="text-white">Genre</Label>
                  <Input
                    value={metadata.genre}
                    onChange={(e) => setMetadata(prev => ({ ...prev, genre: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Genre"
                    disabled={uploadProgress.isUploading}
                  />
                </div>
              </div>

              {uploadProgress.isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress.progress}%</span>
                  </div>
                  <Progress value={uploadProgress.progress} className="w-full" />
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  disabled={!metadata.title || !metadata.artist || uploadProgress.isUploading}
                  className="flex-1 gradient-primary"
                >
                  {uploadProgress.isUploading ? 'Uploading...' : 'Upload Song'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={uploadProgress.isUploading}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
