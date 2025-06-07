
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Music, CheckCircle } from 'lucide-react';
import { useUpload } from '@/hooks/useUpload';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedFile?: File | null;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, preSelectedFile }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
  });
  const { uploadSong, uploadProgress } = useUpload();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setMetadata({ title: '', artist: '', album: '', genre: '' });
    }
  }, [isOpen]);

  // Handle pre-selected file
  useEffect(() => {
    if (isOpen && preSelectedFile) {
      handleFileSelection(preSelectedFile);
    }
  }, [isOpen, preSelectedFile]);

  const handleFileSelection = (file: File) => {
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      // Auto-fill title from filename
      const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      setMetadata(prev => ({ 
        ...prev, 
        title: fileName.charAt(0).toUpperCase() + fileName.slice(1)
      }));
    } else {
      console.error('Invalid file type:', file.type);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !metadata.title || !metadata.artist) {
      console.error('Missing required fields:', { selectedFile: !!selectedFile, title: metadata.title, artist: metadata.artist });
      return;
    }

    try {
      console.log('Starting upload with metadata:', metadata);
      await uploadSong(selectedFile, metadata);
      // Reset form and close modal on success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleClose = () => {
    if (!uploadProgress.isUploading) {
      onClose();
    }
  };

  const isFormValid = selectedFile && metadata.title.trim() && metadata.artist.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass border border-white/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl font-bold flex items-center">
            <Music className="h-6 w-6 mr-2 text-purple-400" />
            Upload Music
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center transition-all duration-300 hover:border-purple-400/50 hover:bg-white/5">
              <div className="animate-float">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              </div>
              <p className="text-gray-300 mb-6 text-lg">Choose an audio file to upload</p>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="modal-file-upload"
              />
              <Label htmlFor="modal-file-upload" className="cursor-pointer">
                <Button className="gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 text-lg px-8 py-3">
                  <Upload className="h-5 w-5 mr-2" />
                  Select Audio File
                </Button>
              </Label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-white/10">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                  </p>
                </div>
                {!uploadProgress.isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Upload Progress */}
              {uploadProgress.isUploading && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 flex items-center">
                      {uploadProgress.progress === 100 ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                          Upload Complete!
                        </>
                      ) : (
                        `Uploading ${metadata.title}...`
                      )}
                    </span>
                    <span className="text-purple-400 font-semibold">{uploadProgress.progress}%</span>
                  </div>
                  <Progress 
                    value={uploadProgress.progress} 
                    className="w-full h-2"
                  />
                </div>
              )}

              {/* Metadata Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white font-medium">Song Title *</Label>
                  <Input
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-400 transition-colors"
                    placeholder="Enter song title"
                    disabled={uploadProgress.isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">Artist *</Label>
                  <Input
                    value={metadata.artist}
                    onChange={(e) => setMetadata(prev => ({ ...prev, artist: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-400 transition-colors"
                    placeholder="Enter artist name"
                    disabled={uploadProgress.isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">Album</Label>
                  <Input
                    value={metadata.album}
                    onChange={(e) => setMetadata(prev => ({ ...prev, album: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-400 transition-colors"
                    placeholder="Enter album name"
                    disabled={uploadProgress.isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">Genre</Label>
                  <Input
                    value={metadata.genre}
                    onChange={(e) => setMetadata(prev => ({ ...prev, genre: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-400 transition-colors"
                    placeholder="Enter genre"
                    disabled={uploadProgress.isUploading}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={!isFormValid || uploadProgress.isUploading}
                  className="flex-1 gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
                >
                  {uploadProgress.isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {uploadProgress.progress === 100 ? 'Finishing...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Song
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={uploadProgress.isUploading}
                  className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 px-8"
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
