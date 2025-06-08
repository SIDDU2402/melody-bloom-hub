
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Music, CheckCircle } from 'lucide-react';
import { useUpload } from '@/hooks/useUpload';
import AlbumSelector from './AlbumSelector';

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
    albumId: null as string | null,
    genre: '',
  });
  const [dragOver, setDragOver] = useState(false);
  const { uploadSong, uploadProgress } = useUpload();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setMetadata({ title: '', artist: '', albumId: null, genre: '' });
      setDragOver(false);
    }
  }, [isOpen]);

  // Handle pre-selected file
  useEffect(() => {
    if (isOpen && preSelectedFile) {
      handleFileSelection(preSelectedFile);
    }
  }, [isOpen, preSelectedFile]);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
      'audio/aac', 'audio/ogg', 'audio/flac', 'audio/x-wav'
    ];
    
    const hasValidType = validTypes.includes(file.type) || 
                        file.name.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/i);
    
    if (!hasValidType) {
      console.error('Invalid file type:', file.type, 'File name:', file.name);
      return false;
    }
    
    if (file.size > 104857600) { // 100MB
      console.error('File too large:', file.size);
      return false;
    }
    
    return true;
  };

  const handleFileSelection = (file: File) => {
    console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    if (!validateFile(file)) {
      alert('Please select a valid audio file (MP3, WAV, M4A, AAC, OGG, FLAC) under 100MB');
      return;
    }
    
    setSelectedFile(file);
    
    // Auto-fill title from filename
    const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    const cleanTitle = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    
    setMetadata(prev => ({ 
      ...prev, 
      title: cleanTitle
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !metadata.title.trim() || !metadata.artist.trim()) {
      alert('Please fill in all required fields (Title and Artist)');
      return;
    }

    try {
      console.log('Starting upload with metadata:', metadata);
      await uploadSong(selectedFile, {
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.albumId,
        genre: metadata.genre || undefined,
      });
      // The modal will close automatically after successful upload
    } catch (error) {
      console.error('Upload failed:', error);
      // Error is already handled in the useUpload hook
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
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragOver 
                  ? 'border-purple-400 bg-purple-400/20' 
                  : 'border-white/20 hover:border-purple-400/50 hover:bg-white/5'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-6 text-lg">
                {dragOver ? 'Drop your audio file here' : 'Choose an audio file to upload'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Supports MP3, WAV, M4A, AAC, OGG, FLAC files (max 100MB)
              </p>
              <Input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                onChange={handleFileSelect}
                className="hidden"
                id="modal-file-upload"
              />
              <Label htmlFor="modal-file-upload" className="cursor-pointer">
                <Button className="gradient-primary hover:opacity-90 transition-all duration-300 text-lg px-8 py-3">
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
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
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
                  <Label className="text-white font-medium flex items-center">
                    Song Title 
                    <span className="text-red-400 ml-1">*</span>
                  </Label>
                  <Input
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-400 transition-colors"
                    placeholder="Enter song title"
                    disabled={uploadProgress.isUploading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center">
                    Artist 
                    <span className="text-red-400 ml-1">*</span>
                  </Label>
                  <Input
                    value={metadata.artist}
                    onChange={(e) => setMetadata(prev => ({ ...prev, artist: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-400 transition-colors"
                    placeholder="Enter artist name"
                    disabled={uploadProgress.isUploading}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <AlbumSelector
                    selectedAlbumId={metadata.albumId}
                    onAlbumSelect={(albumId) => setMetadata(prev => ({ ...prev, albumId }))}
                    artistName={metadata.artist}
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
                  className="flex-1 gradient-primary hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
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
