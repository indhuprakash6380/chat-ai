import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PROJECT_NAME = "INGRES AI Assistant"
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = "ingres_ai"
    LOG_LEVEL = "INFO"

config = Config()
