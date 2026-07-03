from groq import Groq
from duckduckgo_search import DDGS
import os
from dotenv import load_dotenv
from models import Message
from typing import List

load_dotenv()

class AIEngine:

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        self.system_prompt = (
            "You are INGRES AI Assistant. "
            "Answer clearly and accurately. "
            "Use the provided internet context if available."
        )

    def search_internet(self, query):
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=3):
                results.append(r["body"])
        return "\n".join(results)

    async def get_response(self, user_input: str, history: List[Message]) -> str:

        messages = []

        # system prompt
        messages.append({
            "role": "system",
            "content": self.system_prompt
        })

        # internet search
        search_results = self.search_internet(user_input)

        messages.append({
            "role": "system",
            "content": f"Internet information:\n{search_results}"
        })

        # history
        for msg in history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

        # user message
        messages.append({
            "role": "user",
            "content": user_input
        })

        try:
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )

            return completion.choices[0].message.content

        except Exception as e:
            return f"AI Error: {str(e)}"


ai_engine = AIEngine()