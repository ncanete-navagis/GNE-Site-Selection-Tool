import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
import os

from httpx import AsyncClient, ASGITransport

from main import app
from dependencies import get_db
from core.security import get_current_user
from models.user import User

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", 
    "postgresql+asyncpg://postgres:postgres_password@localhost:5432/gne_test_db"
)

# Create an async engine for testing
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine, class_=AsyncSession
)

async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    """Override the get_db dependency to use the testing session."""
    async with TestingSessionLocal() as session:
        yield session

async def override_get_current_user():
    """Mock the authenticated user."""
    return User(id=123, email="test@example.com", name="Test User")

# Override the FastAPI dependency
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

@pytest_asyncio.fixture(scope="session")
async def db_engine():
    """Fixture to provide the database engine and handle setup/teardown."""
    # We yield the engine. If we had Base imported and models fully available,
    # we would do create_all() here. Since we mock DB queries or assume the 
    # test DB is up-to-date with migrations, we just yield it.
    yield test_engine

@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Fixture to provide an AsyncClient for FastAPI endpoint testing."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
