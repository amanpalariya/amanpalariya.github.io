---
title: "Character Encodings Shouldnâ€™t be Ignored"
description: "A Unicode primer from my perspective after hitting mojibake at work."
tags:
  - unicode
  - encoding
  - programming
  - debugging
published: "2026-01-15"
---

I used to take character encodings for granted until I hit my first â€™ at [Oracle](https://www.oracle.com). It happened because one of our data sources used ISO-8859-1 while we use UTF-8 like 99% of the world. So, I had to learn about character encodings in detail.

Keep reading to learn a bit about Unicode from my point-of-view.

Unicode assigns code points to characters, defines ligatures, etc. For example,

- "A" → U+0041
- "👍" → U+1F44D
- "👍🏻" → U+1F44D + U+1F3FB (an example of two code points combining to form a single grapheme)

U+0041, U+1F44D, and U+1F3FB are code points.

Since computer only understand 0s and 1s, the code points are converted to bytes using Unicode Transformation Format (UTF). There are multiple UTFs e.g. UTF-8, UTF-16, and UTF-32.

UTF-32 is the easiest one because it represents each code point as a fixed 32-bit value.
For example:

- "A" → U+0041 → 00 00 00 41 (UTF-32, big-endian)
- "👍" → U+1F44D → 00 01 F4 4D (UTF-32, big-endian)

UTF-8 is the most popular because it's ASCII-compatible and compact. It is a variable-length encoding where code points are encoded using 1 to 4 bytes.
For example:

- "A" → U+0041 → 41 (UTF-8)
- "👍" → U+1F44D → F0 9F 91 8D (UTF-8)

When you mix up encoding, it MAY cause mojibake (see https://en.wikipedia.org/wiki/Mojibake). And it often happens when the data travels from one system to another because both systems might have different system encodings. I found an example in the Google News app.