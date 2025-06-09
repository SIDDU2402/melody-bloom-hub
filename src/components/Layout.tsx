
import React, { useState } from 'react';
import { Music, User, Upload, Heart, List, Shield, Settings, LogOut, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import UploadModal from './UploadModal';
import SearchBar from './SearchBar';
import MobileHeader from './MobileHeader';
import MobileNavigation from './MobileNavigation';
import { useProfile } from '@/hooks/useProfiles';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleUploadClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      alert('Only administrators can upload music.');
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      <MobileHeader onUploadClick={handleUploadClick} />

      {/* Desktop Navigation */}
      {!isMobile && (
        <nav className="glass border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <Music className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-gradient">BeatSync</span>
              </div>
              
              <div className="hidden md:flex space-x-6">
                <Button variant="ghost" className="text-white hover:text-purple-400 transition-colors" onClick={() => navigate('/')}>
                  Discover
                </Button>
                <Button variant="ghost" className="text-white hover:text-purple-400 transition-colors">
                  Browse
                </Button>
                <Button variant="ghost" className="text-white hover:text-purple-400 transition-colors">
                  Radio
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <SearchBar />
              
              {user ? (
                <>
                  {isAdmin && (
                    <>
                      <Button 
                        size="sm" 
                        className="gradient-primary hover:opacity-90 transition-opacity"
                        onClick={handleUploadClick}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10 transition-colors"
                        onClick={() => navigate('/admin')}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass border border-white/20">
                      <DropdownMenuItem onClick={() => navigate('/profile')} className="text-white hover:bg-white/10">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/friends')} className="text-white hover:bg-white/10">
                        <Users className="h-4 w-4 mr-2" />
                        Friends
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/chat')} className="text-white hover:bg-white/10">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:bg-red-400/10">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={() => navigate('/auth')} className="gradient-primary hover:opacity-90 transition-opacity">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-64 h-screen bg-black/20 glass border-r border-white/10 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Your Library</h3>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                    <Music className="h-4 w-4 mr-3" />
                    Recently Played
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                    onClick={() => user ? navigate('/favorites') : navigate('/auth')}
                  >
                    <Heart className="h-4 w-4 mr-3" />
                    Liked Songs
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                    onClick={() => user ? navigate('/playlists') : navigate('/auth')}
                  >
                    <List className="h-4 w-4 mr-3" />
                    Your Playlists
                  </Button>
                </div>
              </div>

              {user && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Social</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                      onClick={() => navigate('/friends')}
                    >
                      <Users className="h-4 w-4 mr-3" />
                      Friends
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                      onClick={() => navigate('/chat')}
                    >
                      <MessageCircle className="h-4 w-4 mr-3" />
                      Messages
                    </Button>
                  </div>
                </div>
              )}

              {user && isAdmin && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Admin</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-purple-300 hover:text-white hover:bg-white/10"
                      onClick={() => navigate('/admin')}
                    >
                      <Shield className="h-4 w-4 mr-3" />
                      Dashboard
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Made For You</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg glass hover:bg-white/10 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-white">Discover Weekly</p>
                    <p className="text-xs text-gray-400">Your weekly mixtape</p>
                  </div>
                  <div className="p-3 rounded-lg glass hover:bg-white/10 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-white">Daily Mix 1</p>
                    <p className="text-xs text-gray-400">Your favorite tracks</p>
                  </div>
                  <div className="p-3 rounded-lg glass hover:bg-white/10 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-white">Release Radar</p>
                    <p className="text-xs text-gray-400">New music for you</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${isMobile ? 'pt-16 pb-20' : ''} p-6 pb-24`}>
          <div className={isMobile ? 'px-2' : ''}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {user && isAdmin && (
        <UploadModal 
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
