# **Collaborative Code Editor**

## **Overview**

CodeSync Pro is a  collaborative code editor that allows multiple users to edit code simultaneously. Built with FastAPI (Python) backend and React/TypeScript frontend, it features real-time code synchronization, AI-powered autocomplete suggestions, and multi-user collaboration.

* Room Management: Create and join rooms with unique room IDs
* AI Autocomplete: Context-aware code suggestions (mocked implementation)
* Multi-language Support: Python, JavaScript, and TypeScript
* WebSocket Communication: bidirectional communication
* Responsive UI: Modern, dark-themed interface with Tailwind CSS

---

## **Technology Stack**

**Backend:** FastAPI, SQLAlchemy, WebSockets, PostgreSQL/SQLite
**Frontend:** React 18, TypeScript, Redux Toolkit, Tailwind CSS
**Real-time:** WebSockets with connection management
**Database:** PostgreSQL (with SQLite fallback for development)

---

## **Project Structure**

```
collab-code-editor/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── database.py          # Database configuration
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── routers/             # API route handlers
│   │   │   ├── rooms.py         # Room management endpoints
│   │   │   ├── autocomplete.py  # AI autocomplete endpoint
│   │   │   └── websocket.py     # WebSocket endpoint
│   │   ├── services/            # Business logic
│   │   │   ├── room_service.py  # Room operations
│   │   │   └── ai_service.py    # Mock AI autocomplete logic
│   │   └── websocket/
│   │       └── manager.py       # WebSocket connection management
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Environment variables
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── CodeEditor.tsx   # Main code editor
│   │   │   ├── RoomLobby.tsx    # Room creation/joining
│   │   │   └── Sidebar.tsx      # Editor sidebar
│   │   ├── store/               # Redux state management
│   │   │   ├── store.ts         # Redux store configuration
│   │   │   └── slices/
│   │   │       └── editorSlice.ts # Editor state slice
│   │   ├── services/            # API and WebSocket services
│   │   │   ├── api.ts           # REST API client
│   │   │   └── websocket.ts     # WebSocket service
│   │   ├── App.tsx              # Main App component
│   │   └── main.tsx             # React entry point
│   ├── index.html               # HTML template
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── postcss.config.js        # PostCSS configuration
│   └── tsconfig.json            # TypeScript configuration
└── README.md
```

---

## **Setup Instructions**

### **Prerequisites**

* Python 3.8+ with pip
* Node.js 16+ with npm
* PostgreSQL (optional, SQLite included for development)

---

Backend Setup
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Run backend server
uvicorn app.main:app --reload

Backend Runs At:
http://localhost:8000

API Docs:
http://localhost:8000/docs

Frontend Setup
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev

Frontend Runs At:
http://localhost:5173

Environment Variables
Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/codesync
# OR for SQLite:
# DATABASE_URL=sqlite:///./codesync.db

Frontend (.env)
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000

Running the Application
1️⃣ Start the Backend
cd backend
uvicorn app.main:app --reload

2️⃣ Start the Frontend
cd frontend
npm run dev

3️⃣ Open in Browser
http://localhost:5173
