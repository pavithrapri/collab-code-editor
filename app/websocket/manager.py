from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
from sqlalchemy.orm import Session
from app import models
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Store active connections per room: {room_id: [websocket1, websocket2, ...]}
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, room_id: str):
        """Connect a client to a room"""
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        
        self.active_connections[room_id].append(websocket)
        
        # Notify others in the room
        await self.broadcast(
            room_id,
            {"type": "user_joined", "room_id": room_id, "user_count": len(self.active_connections[room_id])},
            exclude=websocket
        )
        
        logger.info(f"Client connected to room {room_id}. Total: {len(self.active_connections[room_id])}")
    
    async def disconnect(self, websocket: WebSocket, room_id: str):
        """Disconnect a client from a room"""
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            
            # Clean up empty rooms
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
            else:
                # Notify others
                await self.broadcast(
                    room_id,
                    {"type": "user_left", "room_id": room_id, "user_count": len(self.active_connections[room_id])}
                )
        
        logger.info(f"Client disconnected from room {room_id}")
    
    async def broadcast(self, room_id: str, message: dict, exclude: WebSocket = None):
        """Send message to all connections in a room"""
        if room_id not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[room_id]:
            if connection == exclude:
                continue
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            await self.disconnect(conn, room_id)
    
    async def disconnect_all(self):
        """Disconnect all clients"""
        for room_id in list(self.active_connections.keys()):
            for connection in self.active_connections[room_id]:
                try:
                    await connection.close()
                except:
                    pass
        self.active_connections.clear()

# Create a single instance
manager = ConnectionManager()