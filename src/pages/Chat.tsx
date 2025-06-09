
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Layout from '@/components/Layout';
import ChatRoom from '@/components/ChatRoom';
import { useChatRooms } from '@/hooks/useChat';

const Chat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { data: chatRooms = [] } = useChatRooms();

  if (!roomId) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button onClick={() => navigate('/friends')} variant="ghost" className="text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Friends
            </Button>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
          </div>

          {chatRooms.length === 0 ? (
            <Card className="glass p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No conversations yet</h3>
              <p className="text-gray-400 mb-4">Start chatting with your friends!</p>
              <Button onClick={() => navigate('/friends')} className="gradient-primary">
                Go to Friends
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {chatRooms.map((room: any) => (
                <Card 
                  key={room.id} 
                  className="glass p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => navigate(`/chat/${room.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      {room.participants.slice(0, 2).map((participant: any) => (
                        <div 
                          key={participant.id}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium border-2 border-gray-800"
                        >
                          {participant.full_name?.charAt(0) || 'U'}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {room.name || room.participants.map((p: any) => p.full_name || 'Unknown').join(', ')}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {room.participants.length} participant{room.participants.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  const currentRoom = chatRooms.find((room: any) => room.id === roomId);

  if (!currentRoom) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h2 className="text-xl text-white">Chat room not found</h2>
          <Button onClick={() => navigate('/chat')} className="mt-4">
            Back to Messages
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-12rem)] max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-4 p-4">
          <Button onClick={() => navigate('/chat')} variant="ghost" className="text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <Card className="glass h-full">
          <ChatRoom 
            roomId={roomId}
            roomName={currentRoom.name}
            participants={currentRoom.participants}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default Chat;
