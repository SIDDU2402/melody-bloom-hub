
import React, { useState } from 'react';
import { Upload, Music, FileAudio } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UploadModal from './UploadModal';

const UploadZone: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('audio/')) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Card 
        className={`glass border-2 border-dashed p-12 text-center transition-all duration-300 ${
          isDragOver 
            ? 'border-purple-400 bg-purple-400/10 scale-105' 
            : 'border-white/20 hover:border-purple-400/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center animate-float">
            <Upload className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Upload Your Music</h3>
            <p className="text-gray-400">Drag & drop your audio files here, or click to browse</p>
            <p className="text-sm text-gray-500">Supports MP3, FLAC, WAV files</p>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 text-purple-400">
              <FileAudio className="h-4 w-4" />
              <span className="text-sm">High Quality</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-400">
              <Music className="h-4 w-4" />
              <span className="text-sm">Auto-tagging</span>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="gradient-primary hover:opacity-90 transition-opacity"
          >
            Choose Files
          </Button>
        </div>
      </Card>

      <UploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default UploadZone;
