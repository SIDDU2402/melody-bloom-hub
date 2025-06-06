
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
      
      const { data: audioData, error: audioError } = await supabase.storage
        .from('music-files')
        .upload(audioFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (audioError) {
        console.error('Upload error:', audioError);
        throw audioError;
      }

      console.log('File uploaded successfully:', audioData);
      setUploadProgress({ progress: 50, isUploading: true });

      // Get public URL for the audio file
      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('music-files')
        .getPublicUrl(audioFileName);

      console.log('Public URL generated:', audioUrl);

      // Get audio duration using Audio API
      const audio = new Audio();
      const duration = await new Promise<number>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout loading audio metadata'));
        }, 10000);

        audio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          resolve(Math.floor(audio.duration));
        });
        
        audio.addEventListener('error', () => {
          clearTimeout(timeout);
          resolve(0); // Default duration if can't load
        });
        
        audio.src = URL.createObjectURL(file);
      });

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
        throw songError;
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
      
      // Clean up file if it was uploaded but database insert failed
      if (error instanceof Error && error.message.includes('duplicate')) {
        toast({
          title: "Song already exists",
          description: "This song has already been uploaded.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "There was an error uploading your song. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  return {
    uploadSong,
    uploadProgress,
  };
};
