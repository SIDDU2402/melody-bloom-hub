
import React, { useState, useRef, useEffect } from 'react';
import { Send, Music, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessages, useSendMessage } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useSongs } from '@/hooks/useSongs';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatRoomProps {
  roomId: string;
  roomName?: string;
  participants: Array<{
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  }>;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, roomName, participants }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showSongPicker, setShowSongPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { data: messages = [] } = useMessages(roomId);
  const sendMessage = useSendMessage();
  const { data: songs = [] } = useSongs();
  const { playSong, setPlaylist } = useMusicPlayer();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    sendMessage.mutate({
      roomId,
      content: newMessage,
      messageType: 'text'
    });
    
    setNewMessage('');
  };

  const handleSendSong = (songId: string) => {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    sendMessage.mutate({
      roomId,
      content: `Shared: ${song.title} by ${song.artist}`,
      messageType: 'song',
      songId
    });

    setShowSongPicker(false);
    toast({
      title: "Song shared! 🎵",
      description: `You shared "${song.title}" with your friend`,
    });
  };

  const handlePlaySharedSong = (song: any) => {
    if (song) {
      setPlaylist(songs);
      playSong(song);
      toast({
        title: "Now Playing 🎵",
        description: `${song.title} by ${song.artist}`,
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const otherParticipants = participants.filter(p => p.id !== user?.id);
  const displayName = roomName || otherParticipants.map(p => p.full_name || 'Unknown').join(', ');

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="glass border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {otherParticipants.length === 1 ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipants[0].avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {otherParticipants[0].full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex -space-x-2">
                {otherParticipants.slice(0, 2).map((participant) => (
                  <Avatar key={participant.id} className="h-8 w-8 border-2 border-gray-800">
                    <AvatarImage src={participant.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                      {participant.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-white">{displayName}</h2>
              <p className="text-sm text-gray-400">
                {participants.length} participant{participants.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass border border-white/20">
              <DropdownMenuItem 
                onClick={() => setShowSongPicker(!showSongPicker)}
                className="text-white hover:bg-white/10"
              >
                <Music className="h-4 w-4 mr-2" />
                Share Song
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Song Picker */}
      {showSongPicker && (
        <Card className="glass m-4 p-4">
          <h3 className="font-medium text-white mb-3">Share a Song</h3>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {songs.slice(0, 10).map((song) => (
              <div key={song.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Music className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{song.title}</p>
                    <p className="text-xs text-gray-400">{song.artist}</p>
                  </div>
                </div>
                <Button onClick={() => handleSendSong(song.id)} size="sm" className="gradient-primary">
                  Share
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: any) => {
          const isOwnMessage = message.sender_id === user?.id;
          
          return (
            <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex space-x-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwnMessage && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.sender.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                      {message.sender.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`glass rounded-2xl p-3 ${isOwnMessage ? 'bg-purple-600/20' : ''}`}>
                  {!isOwnMessage && (
                    <p className="text-xs text-gray-400 mb-1">{message.sender.full_name}</p>
                  )}
                  
                  {message.message_type === 'song' && message.song ? (
                    <div className="border border-white/10 rounded-lg p-3 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Music className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{message.song.title}</p>
                            <p className="text-sm text-gray-400">{message.song.artist}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handlePlaySharedSong(message.song)}
                          size="sm" 
                          className="gradient-primary"
                        >
                          Play
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white">{message.content}</p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">{formatTime(message.created_at)}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="glass border-t border-white/10 p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="bg-white/5 border-white/10 text-white flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sendMessage.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
