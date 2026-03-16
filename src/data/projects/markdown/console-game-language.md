---
title: "Console Game Language"
description: "A new programming language (compiler & runtime) for retro console games"
tags:
  - compilers
  - python
  - programming
published: ""
---

I completed the course Programming Paradigms and Pragmatics by [Dr. Deepti Bathula](https://www.linkedin.com/in/deepti-r-bathula/) in 2021.
There I learnt about the behind-the-scenes of a compiler -- grammar, lexical analysis, syntax analysis, etc.
We did a few assignments where we used [Lex](https://en.wikipedia.org/wiki/Lex%20(software)) and [Yacc](https://en.wikipedia.org/wiki/Yacc) to write simple compiler.
But these tools hid some of the complexities which I wanted to understand. So, the next summer vacation (June 2021), I started writing a programming language and a compiler of my own.

I call this language "Console Game Language", since the runtime here is a custom retro game console.
With the help of this new language, you can create programs for this custom game console.

![Screenshot of the Retro Console](https://raw.githubusercontent.com/amanpalariya/console-game/main/doc/assets/screenshot-smiley.png)

## Quick Intro to Language
- A program in this language works on states (a state name starts with ~).
- All instruction in the current state are executed at every frame refresh (aka a clock tick).
- The instruction in a state can be to clear the display, to display some shape at a coordinate, to assign values to variables, or to jump to another state.
- Also, a state can also define button handlers i.e. what happens when X, Y, A, B, or START is pressed when the program in that state. Button handlers start with @.
- A shape is a fixed pixel array arrangement (a shape name starts with #).

Here's a simple program. A program starts with the name of the first state.
It defines an X shape as a 3x3 matrix (. means off pixels, # means on pixels).
Then the state definition displays the shape at coordinate (10, 10). FYI, all expressions in this language are enclosed in square brackets.
```java
~x_state

#x_shape {
#.#
.#.
#.#
}

~x_state {
    display #x_shape @ ([10], [10])
}
```
It looks like this on a 30x30 screen.

![Screenshot of X displayed on console](https://raw.githubusercontent.com/amanpalariya/console-game/refs/heads/main/doc/assets/screenshot-x.png)

Now, let's add one more state which displays Os instead of Xs and we'll switch the state by pressing START.
```java
~x_state

#x {
#.#
.#.
#.#
}

#o {
###
#.#
###
}

~x_state {
    clear
    display #x @ ([10], [10])

    @START {
        goto ~o_state
    }
}

~o_state {
    clear
    display #o @ ([10], [10])

    @START {
        goto ~x_state
    }
}
```
Here, we've added a button handler `@START` which runs a goto command to jump to a different state. The `clear` statement clears all the pixels, so that the shapes don't appear on top of each other (which may be desired in some cases).

![Screenshot of XO displayed on console](https://raw.githubusercontent.com/amanpalariya/console-game/refs/heads/main/doc/assets/screenshot-xo.gif)

It also supports if conditions, while iterations, random numbers, and variables. See [samples](https://github.com/amanpalariya/console-game/tree/main/samples) for more.

## Compilation Steps
The compilation and running has these five steps
1. Preprocessing
2. Lexical Analysis
3. Syntax Analysis
4. Semantic Analysis
5. Rendering the data to screen and interfacing the user to the underlying program

### Preprocessing
At preprocessing, we remove the comments from the code, remove trailing whitespaces from lines, and add a new line at the end of file is not present.

### Lexical Analysis
Here, the stream of characters is tokenized.
The tokens are defined in [lexerPatterns.py](https://github.com/amanpalariya/console-game/blob/main/language/compiler/lexerPatterns.py) using RegEx.
The lexical analyzer matches the head of the stream with the tokens.
For example, this code
```java
~x_state

#x_shape {
#.#
.#.
#.#
}

~x_state {
    display #x_shape @ ([10], [10])
}
```
will be tokenized as following
|Token            |Position|Lexeme      |
|-----------------|--------|------------|
|state-name       |1:1     |~x_state    |
|newline          |1:9     |            |
|shape-name       |3:1     |#x_shape    |
|left-brace       |3:10    |{           |
|newline          |3:11    |            |
|shape            |4:1     |#.# .#. #.# |
|right-brace      |7:1     |}           |
|newline          |7:2     |            |
|state-name       |9:1     |~x_state    |
|left-brace       |9:10    |{           |
|newline          |9:11    |            |
|display-shape    |10:5    |display     |
|shape-name       |10:13   |#x_shape    |
|coordinate-op    |10:22   |@           |
|left-paren       |10:24   |(           |
|single-expression|10:25   |[10]        |
|comma            |10:29   |,           |
|single-expression|10:31   |[10]        |
|right-paren      |10:35   |)           |
|newline          |10:36   |            |
|right-brace      |11:1    |}           |
|newline          |11:2    |            |


### Syntax Analysis
The stream of tokens is converted to an abstract syntax tree (AST) by the syntax analyzer.
The rules that define how to convert the tokens to a syntax tree is the grammar of the language and is often defined using [BNF](https://en.wikipedia.org/wiki/Backus-Naur_form).
The grammar of this language is [grammar.bnf](https://github.com/amanpalariya/console-game/blob/main/output/grammar.bnf).
The `prog` token is the root of the syntax tree.

Here I used [LR(0) parser](https://www.wikiwand.com/en/LR_parser) to parse the grammar and tokens into a syntax tree. And this is the core of the compiler. It includes managing items, item sets, action table, goto tables, etc. This is where compilers' theory from my course and Wikipedia helped me (because LLM weren't a thing yet).

The syntax tree for the above program is
```
prog
├── state-name: ~x_state
├── newline: \n\n
├── top-level-stmts
│   ├── top-level-stmts
│   │   └── top-level-stmt
│   │       └── shape-def
│   │           ├── shape-name: #x_shape
│   │           ├── left-brace: {
│   │           ├── newline: \n
│   │           ├── shape: #.#
│   │           │          .#.
│   │           │          #.#
│   │           └── right-brace: }
│   ├── newline: \n\n
│   └── top-level-stmt
│       └── state-def
│           ├── state-name: ~x_state
│           ├── left-brace: {
│           ├── newline: \n
│           ├── instate-stmts
│           │   └── instate-stmt
│           │       └── screen-update-stmt
│           │           ├── display-shape: display
│           │           ├── shape-name: #x_shape
│           │           ├── coordinate-op: @
│           │           ├── left-paren: (
│           │           ├── expression
│           │           │   └── single-expression: [10]
│           │           ├── comma: ,
│           │           ├── expression
│           │           │   └── single-expression: [10]
│           │           └── right-paren: )
│           ├── newline: \n
│           └── right-brace: }
└── newline: \n
```

This completes the compilation of the program. This tree could be serialized and saved as compiled output.
But we're not doing that, we're converting this to semantic objects directly.

### Semantic Analysis
This is where the abstract terms such as 'expression' and state changes, start to make sense.
Semantic analysis creates semantic objects which makes sense, for example the expression object can be queried to get a value after it is converted to semantic object. In some languages, the AST is translated to machine code (C++, Go), and in some it's converted to bytecode (Java, Kotlin, Dart).

### Rendering
Finally, the semantic object can be used by the renderer (here the [PyGame](https://www.pygame.org/) program) to display the pixel arrays, manage the states, buttons presses, etc. It acts as the interface between the user and the program.

Checkout this video to see the program in action.
<iframe width="560" height="315" src="https://www.youtube.com/embed/okbscpQNZM0?si=r_y1pgdDi8GHbZRP" title="How a Programming Language is Created" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>