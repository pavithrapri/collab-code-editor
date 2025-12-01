# **Collaborative Code Editor**

## **Overview**

CodeSync Pro is a collaborative code editor that allows multiple users to edit code simultaneously. Built with a FastAPI (Python) backend and a React/TypeScript frontend, it features real-time code synchronization, AI-powered autocomplete suggestions, and multi-user collaboration.

* **Room Management:** Create and join rooms with unique room IDs
* **AI Autocomplete:** Context-aware code suggestions (mocked implementation)
* **Multi-language Support:** Python, JavaScript, TypeScript
* **WebSocket Communication:** Bidirectional code sync
* **Responsive UI:** Modern dark theme with Tailwind CSS

---

## **Technology Stack**

**Backend:** FastAPI, SQLAlchemy, WebSockets, PostgreSQL/SQLite
**Frontend:** React 18, TypeScript, Redux Toolkit, Tailwind CSS
**Real-time:** WebSockets
**Database:** PostgreSQL (with SQLite fallback)

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
│
├── frontend/
│   ├── src/
│   │   ├── components/          
│   │   │   ├── CodeEditor.tsx   # Main code editor
│   │   │   ├── RoomLobby.tsx    # Room creation/joining
│   │   │   └── Sidebar.tsx      # Editor sidebar
│   │   ├── store/               
│   │   │   ├── store.ts         # Redux store configuration
│   │   │   └── slices/
│   │   │       └── editorSlice.ts # Editor state slice
│   │   ├── services/            
│   │   │   ├── api.ts           # REST API client
│   │   │   └── websocket.ts     # WebSocket service
│   │   ├── App.tsx              
│   │   └── main.tsx             
│   ├── index.html               
│   ├── package.json             
│   ├── vite.config.ts           
│   ├── tailwind.config.js       
│   ├── postcss.config.js        
│   └── tsconfig.json            
│
└── README.md
```

---

## **Setup Instructions**

### **Prerequisites**

* Python 3.8+
* Node.js 16+
* PostgreSQL (optional, SQLite included)

---

# **Backend Setup**

```bash
cd backend
```

### Create virtual environment

```bash
python -m venv venv
```

### Activate

**Windows**

```bash
venv\Scripts\activate
```

**Linux/Mac**

```bash
source venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Create environment file

```bash
cp .env.example .env
```

### Run backend server

```bash
uvicorn app.main:app --reload
```

### Backend Runs At

```
http://localhost:8000
```

### API Docs

```
http://localhost:8000/docs
```

---

# **Frontend Setup**

```bash
cd frontend
```

### Install dependencies

```bash
npm install
```

### Start frontend development server

```bash
npm run dev
```

### Frontend Runs At

```
http://localhost:5173
```

---

# **Environment Variables**

### **Backend (.env)**

```
DATABASE_URL=postgresql://user:password@localhost:5432/codesync
# OR for SQLite:
# DATABASE_URL=sqlite:///./codesync.db
```

### **Frontend (.env)**

```
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

---

# **Running the Application**

### 1️⃣ Start the Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### 2️⃣ Start the Frontend

```bash
cd frontend
npm run dev
```

### 3️⃣ Open in Browser

```
http://localhost:5173
```

