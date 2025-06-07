
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfiles';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentlyPlayed } from '@/hooks/useSongs';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit3, Music, Heart, Clock, List, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import MusicCard from '@/components/MusicCard';

const Profile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: playlists } = usePlaylists();
  const { data: favorites } = useFavorites();
  const { data: recentlyPlayed } = useRecentlyPlayed();
  const updateProfile = useUpdateProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
    bio: '',
  });

  React.useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(editForm);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="glass p-8">
          <div className="flex items-start space-x-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    placeholder="Username"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Textarea
                    placeholder="Bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveProfile} className="gradient-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      {profile?.full_name || 'Anonymous User'}
                    </h1>
                    <p className="text-gray-400 text-lg">
                      @{profile?.username || 'no-username'}
                    </p>
                  </div>
                  
                  {profile?.bio && (
                    <p className="text-gray-300">{profile.bio}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span>{playlists?.length || 0} playlists</span>
                    <span>{favorites?.length || 0} liked songs</span>
                  </div>
                  
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="playlists" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="playlists" className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              Playlists
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Liked Songs
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Recently Played
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="playlists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
              <Button className="gradient-primary">
                <Music className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
            </div>
            
            {playlists?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist) => (
                  <Card key={playlist.id} className="glass p-6 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-4 flex items-center justify-center">
                      <Music className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{playlist.name}</h3>
                    <p className="text-gray-400 text-sm">{playlist.description || 'No description'}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass p-12 text-center">
                <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
                <p className="text-gray-400">Create your first playlist to get started</p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="favorites">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Liked Songs</h2>
              {/* Add favorite songs list here */}
              <Card className="glass p-12 text-center">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No liked songs</h3>
                <p className="text-gray-400">Start liking songs to see them here</p>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Recently Played</h2>
              {recentlyPlayed && recentlyPlayed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recentlyPlayed.map((song) => (
                    <MusicCard key={song.id} song={song} />
                  ))}
                </div>
              ) : (
                <Card className="glass p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No recent activity</h3>
                  <p className="text-gray-400">Start listening to see your history</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
