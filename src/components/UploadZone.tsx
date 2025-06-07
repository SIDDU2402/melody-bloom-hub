
import React, { useState } from 'react';
import { Upload, Music, FileAudio, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UploadModal from './UploadModal';

const UploadZone: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if leaving the actual drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
    
    if (files.length > 0) {
      const audioFiles = files.filter(file => file.type.startsWith('audio/'));
      if (audioFiles.length > 0) {
        console.log('Valid audio files found:', audioFiles);
        setSelectedFile(audioFiles[0]);
        setIsModalOpen(true);
      } else {
        console.log('No audio files found in drop');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('File selected via input:', files[0]);
      setSelectedFile(files[0]);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  return (
    <>
      <Card 
        className={`glass border-2 border-dashed p-12 text-center transition-all duration-500 transform hover:scale-[1.02] ${
          isDragOver 
            ? 'border-purple-400 bg-purple-400/20 scale-105 shadow-2xl shadow-purple-500/25' 
            : 'border-white/20 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/10'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-8">
          <div className="relative mx-auto w-20 h-20">
            <div className={`absolute inset-0 rounded-full gradient-primary opacity-20 animate-ping ${isDragOver ? 'animate-pulse' : ''}`}></div>
            <div className="relative w-20 h-20 rounded-full gradient-primary flex items-center justify-center animate-float shadow-lg">
              {isDragOver ? (
                <Sparkles className="h-10 w-10 text-white animate-spin" />
              ) : (
                <Upload className="h-10 w-10 text-white" />
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white">
              {isDragOver ? 'Drop your music here!' : 'Upload Your Music'}
            </h3>
            <p className="text-gray-300 text-lg">
              {isDragOver 
                ? 'Release to start uploading...' 
                : 'Drag & drop your audio files here, or click to browse'
              }
            </p>
            <p className="text-sm text-gray-400">Supports MP3, FLAC, WAV, M4A files</p>
          </div>
          
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2 text-purple-400 animate-fade-in">
              <FileAudio className="h-5 w-5" />
              <span className="text-sm font-medium">High Quality</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-400 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Music className="h-5 w-5" />
              <span className="text-sm font-medium">Auto-tagging</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-400 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Instant Play</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
              multiple
            />
            <label htmlFor="file-upload">
              <Button 
                asChild
                className="gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 text-lg px-8 py-3"
              >
                <span>
                  <Upload className="h-5 w-5 mr-2" />
                  Choose Files
                </span>
              </Button>
            </label>
          </div>
        </div>
      </Card>

      <UploadModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        preSelectedFile={selectedFile}
      />
    </>
  );
};

export default UploadZone;
