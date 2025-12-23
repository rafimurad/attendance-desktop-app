---
description: User testing preferences - DO NOT auto-test with browser
---

# Testing Preferences

## ⚠️ IMPORTANT RULE

**DO NOT use browser_subagent to auto-test UI changes!**

The user prefers to test manually themselves. It saves time.

## What to do instead:

1. Make the code changes
2. Tell the user what to test:
   - Which page/section to check
   - What behavior to verify
   - What the expected result should be
3. Wait for user feedback

## Example response after making changes:

> **To test:** Refresh the app (Ctrl+R) and check that:
> - The month picker shows text on selected months
> - Clicking a month highlights it in green
> - Year navigation arrows work correctly
