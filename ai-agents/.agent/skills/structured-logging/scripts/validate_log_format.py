import sys
import os
import re

def validate_log(log_path):
    if not os.path.exists(log_path):
        print(f"Error: Log file not found at {log_path}")
        return False
    
    print(f"Validating SHOUT protocol in: {log_path}")
    
    # SHOUT Protocol Rule: ALL CAPS message
    # Expected format: [timestamp] [LEVEL] MESSAGE
    # Example: [2026-03-04 18:23:08] [INFO] UPDATED THE NAVBAR STYLING
    
    errors = 0
    with open(log_path, 'r') as f:
        for i, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            
            # Match [timestamp] [LEVEL] Message
            match = re.match(r'^\[.*?\] \[.*?\] (.*)$', line)
            if not match:
                print(f"Line {i}: Invalid format. Expected '[timestamp] [LEVEL] MESSAGE'")
                errors += 1
                continue
            
            message = match.group(1)
            # Check for any lowercase letters in the entire line (including level, but excluding timestamp if we wanted to be strict)
            # However, SHOUT protocol says EVERYTHING written by the agent must be ALL CAPS.
            if any(c.islower() for c in line):
                # The timestamp might have lowercase 't' or 'z' in some ISO formats, 
                # but the rule says "EVERY character written by the Logging Agent... MUST be in UPPERCASE".
                # Let's check the message specifically first.
                if any(c.islower() for c in message):
                    print(f"Line {i}: Message contains lowercase letters: '{message}'")
                    errors += 1
    
    if errors == 0:
        print("SUCCESS: Log entries follow the mandatory SHOUT protocol.")
        return True
    else:
        print(f"FAILURE: Found {errors} violations of the SHOUT protocol.")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Default to common location if not provided
        log_path = "src/activity.log"
    else:
        log_path = sys.argv[1]
    
    if not validate_log(log_path):
        sys.exit(1)
