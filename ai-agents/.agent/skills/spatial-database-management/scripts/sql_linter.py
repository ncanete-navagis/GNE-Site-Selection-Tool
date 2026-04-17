import sys

def basic_lint(sql_text):
    issues = []
    lines = sql_text.split('\n')
    
    for i, line in enumerate(lines):
        if "PRIMARY KEY" not in sql_text.upper() and "CREATE TABLE" in line.upper():
            issues.append(f"Line {i+1}: Missing PRIMARY KEY definition.")
        if "FOREIGN KEY" in line.upper() and "REFERENCES" not in line.upper():
            issues.append(f"Line {i+1}: Foreign key missing REFERENCES clause.")
            
    return issues

if __name__ == "__main__":
    with open(sys.argv[1], 'r') as f:
        report = basic_lint(f.read())
        print("\n".join(report) if report else "✅ Basic SQL linting passed.")