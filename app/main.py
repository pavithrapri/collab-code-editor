from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager  # ADD THIS IMPORT
from app.routers import rooms, autocomplete, websocket
from app.websocket.manager import manager
from app.database import engine, Base
import uvicorn
from logging_config import setup_logging

setup_logging()

# ADD THIS LIFESPAN MANAGER
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - runs when app starts
    Base.metadata.create_all(bind=engine)
    print(" Server started successfully!")
    print(" WebSocket available at: ws://localhost:8000/ws/{room_id}")
    print(" API docs at: http://localhost:8000/docs")
    yield
    # Shutdown - runs when app stops
    await manager.disconnect_all()
    print(" Server shutdown complete")

# UPDATE THE FastAPI CONSTRUCTOR TO INCLUDE LIFESPAN
app = FastAPI(
    title="CodeSync Pro API",
    description="Real-time collaborative code editor",
    version="1.0.0",
    lifespan=lifespan  # ADD THIS LINE
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rooms.router, prefix="/api", tags=["rooms"])
app.include_router(autocomplete.router, prefix="/api", tags=["autocomplete"])
app.include_router(websocket.router, tags=["websocket"])

@app.get("/")
async def root():
    return {
        "message": "CodeSync Pro API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "rooms": "/api/rooms",
            "autocomplete": "/api/autocomplete",
            "websocket": "/ws/{room_id}"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}



if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)