from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.services.room_service import RoomService
import uuid

router = APIRouter()

@router.post("/rooms", response_model=schemas.RoomResponse)
async def create_room(
    room_data: schemas.RoomCreate,
    db: Session = Depends(get_db)
):
    """Create a new collaboration room"""
    room_id = f"room_{uuid.uuid4().hex[:12]}"
    
    room = models.Room(
        room_id=room_id,
        language=room_data.language,
        code=f"# Welcome to CodeSync Pro\n# Language: {room_data.language}\n\n"
    )
    
    db.add(room)
    db.commit()
    db.refresh(room)
    
    return room

@router.get("/rooms/{room_id}", response_model=schemas.RoomResponse)
async def get_room(room_id: str, db: Session = Depends(get_db)):
    """Get room details"""
    room = db.query(models.Room).filter(
        models.Room.room_id == room_id,
        models.Room.is_active == True
    ).first()
    
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return room

@router.put("/rooms/{room_id}/code")
async def update_code(
    room_id: str,
    code_update: schemas.CodeUpdate,
    db: Session = Depends(get_db)
):
    """Update room code"""
    room = db.query(models.Room).filter(
        models.Room.room_id == room_id
    ).first()
    
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room.code = code_update.code
    db.commit()
    
    return {"status": "success", "message": "Code updated"}