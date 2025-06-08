
import React from 'react';
import { Home, Search, Heart, User, Music } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MobileNavigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/', requiresAuth: false },
    { icon: Search, label: 'Search', path: '/search', requiresAuth: false },
    { icon: Heart, label: 'Favorites', path: '/favorites', requiresAuth: true },
    { icon: Music, label: 'Playlists', path: '/playlists', requiresAuth: true },
    { icon: User, label: 'Profile', path: '/profile', requiresAuth: true },
  ];

  const handleNavigation = (path: string, requiresAuth: boolean) => {
    if (requiresAuth && !user) {
      navigate('/auth');
      return;
    }
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center space-y-1 p-2 h-auto transition-all duration-300 ${
                  isActive 
                    ? 'text-purple-400 bg-purple-400/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => handleNavigation(item.path, item.requiresAuth)}
              >
                <item.icon className={`h-5 w-5 transition-all duration-300 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
