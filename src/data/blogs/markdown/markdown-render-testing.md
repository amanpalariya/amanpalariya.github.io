---
title: "Markdown Render Testing"
description: "A concise post that covers most markdown and inline HTML rendering cases."
tags:
  - markdown
  - tech
published: "2026-02-27"
---

This post is a compact checklist to verify how markdown renders in this blog.

## Text styles

- **Bold**, *italic*, ***bold+italic***, ~~strikethrough~~
- Inline code: `const ok = true`
- Subscript and superscript via HTML: H<sub>2</sub>O, x<sup>2</sup>

## Links and quotes

> Markdown should keep blockquotes readable and properly spaced.

- [Internal-ish link](https://amanpalariya.github.io)
- [External link](https://www.markdownguide.org)

## Lists

1. Ordered item one
2. Ordered item two
   - Nested unordered
   - Another nested point

- [x] Done task
- [ ] Pending task

---

## Table (GFM)

| Feature | Status | Notes |
| --- | --- | --- |
| Headings | ✅ | h1–h4 in content |
| Code blocks | ✅ | syntax highlighting expected |
| Tables | ✅ | alignment and borders |

## Code blocks

```ts
type User = { id: number; name: string };

const user: User = { id: 1, name: "Aman" };
console.log(user.name);
```

```bash
yarn dev
curl -I http://localhost:3000
```

## Math (KaTeX)

Inline math examples: $E = mc^2$, $a^2 + b^2 = c^2$, and $\int_0^1 x^2\,dx = \frac{1}{3}$.

Block equation:

$$
\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}
$$

Another block (matrix + multiplication):

$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
x + 2y \\
3x + 4y
\end{bmatrix}
$$

## Inline HTML

<details>
  <summary>Click to expand HTML details/summary</summary>
  <p>This block checks whether raw HTML is rendered through the markdown pipeline.</p>
</details>

<table>
  <thead>
    <tr><th>HTML</th><th>Rendered</th></tr>
  </thead>
  <tbody>
    <tr><td>&lt;mark&gt;</td><td><mark>highlighted text</mark></td></tr>
    <tr><td>&lt;kbd&gt;</td><td><kbd>⌘</kbd> + <kbd>K</kbd></td></tr>
  </tbody>
</table>

## Image

![Project logo sample](/images/logo/oracle.svg)

That’s it — short but broad coverage for markdown rendering tests.
