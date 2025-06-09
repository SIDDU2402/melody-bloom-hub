
import React from 'react';
import { Check, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFriendRequests, useRespondToFriendRequest } from '@/hooks/useFriends';

const FriendRequests = () => {
  const { data: requests = [] } = useFriendRequests();
  const respondToRequest = useRespondToFriendRequest();

  const handleAccept = (requestId: string) => {
    respondToRequest.mutate({ requestId, status: 'accepted' });
  };

  const handleDecline = (requestId: string) => {
    respondToRequest.mutate({ requestId, status: 'declined' });
  };

  if (requests.length === 0) {
    return (
      <Card className="glass p-8 text-center">
        <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No friend requests</h3>
        <p className="text-gray-400">You're all caught up!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Friend Requests ({requests.length})</h2>
      
      {requests.map((request: any) => (
        <Card key={request.id} className="glass p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={request.requester.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {request.requester.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-white">
                  {request.requester.full_name || 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-400">
                  Sent {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAccept(request.id)}
                disabled={respondToRequest.isPending}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleDecline(request.id)}
                disabled={respondToRequest.isPending}
                size="sm"
                variant="destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FriendRequests;
