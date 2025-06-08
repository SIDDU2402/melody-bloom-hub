
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Album {
  id: string;
  title: string;
  artist_id?: string;
  genre?: string;
  cover_url?: string;
  release_date?: string;
  created_at: string;
  user_id: string;
}

interface CreateAlbumData {
  title: string;
  genre?: string;
  release_date?: string;
}

export const useAlbums = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: albums = [], isLoading, error } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Album[];
    },
    enabled: !!user,
  });

  const createAlbumMutation = useMutation({
    mutationFn: async (albumData: CreateAlbumData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('albums')
        .insert({
          ...albumData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Album;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      toast({
        title: "Album created",
        description: "The album has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating album:', error);
      toast({
        title: "Error",
        description: "Failed to create album. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    albums,
    isLoading,
    error,
    createAlbum: createAlbumMutation.mutate,
    isCreatingAlbum: createAlbumMutation.isPending,
  };
};
