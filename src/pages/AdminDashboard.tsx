
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import Layout from '@/components/Layout';
import AdminSongManager from '@/components/AdminSongManager';
import { Shield, Music, Upload, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="glass p-8 text-center max-w-md">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-300 mb-6">
              You don't have admin privileges to access this page.
            </p>
            <Button onClick={() => navigate('/')} className="gradient-primary">
              Go Home
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-300 text-xl">Manage songs and platform content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass p-6 text-center">
            <Music className="h-10 w-10 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Songs</h3>
            <p className="text-gray-400">Manage music library</p>
          </Card>
          <Card className="glass p-6 text-center">
            <Upload className="h-10 w-10 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Uploads</h3>
            <p className="text-gray-400">Upload new tracks</p>
          </Card>
          <Card className="glass p-6 text-center">
            <Users className="h-10 w-10 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Users</h3>
            <p className="text-gray-400">Platform statistics</p>
          </Card>
        </div>

        {/* Song Management */}
        <AdminSongManager />
      </div>
    </Layout>
  );
};

export default AdminDashboard;
