from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.websocket.manager import manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time collaboration"""
    await manager.connect(websocket, room_id)
    
    # Get current room state
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if room:
        await websocket.send_json({
            "type": "initial_state",
            "code": room.code,
            "language": room.language
        })
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            message_type = data.get("type")
            
            if message_type == "code_update":
                # Update database
                if room:
                    room.code = data.get("code", "")
                    db.commit()
                
                # Broadcast to others
                await manager.broadcast(room_id, data, exclude=websocket)
            
            elif message_type == "cursor_position":
                await manager.broadcast(room_id, data, exclude=websocket)

            elif message_type == "typing_indicator":
                await manager.broadcast(room_id, {
                    "type": "typing_indicator",
                    "isTyping": data.get("isTyping", False),
                    "userId": data.get("userId", "unknown")
                }, exclude=websocket)

            elif message_type == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": data.get("timestamp", 0)
                })
                
    except WebSocketDisconnect:
        await manager.disconnect(websocket, room_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(websocket, room_id)