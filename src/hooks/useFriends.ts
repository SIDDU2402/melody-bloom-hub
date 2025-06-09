
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

      console.log('Fetching accepted friend records for user:', user.id);
      // Step 1: Get all accepted friend records involving the user
      const { data: friendRecords, error: recordsError } = await supabase
        .from('friends')
        .select('*') // Select all columns from 'friends' table
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (recordsError) {
        console.error('Error fetching friend records:', recordsError);
        throw recordsError;
      }

      if (!friendRecords || friendRecords.length === 0) {
        console.log('No accepted friend records found.');
        return [];
      }

      console.log('Accepted friend records:', friendRecords);

      // Step 2: Extract all unique profile IDs from these records
      const profileIds = new Set<string>();
      friendRecords.forEach(record => {
        profileIds.add(record.requester_id);
        profileIds.add(record.addressee_id);
      });

      if (profileIds.size === 0) {
        // Should not happen if friendRecords is not empty, but as a safeguard
        return [];
      }

      console.log('Fetching profiles for IDs:', Array.from(profileIds));
      // Step 3: Fetch all relevant profiles in one go
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, username') // Added username for completeness
        .in('id', Array.from(profileIds));

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Fetched profiles:', profiles);

      // Step 4: Map profiles to a dictionary for easy lookup
      const profilesMap = new Map(
        profiles ? profiles.map(p => [p.id, p]) : []
      );

      // Step 5: Combine friend records with their respective requester and addressee profiles
      const enrichedFriends = friendRecords.map(record => {
        return {
          ...record,
          requester: profilesMap.get(record.requester_id) || null, // Fallback to null if profile not found
          addressee: profilesMap.get(record.addressee_id) || null, // Fallback to null if profile not found
        };
      });

      console.log('Enriched friends data:', enrichedFriends);
      return enrichedFriends;
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
      
      // First try with a simple query without joins
      try {
        // Step 1: Get all pending friend requests where user is the addressee
        const { data: friendRequests, error: requestsError } = await supabase
          .from('friends')
          .select('*')
          .eq('addressee_id', user.id)
          .eq('status', 'pending');
        
        if (requestsError) {
          console.error('Error fetching friend requests:', requestsError);
          throw requestsError;
        }
        
        console.log('Raw friend requests data:', friendRequests);
        
        if (!friendRequests || friendRequests.length === 0) {
          console.log('No friend requests found');
          return [];
        }
        
        // Step 2: Get requester profiles for each friend request
        const requesterIds = friendRequests.map(request => request.requester_id);
        console.log('Requester IDs:', requesterIds);
        
        const { data: requesterProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', requesterIds);
        
        if (profilesError) {
          console.error('Error fetching requester profiles:', profilesError);
          throw profilesError;
        }
        
        console.log('Requester profiles:', requesterProfiles);
        
        // Step 3: Combine friend requests with requester profiles
        const enrichedRequests = friendRequests.map(request => {
          const requesterProfile = requesterProfiles.find(profile => profile.id === request.requester_id);
          return {
            ...request,
            requester: requesterProfile
          };
        });
        
        console.log('Enriched friend requests:', enrichedRequests);
        return enrichedRequests || [];
      } catch (error) {
        console.error('Error in friend requests query:', error);
        throw error;
      }
    },
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    staleTime: 0, // Consider data stale immediately
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
      
      // Validate input
      if (!addresseeId) {
        console.error('Invalid addressee ID');
        throw new Error('Invalid addressee ID');
      }
      
      // Log the current user and addressee IDs for debugging
      console.log('Current user ID:', user.id);
      console.log('Addressee ID:', addresseeId);
      
      // Check if a friend relationship already exists in either direction
      console.log('Checking for existing relationships...');
      
      // First check if user is requester and addressee is addressee
      const { data: existingRelation1, error: checkError1 } = await supabase
        .from('friends')
        .select('id, status')
        .eq('requester_id', user.id)
        .eq('addressee_id', addresseeId)
        .maybeSingle();
      
      if (checkError1) {
        console.error('Error checking existing relation (1):', checkError1);
        throw checkError1;
      }
      
      console.log('Existing relation check 1 result:', existingRelation1);
      
      // Then check if addressee is requester and user is addressee
      if (!existingRelation1) {
        const { data: existingRelation2, error: checkError2 } = await supabase
          .from('friends')
          .select('id, status')
          .eq('requester_id', addresseeId)
          .eq('addressee_id', user.id)
          .maybeSingle();
        
        if (checkError2) {
          console.error('Error checking existing relation (2):', checkError2);
          throw checkError2;
        }
        
        console.log('Existing relation check 2 result:', existingRelation2);
        
        if (existingRelation2) {
          console.log('Friend relationship already exists with status:', existingRelation2.status);
          throw new Error(`Friend relationship already exists with status: ${existingRelation2.status}`);
        }
      } else {
        console.log('Friend relationship already exists with status:', existingRelation1.status);
        throw new Error(`Friend relationship already exists with status: ${existingRelation1.status}`);
      }
      
      // If no existing relationship, create a new friend request
      console.log('No existing relationship found, creating new friend request...');
      
      const newFriendRequest = {
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending'
      };
      
      console.log('Inserting new friend request:', newFriendRequest);
      
      const { data, error } = await supabase
        .from('friends')
        .insert(newFriendRequest)
        .select()
        .single();
      
      if (error) {
        console.error('Error sending friend request:', error);
        throw error;
      }
      
      console.log('Friend request sent successfully:', data);
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

// Add this function to check the database schema
export const useCheckDatabaseSchema = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['check-database-schema'],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('Checking database schema...');
      
      // Check if the friends table exists and has the correct structure
      const { data: friendsTableInfo, error: friendsTableError } = await supabase
        .from('friends')
        .select('*')
        .limit(1);
      
      if (friendsTableError) {
        console.error('Error checking friends table:', friendsTableError);
        throw friendsTableError;
      }
      
      console.log('Friends table exists with structure:', friendsTableInfo);
      
      // Check if the profiles table exists and has the correct structure
      const { data: profilesTableInfo, error: profilesTableError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesTableError) {
        console.error('Error checking profiles table:', profilesTableError);
        throw profilesTableError;
      }
      
      console.log('Profiles table exists with structure:', profilesTableInfo);
      
      // Check if the foreign key relationship works
      const { data: relationshipCheck, error: relationshipError } = await supabase
        .from('friends')
        .select(`
          id,
          requester:profiles(id, full_name)
        `)
        .limit(1);
      
      if (relationshipError) {
        console.error('Error checking relationship:', relationshipError);
        throw relationshipError;
      }
      
      console.log('Relationship check result:', relationshipCheck);
      
      return {
        friendsTableInfo,
        profilesTableInfo,
        relationshipCheck
      };
    },
    enabled: !!user,
  });
};
