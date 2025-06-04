
import React, { useState } from 'react';
import { Search, Music, User, Upload, Heart, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UploadModal from './UploadModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation */}
      <nav className="glass border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <Music className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-gradient">StreamFlow</span>
            </div>
            
            <div className="hidden md:flex space-x-6">
              <Button variant="ghost" className="text-white hover:text-purple-400 transition-colors">
                Discover
              </Button>
              <Button variant="ghost" className="text-white hover:text-purple-400 transition-colors">
                Library
              </Button>
              <Button variant="ghost" className="text-white hover:text-purple-400 transition-colors">
                Playlists
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search music, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            
            <Button 
              size="sm" 
              className="gradient-primary hover:opacity-90 transition-opacity"
              onClick={handleUploadClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-purple-400"
              onClick={() => user ? navigate('/') : navigate('/auth')}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 h-screen bg-black/20 glass border-r border-white/10 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Your Library</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                  <Music className="h-4 w-4 mr-3" />
                  Recently Played
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                  <Heart className="h-4 w-4 mr-3" />
                  Liked Songs
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                  <List className="h-4 w-4 mr-3" />
                  My Playlists
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Quick Access</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg glass hover:bg-white/10 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-white">Chill Vibes</p>
                  <p className="text-xs text-gray-400">24 songs</p>
                </div>
                <div className="p-3 rounded-lg glass hover:bg-white/10 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-white">Workout Mix</p>
                  <p className="text-xs text-gray-400">18 songs</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default Layout;
