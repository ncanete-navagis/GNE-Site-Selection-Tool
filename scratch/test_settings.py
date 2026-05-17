import os
import sys

# Add backend directory to system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

# Load backend .env explicitly
from dotenv import load_dotenv
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/.env')))

from core.config import settings
print("GOOGLE_CLIENT_ID:", settings.GOOGLE_CLIENT_ID)
