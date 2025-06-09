
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface ChatRoom {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: Array<{
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  }>;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  message_type: 'text' | 'song' | 'system';
  song_id: string | null;
  created_at: string;
  updated_at: string;
  sender: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  song?: {
    id: string;
    title: string;
    artist: string;
    cover_url: string | null;
  };
}

export const useChatRooms = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['chat-rooms', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('chat_room_participants')
        .select(`
          room_id,
          chat_rooms (
            id,
            name,
            is_group,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const roomsWithParticipants = await Promise.all(
        (data || []).map(async (item: any) => {
          const room = item.chat_rooms;
          
          const { data: participants } = await supabase
            .from('chat_room_participants')
            .select(`
              user_id,
              profiles (
                id,
                full_name,
                avatar_url
              )
            `)
            .eq('room_id', room.id);
          
          return {
            ...room,
            participants: participants?.map((p: any) => p.profiles) || []
          };
        })
      );
      
      return roomsWithParticipants;
    },
    enabled: !!user,
  });
};

export const useMessages = (roomId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
          song:songs(id, title, artist, cover_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!roomId && !!user,
  });

  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase
      .channel(`messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          const { data: messageWithRelations } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
              song:songs(id, title, artist, cover_url)
            `)
            .eq('id', newMessage.id)
            .single();

          if (messageWithRelations) {
            queryClient.setQueryData(['messages', roomId], (old: any) => {
              const exists = old?.find((msg: any) => msg.id === messageWithRelations.id);
              if (exists) return old;
              return [...(old || []), messageWithRelations];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user, queryClient]);

  return query;
};

export const useCreateOrGetDMRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data: rpcResponse, error } = await supabase
        .rpc('get_or_create_dm_room', { other_user_id: otherUserId });
      
      if (error) {
        console.error('Error calling get_or_create_dm_room RPC:', error);
        throw error;
      }

      console.log('RPC get_or_create_dm_room response:', rpcResponse);

      // First, ensure rpcResponse is not null and is an object before trying to access properties
      if (rpcResponse && typeof rpcResponse === 'object') {
        // Explicitly type assertion if necessary, or check properties safely
        const responseObject = rpcResponse as any; // Use 'as any' for simplicity or define a more specific type if known

        if (typeof responseObject.room_id === 'string' && responseObject.room_id.trim() !== '') {
          return responseObject.room_id;
        }
        if (typeof responseObject.id === 'string' && responseObject.id.trim() !== '') { // Common alternative key
          return responseObject.id;
        }
        // If object doesn't have expected keys, or values are invalid, it will fall through.
      }
      
      // If rpcResponse is already a string (the ID itself), a primitive, or an object that didn't match above conditions,
      // return it. The check in FriendsList.tsx will validate if it's a usable string ID.
      return rpcResponse; // This could still be null or an unhandled object type if the RPC returns that.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
  });
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      roomId, 
      content, 
      messageType = 'text',
      songId 
    }: { 
      roomId: string; 
      content?: string; 
      messageType?: 'text' | 'song' | 'system';
      songId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          content,
          message_type: messageType,
          song_id: songId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });
};
