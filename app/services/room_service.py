from sqlalchemy.orm import Session
from app import models
from typing import Optional
import uuid

class RoomService:
    """Service layer for room operations"""
    
    @staticmethod
    def create_room(db: Session, language: str = "python") -> models.Room:
        """Create a new collaboration room"""
        room_id = f"room_{uuid.uuid4().hex[:12]}"
        
        room = models.Room(
            room_id=room_id,
            language=language,
            code=f"# Welcome to CodeSync Pro\n# Language: {language}\n# Start coding together!\n\n"
        )
        
        db.add(room)
        db.commit()
        db.refresh(room)
        
        return room
    
    @staticmethod
    def get_room(db: Session, room_id: str) -> Optional[models.Room]:
        """Get room by ID"""
        return db.query(models.Room).filter(
            models.Room.room_id == room_id,
            models.Room.is_active == True
        ).first()
    
    @staticmethod
    def update_room_code(db: Session, room_id: str, code: str) -> bool:
        """Update room code"""
        room = RoomService.get_room(db, room_id)
        if room:
            room.code = code
            db.commit()
            return True
        return False
    
    @staticmethod
    def delete_room(db: Session, room_id: str) -> bool:
        """Soft delete a room"""
        room = RoomService.get_room(db, room_id)
        if room:
            room.is_active = False
            db.commit()
            return True
        return False