import os
from core.config import settings
from dotenv import load_dotenv

load_dotenv()

print(f"GOOGLE_CLIENT_ID: '{settings.GOOGLE_CLIENT_ID}'")
print(f"GOOGLE_API_KEY: {'[SET]' if settings.GOOGLE_API_KEY else '[NOT SET]'}")
print(f"ASYNC_DATABASE_URL: {settings.ASYNC_DATABASE_URL}")
