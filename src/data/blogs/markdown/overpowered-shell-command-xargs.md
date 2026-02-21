---
title: "Overpowered Shell Command #1: xargs"
description: "Why xargs is a superpower when you compose shell commands."
tags:
  - shell
  - cli
  - productivity
  - linux
published: "2024-02-15"
---

## Overpowered shell command #1 (xargs)

EXtended ARGumentS (xargs) is a command line utility that takes as input a list of arguments and passes them to another utility. What's the big deal? When it is combined with other commands, it's magic.

The basic syntax is

```
<command that writes to stdout> | xargs [<xargs-options>] <utility>
```

Consider the simple command

```bash
echo "a b c" | xargs -n 1 echo
```

xargs takes the 3 arguments ("a", "b", and "c") and passes them one by one (-n 1) to the utility (echo). In other words, it runs "echo a", "echo b", and "echo c".

Another example

```bash
echo {1..9} | xargs -n 1 -I {} touch file{}.txt
```

xargs takes the 9 arguments (1, 2, ..., 9) and runs "touch file<arg>.txt" for each. So, it creates 9 files (file1.txt, file2.txt, ..., file9.txt).

Now look at some real examples

1. `cat list_of_urls.txt | xargs -n 1 -P 5 wget`
   Download all resources from a list of URLs with 5 different processes in parallel.
2. `find . -type f -name '*.log' -print0 | xargs -0 grep -l 'error'`
   List all log files which contain the word 'error'.
3. `git branch --merged main --format='%(refname:short)' | grep -v main | xargs -n 1 git branch -d`
   Delete all branches (except main) that have been merged into main.
4. `find /path -name '*.png' -print0 | xargs -0 -P 5 -I {} sh -c 'convert {} $(basename {} .png).jpg'`
   Convert all png files to jpg in parallel.

Remember, any sufficiently advanced shell command is indistinguishable from AI.