import os
import psycopg2 # or appropriate driver for your DB

def execute_safe_query(sql):
    # Enforce read-only and limits
    if "drop" in sql.lower() or "truncate" in sql.lower():
        return "Error: Destructive commands are blocked via db-ops."
    
    if "select" in sql.lower() and "limit" not in sql.lower():
        sql += " LIMIT 100"

    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cur = conn.cursor()
        cur.execute(sql)
        results = cur.fetchall()
        cur.close()
        conn.close()
        return results
    except Exception as e:
        return f"Database Error: {str(e)}"

if __name__ == "__main__":
    import sys
    print(execute_safe_query(sys.argv[1]))