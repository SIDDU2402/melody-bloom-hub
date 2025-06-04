
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthButton = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-white">
          <User className="h-4 w-4" />
          <span className="text-sm">{user.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => navigate('/auth')}
      className="gradient-primary hover:opacity-90 transition-opacity"
    >
      Sign In
    </Button>
  );
};

export default AuthButton;
