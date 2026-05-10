"""
scripts/test_db.py — Quick DB connectivity diagnostic.
Run from the backend directory: python scripts/test_db.py
"""
import asyncio
import os
import sys

# Load .env before anything else
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("[.env] Loaded")
except ImportError:
    print("[.env] python-dotenv not installed, skipping")

db_url = os.environ.get("DATABASE_URL") or os.environ.get("ASYNC_DATABASE_URL")
print(f"[URL ] {db_url}")

# Strip the +asyncpg driver suffix for asyncpg direct connect
pg_url = db_url.replace("postgresql+asyncpg://", "postgresql://") if db_url else None

import asyncpg

async def main():
    if not pg_url:
        print("[FAIL] No DATABASE_URL found in environment.")
        sys.exit(1)

    try:
        conn = await asyncpg.connect(pg_url)
        print("[OK  ] Connected to PostgreSQL!")

        # Check if gne_db has the users table
        tables = await conn.fetch(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        )
        names = [r["tablename"] for r in tables]
        print(f"[TBL ] Tables in public schema: {names}")

        if "users" in names:
            count = await conn.fetchval("SELECT COUNT(*) FROM users")
            print(f"[OK  ] users table exists — {count} row(s)")
        else:
            print("[WARN] 'users' table does NOT exist yet — needs migration/create_all")

        await conn.close()
    except asyncpg.InvalidPasswordError:
        print("[FAIL] Authentication failed — wrong password in DATABASE_URL")
    except asyncpg.InvalidCatalogNameError:
        print("[FAIL] Database does not exist — check POSTGRES_DB in .env")
    except ConnectionRefusedError:
        print("[FAIL] Connection refused — is PostgreSQL running on the right host/port?")
    except Exception as e:
        print(f"[FAIL] {type(e).__name__}: {e}")

asyncio.run(main())
