import React, { useState, useEffect } from 'react';
import { Terminal, Sparkles } from 'lucide-react';
import { createRoom, testBackendConnection } from '../services/api';

interface RoomLobbyProps {
  onJoinRoom: (roomId: string) => void;
}

const RoomLobby: React.FC<RoomLobbyProps> = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // CORRECT: useEffect INSIDE the component function
  useEffect(() => {
    console.log('RoomLobby mounted');
    testBackendConnection().then(isAlive => {
      console.log('Backend alive on mount:', isAlive);
    });
  }, []);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      console.log('Creating room with language: python');
      
      const response = await createRoom('python');
      console.log('Room created:', response);
      
      if (response && response.room_id) {
        onJoinRoom(response.room_id);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Failed to create room:', error);
      
      // Show error to user
      alert(`Failed to create room: ${error.message || 'Unknown error'}`);
      
      // Fallback to mock room for testing
      const mockRoomId = 'room_' + Math.random().toString(36).substr(2, 9);
      console.log('Using mock room ID:', mockRoomId);
      onJoinRoom(mockRoomId);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
              <Terminal className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Start Collaborating</h2>
            <p className="text-gray-400">Create a new room or join an existing one</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              {isCreating ? 'Creating Room...' : 'Create New Room'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/50 text-gray-400">or</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <button
                onClick={handleJoinRoom}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all"
              >
                Join
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Features
            </h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Real-time code synchronization</li>
              <li>• AI-powered autocomplete suggestions</li>
              <li>• Multi-user collaboration</li>
              <li>• Syntax highlighting for Python</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;