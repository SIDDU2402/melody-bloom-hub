
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface UploadProgress {
  progress: number;
  isUploading: boolean;
}

export const useUpload = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false,
  });

  const uploadSong = async (file: File, metadata: {
    title: string;
    artist: string;
    album?: string;
    genre?: string;
  }) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to upload music",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting upload process for:', file.name);
    setUploadProgress({ progress: 0, isUploading: true });

    try {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        throw new Error('Please select a valid audio file');
      }

      // Upload audio file with better file naming
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
      const audioFileName = `${user.id}/${fileName}.${fileExtension}`;
      
      console.log('Uploading to path:', audioFileName);
      
      // Create the bucket if it doesn't exist (this will fail gracefully if it already exists)
      const { error: bucketError } = await supabase.storage.createBucket('music-files', {
        public: true,
        allowedMimeTypes: ['audio/*'],
        fileSizeLimit: 104857600 // 100MB
      });
      
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('Bucket creation error:', bucketError);
      }
      
      const { data: audioData, error: audioError } = await supabase.storage
        .from('music-files')
        .upload(audioFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (audioError) {
        console.error('Upload error:', audioError);
        throw new Error(`Upload failed: ${audioError.message}`);
      }

      console.log('File uploaded successfully:', audioData);
      setUploadProgress({ progress: 50, isUploading: true });

      // Get public URL for the audio file
      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('music-files')
        .getPublicUrl(audioFileName);

      console.log('Public URL generated:', audioUrl);

      // Get audio duration using Audio API
      let duration = 0;
      try {
        const audio = new Audio();
        duration = await new Promise<number>((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.warn('Timeout loading audio metadata, using default duration');
            resolve(0);
          }, 10000);

          audio.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            resolve(Math.floor(audio.duration));
          });
          
          audio.addEventListener('error', (e) => {
            clearTimeout(timeout);
            console.warn('Error loading audio metadata:', e);
            resolve(0);
          });
          
          audio.src = URL.createObjectURL(file);
        });
      } catch (error) {
        console.warn('Could not determine audio duration:', error);
        duration = 0;
      }

      console.log('Audio duration calculated:', duration);
      setUploadProgress({ progress: 75, isUploading: true });

      // Insert song record into database
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .insert({
          user_id: user.id,
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album || null,
          genre: metadata.genre || null,
          duration: duration,
          file_url: audioUrl,
        })
        .select()
        .single();

      if (songError) {
        console.error('Database insert error:', songError);
        throw new Error(`Database error: ${songError.message}`);
      }

      console.log('Song saved to database:', songData);
      setUploadProgress({ progress: 100, isUploading: false });

      // Invalidate queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['songs'] });
      await queryClient.invalidateQueries({ queryKey: ['featured-songs'] });

      toast({
        title: "Upload successful! 🎵",
        description: `${metadata.title} by ${metadata.artist} has been uploaded successfully.`,
      });

      return songData;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({ progress: 0, isUploading: false });
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    uploadSong,
    uploadProgress,
  };
};
