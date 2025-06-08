
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
    album?: string | null;
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
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    setUploadProgress({ progress: 0, isUploading: true });

    try {
      // Validate file type
      const validAudioTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
        'audio/aac', 'audio/ogg', 'audio/flac', 'audio/x-wav'
      ];
      
      if (!validAudioTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/i)) {
        throw new Error('Please select a valid audio file (MP3, WAV, M4A, AAC, OGG, FLAC)');
      }

      // Validate file size (100MB limit)
      if (file.size > 104857600) {
        throw new Error('File size must be less than 100MB');
      }

      setUploadProgress({ progress: 10, isUploading: true });

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${user.id}/${timestamp}-${randomId}.${fileExtension}`;
      
      console.log('Uploading to path:', fileName);
      
      setUploadProgress({ progress: 20, isUploading: true });

      // Upload audio file to storage
      const { data: audioData, error: audioError } = await supabase.storage
        .from('music-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'audio/mpeg'
        });

      if (audioError) {
        console.error('Storage upload error:', audioError);
        
        // If bucket doesn't exist, the error message will indicate that
        if (audioError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket not configured. Please contact administrator.');
        }
        
        throw new Error(`Upload failed: ${audioError.message}`);
      }

      console.log('File uploaded successfully:', audioData);
      setUploadProgress({ progress: 60, isUploading: true });

      // Get public URL for the audio file
      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('music-files')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', audioUrl);
      setUploadProgress({ progress: 70, isUploading: true });

      // Get audio duration
      let duration = 0;
      try {
        const audio = new Audio();
        duration = await new Promise<number>((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Timeout loading audio metadata, using default duration');
            resolve(0);
          }, 8000);

          audio.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            const audioDuration = Math.floor(audio.duration);
            console.log('Audio duration detected:', audioDuration);
            resolve(audioDuration || 0);
          });
          
          audio.addEventListener('error', (e) => {
            clearTimeout(timeout);
            console.warn('Error loading audio metadata:', e);
            resolve(0);
          });
          
          // Create object URL for local file
          const objectUrl = URL.createObjectURL(file);
          audio.src = objectUrl;
          
          // Clean up object URL after loading
          audio.addEventListener('loadedmetadata', () => {
            URL.revokeObjectURL(objectUrl);
          });
        });
      } catch (error) {
        console.warn('Could not determine audio duration:', error);
        duration = 0;
      }

      setUploadProgress({ progress: 85, isUploading: true });

      // Insert song record into database
      const songData = {
        user_id: user.id,
        title: metadata.title.trim(),
        artist: metadata.artist.trim(),
        album_id: metadata.album || null,
        genre: metadata.genre?.trim() || null,
        duration: duration,
        file_url: audioUrl,
        play_count: 0
      };

      console.log('Inserting song data:', songData);

      const { data: insertedSong, error: songError } = await supabase
        .from('songs')
        .insert(songData)
        .select()
        .single();

      if (songError) {
        console.error('Database insert error:', songError);
        
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('music-files')
          .remove([fileName]);
          
        throw new Error(`Failed to save song: ${songError.message}`);
      }

      console.log('Song saved to database:', insertedSong);
      setUploadProgress({ progress: 100, isUploading: false });

      // Invalidate queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['songs'] });
      await queryClient.invalidateQueries({ queryKey: ['featured-songs'] });
      await queryClient.invalidateQueries({ queryKey: ['albums'] });

      toast({
        title: "Upload successful! 🎵",
        description: `${metadata.title} by ${metadata.artist} has been uploaded successfully.`,
      });

      return insertedSong;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({ progress: 0, isUploading: false });
      
      const errorMessage = error instanceof Error ? error.message : "Upload failed. Please try again.";
      
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
