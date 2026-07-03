from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uuid
from datetime import datetime

from models import ChatRequest, ChatResponse, Message
from database import db
from ai_engine import ai_engine
from config import config


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.connect()
    yield
    # Shutdown
    await db.close()


app = FastAPI(title=config.PROJECT_NAME, lifespan=lifespan)

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())

    # Get history
    history_data = await db.get_history(session_id)
    history = [Message(**msg) for msg in history_data]

    # Get AI response
    ai_response = await ai_engine.get_response(request.message, history)

    # Save user message
    user_msg = Message(role="user", content=request.message, timestamp=datetime.utcnow())
    await db.save_message(session_id, user_msg.dict())

    # Save assistant message
    assistant_msg = Message(role="assistant", content=ai_response, timestamp=datetime.utcnow())
    await db.save_message(session_id, assistant_msg.dict())

    return ChatResponse(response=ai_response, session_id=session_id)


@app.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    history = await db.get_history(session_id)
    return {"history": history}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
