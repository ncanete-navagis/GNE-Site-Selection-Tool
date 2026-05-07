"""
scripts/test_users_schema.py — Check users table columns and attempt a /me call.
"""
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

import asyncpg

async def main():
    url = (os.environ.get("DATABASE_URL") or "").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)

    cols = await conn.fetch("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position
    """)
    print("=== users table columns ===")
    for c in cols:
        print(f"  {c['column_name']:20} {c['data_type']:30} nullable={c['is_nullable']}")

    rows = await conn.fetch("SELECT id, name, email, created_at, last_login FROM users LIMIT 5")
    print(f"\n=== Sample rows ({len(rows)}) ===")
    for r in rows:
        print(dict(r))

    await conn.close()

asyncio.run(main())
