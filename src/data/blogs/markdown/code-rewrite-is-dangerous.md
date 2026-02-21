---
title: "Code Rewrite is Dangerous"
description: "A lesson from Oracle about why decades-old code survives and why rewrites can hurt."
tags:
  - engineering
  - production
  - software
  - maintainability
published: "2026-02-03"
---

When I was new to production code at @Oracle, I was frustrated. It was a messy code. There were strangely structured functions, and seemingly random conditionals. If I tried to clean up some of the mess, I had a hard time getting the pull request reviewed.

With time and regressions, I realized that this messy piece of code is a robust code. It's not meant to be a Ferrari, it's meant to run like an ATV. It handles null values, it checks sanity, and it still supports decade-old usecases that even the official library has abandoned. It's a code that has evolved through countless calls with clamoring customers and hours of debugging by dozens of developers. The out-of-place if statement is a result of hours of hard work put by people. It looks so small in the humongous codebase, but it's solving a real problem and some customer somewhere in the world is glad that it exists.

This realization relieved a lot of my frustation. Before this realization I wanted to rewrite every file that I touched, but now I know a bit better.

@Joel Spolsky put it elegantly even before I was born: https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/