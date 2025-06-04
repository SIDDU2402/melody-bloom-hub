
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Song } from '@/hooks/useSongs';

interface MusicPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  seekTo: (progress: number) => void;
  nextSong: () => void;
  previousSong: () => void;
  playlist: Song[];
  setPlaylist: (songs: Song[]) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(75);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        setProgress(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        nextSong();
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playSong = (song: Song) => {
    if (audioRef.current) {
      audioRef.current.src = song.file_url;
      audioRef.current.load();
      setCurrentSong(song);
      setIsPlaying(true);
      audioRef.current.play();
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const seekTo = (newProgress: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newProgress;
      setProgress(newProgress);
    }
  };

  const nextSong = () => {
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIndex]);
  };

  const previousSong = () => {
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    playSong(playlist[prevIndex]);
  };

  const value = {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    playSong,
    togglePlayPause,
    setVolume,
    seekTo,
    nextSong,
    previousSong,
    playlist,
    setPlaylist,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
