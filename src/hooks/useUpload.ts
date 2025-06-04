
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

    setUploadProgress({ progress: 0, isUploading: true });

    try {
      // Upload audio file
      const audioFileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: audioData, error: audioError } = await supabase.storage
        .from('music-files')
        .upload(audioFileName, file);

      if (audioError) throw audioError;

      setUploadProgress({ progress: 50, isUploading: true });

      // Get public URL for the audio file
      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('music-files')
        .getPublicUrl(audioFileName);

      // Get audio duration using Audio API
      const audio = new Audio();
      const duration = await new Promise<number>((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          resolve(Math.floor(audio.duration));
        });
        audio.src = URL.createObjectURL(file);
      });

      setUploadProgress({ progress: 75, isUploading: true });

      // Insert song record into database
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .insert({
          user_id: user.id,
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album,
          genre: metadata.genre,
          duration: duration,
          file_url: audioUrl,
        })
        .select()
        .single();

      if (songError) throw songError;

      setUploadProgress({ progress: 100, isUploading: false });

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['featured-songs'] });

      toast({
        title: "Upload successful!",
        description: `${metadata.title} has been uploaded successfully.`,
      });

      return songData;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({ progress: 0, isUploading: false });
      toast({
        title: "Upload failed",
        description: "There was an error uploading your song. Please try again.",
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
