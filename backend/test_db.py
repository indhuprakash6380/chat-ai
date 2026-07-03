import asyncio
import logging
from database import db

logging.basicConfig(level=logging.INFO)

async def test_db():
    print("Testing DB connection...")
    try:
        await db.connect()
        print(f"Connection result: use_memory={db.use_memory}")
        await db.close()
        print("DB connection test passed.")
    except Exception as e:
        print(f"DB connection test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_db())
