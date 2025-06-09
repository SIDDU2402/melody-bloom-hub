
import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFriendRequests, useRespondToFriendRequest } from '@/hooks/useFriends';
import { Loader2 } from 'lucide-react';

const FriendRequests = () => {
  const { data: requests = [], isLoading, error } = useFriendRequests();
  const respondToRequest = useRespondToFriendRequest();

  const handleAccept = (requestId: string) => {
    respondToRequest.mutate({ requestId, status: 'accepted' });
  };

  const handleDecline = (requestId: string) => {
    respondToRequest.mutate({ requestId, status: 'declined' });
  };

  // Log the requests data for debugging
  console.log('FriendRequests component - requests:', requests);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading friend requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 border border-red-300 rounded-md bg-red-50">
        <p className="font-semibold">Error loading friend requests</p>
        <p>{error.message || 'An unknown error occurred'}</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>You don't have any friend requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
      
      {requests.map((request) => {
        // Check if requester data exists
        if (!request.requester) {
          console.warn('Missing requester data for request:', request);
          return null;
        }
        
        const { requester } = request;
        
        return (
          <Card key={request.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={requester.avatar_url || ''} alt={requester.full_name || 'User'} />
                    <AvatarFallback>{requester.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{requester.full_name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">
                      Sent {format(new Date(request.created_at), 'PPP')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecline(request.id)}
                    disabled={respondToRequest.isPending}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(request.id)}
                    disabled={respondToRequest.isPending}
                  >
                    {respondToRequest.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Accept'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FriendRequests;
