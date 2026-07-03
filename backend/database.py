import logging
from config import config

class Database:
    """Database layer with in-memory fallback when MongoDB is unavailable."""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.use_memory = False
        self._memory_store = {}  # In-memory fallback: {session_id: [messages]}

    async def connect(self):
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            self.client = AsyncIOMotorClient(
                config.MONGODB_URL,
                serverSelectionTimeoutMS=5000  # 5 second timeout
            )
            # Force a connection check
            await self.client.server_info()
            self.db = self.client[config.DATABASE_NAME]
            logging.info(f"Connected to MongoDB at {config.MONGODB_URL}")
        except Exception as e:
            logging.warning(f"Could not connect to MongoDB: {e}")
            logging.warning("Falling back to in-memory storage (chat history will not persist across restarts)")
            self.use_memory = True

    async def close(self):
        if self.client:
            self.client.close()

    async def save_message(self, session_id: str, message: dict):
        if self.use_memory:
            if session_id not in self._memory_store:
                self._memory_store[session_id] = []
            self._memory_store[session_id].append(message)
            return
        
        await self.db.sessions.update_one(
            {"session_id": session_id},
            {"$push": {"history": message}},
            upsert=True
        )

    async def get_history(self, session_id: str):
        if self.use_memory:
            return self._memory_store.get(session_id, [])
        
        session = await self.db.sessions.find_one({"session_id": session_id})
        return session["history"] if session else []

db = Database()
