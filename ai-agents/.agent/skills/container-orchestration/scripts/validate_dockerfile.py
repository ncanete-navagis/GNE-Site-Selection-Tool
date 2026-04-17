import sys
import re

def lint_dockerfile(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    issues = []
    if "latest" in content.lower():
        issues.append("⚠️ Avoid using 'latest' tag; pin to a specific version.")
    if "USER root" in content or "USER" not in content:
        issues.append("❌ Security Risk: Container might be running as root.")
    if "ADD " in content:
        issues.append("ℹ️ Use 'COPY' instead of 'ADD' unless extracting a tarball.")
    
    if not issues:
        print("✅ Dockerfile follows best practices.")
    else:
        print("\n".join(issues))

if __name__ == "__main__":
    lint_dockerfile(sys.argv[1])