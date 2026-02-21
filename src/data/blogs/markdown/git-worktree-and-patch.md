---
title: "Two Git Features That Helped Me Ship Faster"
description: "How git worktree and git patch solved real workflow problems for me."
tags:
  - git
  - workflows
  - productivity
published: "2024-01-08"
updated: "2024-01-09"
---

## Found 2 interesting git features that helped me in my work

### Git Worktree

I was working on two different items in parallel, but the code changes were in the same repository. So, I created two branches. Now, switching between the two branches is tedious (commit or stash, wait for the IDE to load changes, etc.)
Then, git worktree came to help.

```bash
git worktree add <new-directory> <my-branch>
```

This command checks out `<my-branch>` in `<new-directory>`, so I can open it as another project in my IDE.

So, now both my branches appear as separate projects in my IDE and I can work on them independently.

When the work is done, use

```bash
git worktree remove <worktree-directory>
```

to remove the directory.

How is this better than cloning the project twice?

- Faster, offline, low disk space, create as many worktrees.
- Cannot checkout the same branch on two directories, so no inconsistency.
- Can check the list of worktrees with `git worktree list`.

### Git patch

Recently, I made changes to a repo for which I only had read privileges. So, I could not push my changes to the remote server. I wanted someone else to take these changes and push them.
Here come git patches.

I exported the commits (patches)

```bash
git format-patch --output="commits.patch" commit1..commitN
```

This creates a file that looks like an ordinary human-readable diff file. Now, this patch file can be sent over email or instant messaging.

Applying the patches is even easier, just

```bash
git am "commits.patch"
```

It's like cherry-pick but more manual and flexible.
The interesting part is that the commit messages and authorship are still preserved.