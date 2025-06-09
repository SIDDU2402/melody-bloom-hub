
import React, { useState } from 'react';
import { Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import FriendsList from '@/components/FriendsList';
import FriendRequests from '@/components/FriendRequests';
import { useFriendRequests } from '@/hooks/useFriends';

const Friends = () => {
  const { data: requests = [] } = useFriendRequests();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="friends" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Friends</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Requests</span>
              {requests.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-red-500 text-white">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <FriendsList />
          </TabsContent>

          <TabsContent value="requests">
            <div className="p-6">
              <FriendRequests />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Friends;
