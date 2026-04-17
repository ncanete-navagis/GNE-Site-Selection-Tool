#!/bin/bash
# Example for PostgreSQL
if pg_isready -h "$DB_HOST" -p "$DB_PORT"; then
    echo "✅ Database is reachable and accepting connections."
    # Optional: Get active connection count
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT count(*) FROM pg_stat_activity;"
else
    echo "❌ Database is NOT reachable at $DB_HOST:$DB_PORT"
    exit 1
fi