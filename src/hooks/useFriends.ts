
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Friend {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
}

export const useFriends = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching friends for user:', user.id);
      
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          requester:profiles!friends_requester_id_fkey(id, full_name, avatar_url),
          addressee:profiles!friends_addressee_id_fkey(id, full_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');
      
      if (error) {
        console.error('Error fetching friends:', error);
        throw error;
      }
      
      console.log('Friends data:', data);
      return data || [];
    },
    enabled: !!user,
  });
};

export const useFriendRequests = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching friend requests for user:', user.id);
      
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          requester:profiles!friends_requester_id_fkey(id, full_name, avatar_url)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');
      
      if (error) {
        console.error('Error fetching friend requests:', error);
        throw error;
      }
      
      console.log('Friend requests data:', data);
      return data || [];
    },
    enabled: !!user,
  });
};

export const useSearchUsers = () => {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (searchTerm: string) => {
      if (!user || !searchTerm.trim()) return [];
      
      console.log('Searching users with term:', searchTerm);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, username')
        .neq('id', user.id)
        .or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) {
        console.error('Error searching users:', error);
        throw error;
      }
      
      console.log('Search results:', data);
      return data || [];
    },
  });
};

export const useSendFriendRequest = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (addresseeId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      console.log('Sending friend request from', user.id, 'to', addresseeId);
      
      // Check if a friend relationship already exists
      const { data: existingRelation, error: checkError } = await supabase
        .from('friends')
        .select('id, status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing relation:', checkError);
        throw checkError;
      }
      
      if (existingRelation) {
        throw new Error(`Friend relationship already exists with status: ${existingRelation.status}`);
      }
      
      const { data, error } = await supabase
        .from('friends')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error sending friend request:', error);
        throw error;
      }
      
      console.log('Friend request sent:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Friend request error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send friend request",
        variant: "destructive",
      });
    },
  });
};

export const useRespondToFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'accepted' | 'declined' }) => {
      console.log('Responding to friend request:', requestId, 'with status:', status);
      
      const { data, error } = await supabase
        .from('friends')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) {
        console.error('Error responding to friend request:', error);
        throw error;
      }
      
      console.log('Friend request response:', data);
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      toast({
        title: status === 'accepted' ? "Friend request accepted!" : "Friend request declined",
        description: status === 'accepted' ? "You are now friends!" : "Friend request has been declined.",
      });
    },
    onError: (error: any) => {
      console.error('Error responding to friend request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to respond to friend request",
        variant: "destructive",
      });
    },
  });
};
