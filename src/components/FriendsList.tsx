
import React, { useState } from 'react';
import { Search, UserPlus, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFriends, useSearchUsers, useSendFriendRequest } from '@/hooks/useFriends';
import { useCreateOrGetDMRoom } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const FriendsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  
  const { data: friends = [] } = useFriends();
  const searchUsers = useSearchUsers();
  const sendFriendRequest = useSendFriendRequest();
  const createDMRoom = useCreateOrGetDMRoom();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchUsers.mutate(searchTerm);
    }
  };

  const handleSendFriendRequest = (userId: string) => {
    sendFriendRequest.mutate(userId);
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const roomId = await createDMRoom.mutateAsync(friendId);
      navigate(`/chat/${roomId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Friends</h1>
        <Button 
          onClick={() => setShowSearch(!showSearch)}
          className="gradient-primary"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </div>

      {showSearch && (
        <Card className="glass p-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-white/5 border-white/10 text-white"
            />
            <Button onClick={handleSearch} disabled={searchUsers.isPending}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {searchUsers.data && searchUsers.data.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Search Results</h3>
              {searchUsers.data.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{user.full_name || 'Unknown User'}</p>
                      {user.username && (
                        <p className="text-sm text-gray-400">@{user.username}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSendFriendRequest(user.id)}
                    disabled={sendFriendRequest.isPending}
                    size="sm"
                    className="gradient-secondary"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Your Friends ({friends.length})</h2>
        </div>
        
        {friends.length === 0 ? (
          <Card className="glass p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No friends yet</h3>
            <p className="text-gray-400 mb-4">Start by searching and adding some friends!</p>
            <Button onClick={() => setShowSearch(true)} className="gradient-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Find Friends
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {friends.map((friendship: any) => {
              const friend = friendship.requester_id === friendship.requester.id 
                ? friendship.addressee 
                : friendship.requester;
              
              return (
                <Card key={friendship.id} className="glass p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={friend.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {friend.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-white">{friend.full_name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-400">
                          Friends since {new Date(friendship.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartChat(friend.id)}
                      className="gradient-primary"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
