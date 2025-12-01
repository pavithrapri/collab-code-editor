import React, { useState } from 'react';
import RoomLobby from './components/RoomLobby';
import CodeEditor from './components/CodeEditor';

const App: React.FC = () => {
  const [currentRoom, setCurrentRoom] = useState<string>('');

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom('');
  };

  return (
    <div className="app">
      {!currentRoom ? (
        <RoomLobby onJoinRoom={handleJoinRoom} />
      ) : (
        <CodeEditor roomId={currentRoom} onLeaveRoom={handleLeaveRoom} />
      )}
    </div>
  );
};

export default App;