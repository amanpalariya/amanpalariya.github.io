---
title: "notify: A Tiny CLI Utility for Desktop Notifications"
description: "How my small CLI helper keeps me notified when long commands finish."
tags:
  - cli
  - tools
  - productivity
published: "2026-02-05"
---

I have a small vibe-coded CLI utility called notify. It sends a desktop notification when a command finishes running.

Examples for long running commands to get a notification

```bash
docker build .; notify
mvn install; notify
wget rookstar.com/gta6-fr.exe; notify
```

Why is it useful?

1. Run long command asynchronously.
2. Get notified when command finishes.
3. No more switching apps to see if the command has finished executing.

It's a simple idea, but it's been super useful.

Code: https://gist.github.com/amanpalariya/4830e40c26325c68940216c40c42b10a