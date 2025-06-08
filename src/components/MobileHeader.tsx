
import React, { useState } from 'react';
import { Music, Menu, X, Upload, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfiles';

interface MobileHeaderProps {
  onUploadClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onUploadClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-b border-white/10 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2" onClick={() => navigate('/')}>
            <Music className="h-7 w-7 text-purple-400" />
            <span className="text-xl font-bold text-gradient">BeatSync</span>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-gray-900/95 backdrop-blur-xl border-white/10">
                  <div className="flex flex-col h-full pt-6">
                    <div className="flex items-center space-x-3 mb-8">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {profile?.full_name || 'Music Lover'}
                        </h3>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1">
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-white/10 h-12"
                            onClick={() => {
                              onUploadClick();
                              setIsMenuOpen(false);
                            }}
                          >
                            <Upload className="h-5 w-5 mr-3" />
                            Upload Music
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-white/10 h-12"
                            onClick={() => {
                              navigate('/admin');
                              setIsMenuOpen(false);
                            }}
                          >
                            <Shield className="h-5 w-5 mr-3" />
                            Admin Dashboard
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <Button
                        variant="ghost"
                        className="w-full text-red-400 hover:bg-red-400/10 h-12"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button 
                onClick={() => navigate('/auth')} 
                className="gradient-primary hover:opacity-90 transition-opacity text-sm px-4 py-2"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
