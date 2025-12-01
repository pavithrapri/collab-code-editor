import React from 'react';
import { Users, Sparkles } from 'lucide-react';

interface SidebarProps {
  roomId: string;
  isConnected: boolean;
  connectedUsers: number;
}

const Sidebar: React.FC<SidebarProps> = ({ roomId, isConnected, connectedUsers }) => {
  return (
    <div className="space-y-4">
      {/* Room Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          Room Details
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Room ID:</span>
            <code className="text-purple-400 font-mono text-xs">{roomId}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Users:</span>
            <span className="text-purple-400">{connectedUsers} active</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
        <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>Run Code:</span>
            <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Ctrl+Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span>Accept Suggestion:</span>
            <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Tab</kbd>
          </div>
          <div className="flex justify-between">
            <span>Format Code:</span>
            <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Ctrl+Shift+F</kbd>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          Pro Tips
        </h3>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• AI suggests code as you type</li>
          <li>• All changes sync in real-time</li>
          <li>• Share the room link to collaborate</li>
          <li>• Supports multiple languages</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;