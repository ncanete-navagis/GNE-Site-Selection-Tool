---
name: structured-logging
description: Maintains a detailed activity log of codebase changes and dependency updates.
---

# Structured Logging Skill
Monitors changes within the source directory and documents logic shifts, dependency updates, and structural changes.

## 🎯 Steps
1. **Monitor:** Trace file lifecycle events (addition, modification, removal).
2. **Audit:** Run `./scripts/validate_log_format.py` to ensure SHOUT protocol compliance.
3. **Audit:** Verify `package.json` or `requirements.txt` consistency after dependency changes.

## 📋 Requirements
* FORCE ALL CAPS for all log entries in `src/activity.log`.
* Include timestamps and log levels (INFO, FIX, WARN) for every entry.
* Maintain a "Weightless" history of codebase evolution.
