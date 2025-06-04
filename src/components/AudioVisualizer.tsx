
import React from 'react';

const AudioVisualizer: React.FC = () => {
  const bars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="flex items-end justify-center space-x-1 h-16">
      {bars.map((bar) => (
        <div
          key={bar}
          className="w-1 bg-gradient-to-t from-purple-600 to-pink-400 rounded-full animate-pulse"
          style={{
            height: `${Math.random() * 60 + 10}%`,
            animationDelay: `${bar * 0.1}s`,
            animationDuration: '1.5s',
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
