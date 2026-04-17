import os
import sys
import re

def measure_perf(root_path="."):
    print("Capturing Google Antigravity Performance Metrics (Static Scan)...")
    
    # Rule: Lazy Loading of SDK components
    # Check for dynamic imports 'import()' or 'React.lazy'
    
    files = []
    for root, dirs, files_in_dir in os.walk(root_path):
        if "node_modules" in root or ".git" in root:
            continue
        for f in files_in_dir:
            if f.endswith((".tsx", ".ts", ".js")):
                files.append(os.path.join(root, f))

    lazy_found = False
    for f in files:
        with open(f, 'r', encoding='utf-8', errors='ignore') as content:
            text = content.read()
            if "React.lazy" in text or "dynamic(" in text or "import(" in text:
                lazy_found = True
                break

    if not lazy_found:
        print("Warning: No lazy loading/dynamic imports detected. 3-second load rule may be violated.")

    # Rule: SEO titles and meta
    # Check for document.title or <title> or Meta tags
    print("Checking SEO Metadata...")
    found_seo = False
    for f in files:
        with open(f, 'r', encoding='utf-8', errors='ignore') as content:
            text = content.read()
            if "<title>" in text or "meta" in text.lower() or "Head" in text:
                found_seo = True
                break
    
    if not found_seo:
        print("Warning: No SEO metadata tags found in components.")

    print("Note: Run Lighthouse CLI for actual runtime LCP/FID/CLS measurements.")
    print("SUCCESS: Performance and SEO baseline scan completed.")
    return True

if __name__ == "__main__":
    measure_perf()
