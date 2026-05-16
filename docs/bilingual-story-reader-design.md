# Bilingual Story Reader Design

## Current Product Decisions

- The tool is named `Bilingual Story Reader` everywhere: route, registry id, feature folder, code exports, tests, and docs.
- The canonical route is `/tools/bilingual-story-reader/`.
- We do not care about backward compatibility while this tool is being built. Remove obsolete fields and behavior instead of preserving compatibility shims.
- The setup form should be mostly prefilled. Defaults are `English` as known language, `Spanish` as target language, `A1`, `Short`, and an automatic random theme.
- Languages should be selected from a dropdown with recognizable labels/flags, with a custom-language escape hatch.
- `Theme` is optional. A blank theme means the AI should choose a random concrete, learner-appropriate story theme.
- Do not expose advanced setup fields unless they clearly improve the main workflow. The removed fields are `translationStyle`, `vocabularyFocus`, `tone`, and `avoidTopics`.
- Users should not have to care about JSON. The UI should say `AI response` or `response`, not `JSON`, except in internal implementation docs or prompt constraints where strict JSON is technically required.
- There is no user-facing `Format JSON` action. The app should clean, parse, validate, and explain errors without asking the user to format anything.
- Copy/paste feedback should follow the EPUB Maker pattern: direct clipboard actions, short toast-style alerts, and recoverable warnings.
- Paste response must not occupy a permanent half-page panel. Follow EPUB Maker: primary toolbar paste action first, with compact manual paste fallback only when the user opens it or clipboard access fails.
- If the user accidentally pastes the copied prompt back into the response area, do not parse or render the prompt’s embedded schema example. Show a warning asking for the AI assistant’s response instead.
- Once a valid story is loaded, hide setup, copy, and paste controls so the reading experience is immersive. The reader toolbar should show `Adjust Prompt` and `New Story`.
- Help must not be persistent or layout-shifting. The story gets full reading width; sentence, word/phrase, and paragraph help appears only in closeable popovers on hover/click/double-click/tap/focus.
- Text highlighting must be paint-only. Do not change font weight, padding, border width, or other metrics when help opens.

## Goal

Create a browser-only tool that helps language learners read short stories in a target language with just-in-time help. The tool does not call an AI model directly. Instead, it collects the story requirements in a local form, generates a copyable prompt from those inputs, the user runs that prompt in their preferred AI assistant, then pastes the AI-produced AI response back into this tool.

The reader should support any known-language to learning-language pair, such as English to Spanish, Hindi to English, Japanese to French, or Spanish to German.

## Working Name

- Display name: `Bilingual Story Reader`
- Route: `/tools/bilingual-story-reader/`
- Registry id: `bilingual-story-reader`
- Status at launch: `alpha`
- Tags: `Language`, `Reading`

## Primary User Flow

1. The user opens the tool.
2. The user fills a compact setup form:
   - known language
   - target language
   - learner level
   - story theme
   - approximate length
   - whether sentence translations should be literal, natural, or both
   - optional vocabulary focus
   - optional tone, such as daily life, mystery, travel, school, or workplace
   - optional topics to avoid
   - optional extra instructions for the AI
3. The tool generates a prompt from the form and the top toolbar enables `Copy Prompt`.
4. The user pastes the prompt into an AI assistant.
5. The AI assistant returns a single JSON object in the agreed format.
6. The user pastes the AI response into the tool.
7. The tool validates the AI response and renders the story.
8. The user reads the target-language story and reveals help only when needed.

## UX Principles

- Keep the reading surface calm. The target-language story is the main content, not the translations.
- Make help progressive: inline vocabulary help for words and phrases, then sentence-level reveal stages from `Clue` to `Meaning` to `Translation` to `Why it works`.
- Avoid forcing the user to leave reading mode to inspect vocabulary.
- Make pasted AI response errors recoverable with clear messages that point to the missing field or malformed section.
- Preserve privacy by keeping all pasted content local in the browser.
- Work well on touch devices: hover interactions must also have tap equivalents.
- Treat the external AI as unreliable input. The tool should clean, validate, repair, warn, and render partial content where safe.

## Generation Constraints

The setup form stores friendly choices, but prompt generation must convert those choices into measurable constraints.

### Length Presets

- `Short`: 2 paragraphs, 4-6 sentences total, 80-120 target-language words when word count is applicable.
- `Medium`: 3-4 paragraphs, 8-12 sentences total, 180-260 target-language words when word count is applicable.
- `Long`: 5-7 paragraphs, 14-20 sentences total, 350-500 target-language words when word count is applicable.

### Level Constraints

The prompt should include concrete level guidance instead of only saying `level-appropriate`.

- `Beginner`: pre-A1/A1-lite constraints, present tense only where the language supports tense, concrete nouns and verbs, very common daily-life vocabulary, no idioms, no subordinate clauses, 4-8 target-language words per sentence when word count is applicable, 1 highlighted word or phrase per sentence.
- `A1`: mostly present tense, concrete nouns and verbs, no unexplained idioms, no subordinate clauses unless explained, 6-10 target-language words per sentence when word count is applicable, 1-2 highlighted words or phrases per sentence.
- `A2`: present and common past/future forms, simple connectors, familiar everyday topics, limited subordinate clauses, 8-14 words per sentence, 1-2 highlighted words or phrases per sentence.
- `B1`: mixed common tenses, clear cause/effect, moderate dialogue, occasional idioms with explanations, 10-18 words per sentence, 1-3 highlighted words or phrases per sentence.
- `B2`: more natural prose, varied sentence structure, nuance and register notes, idioms allowed when explained, 12-24 words per sentence, 1-3 highlighted words or phrases per sentence.
- `C1` / `C2`: authentic-style prose, idioms, collocations, register and nuance explanations, longer sentences allowed when pedagogically useful, highlights focus on nuance rather than basic meaning.
- `Custom`: reveal additional fields for max sentence length, allowed grammar, tense/aspect comfort, vocabulary comfort, desired CEFR-like level, and specific language features to include or avoid.

### Translation Style Rules

`naturalTranslation` is always required so rendering is stable.

- `Natural`: include `naturalTranslation`; omit `literalTranslation` unless a literal contrast is pedagogically necessary.
- `Literal`: include both `naturalTranslation` and `literalTranslation`; show literal translation first in the UI.
- `Both`: include both and show natural translation first.

### Script And Language Rules

- Story text must use native orthography for the target language.
- Use NFC-normalized text for `sentence.text` and `segments[].text`.
- Include `romanization`, `pronunciation`, `scriptNote`, or `wordBreakdown` when useful for languages such as Japanese, Arabic, Hindi, Thai, Chinese, Hebrew, or Urdu.
- Include `direction` for both known and target languages when the model can infer it: `ltr`, `rtl`, or `auto`.
- Explanations, questions, hints, summaries, and translations must be in the known language unless explicitly requested otherwise.

## Page Layout

### Initial Empty State

The first screen should be a work-focused tool, not a marketing page.

Top toolbar:

- `Copy Prompt` primary button with copy icon. Disabled until required setup fields are filled.
- Compact status text: `No story loaded`.

Main content uses a two-column layout on desktop and stacked panels on mobile.

Left panel: `Story Setup`

- `Known language` text input with suggestions, examples, and inline guidance such as `Use a language name, e.g. English, not "English beginner"`.
- `Target language` text input with suggestions, examples, and the same language-name validation.
- `Level` select: `Beginner`, `A1`, `A2`, `B1`, `B2`, `C1`, `C2`, `Custom`.
- Custom level fields appear only when `Custom` is selected: max sentence length, allowed grammar, tense/aspect comfort, vocabulary comfort, CEFR-like target, and language features to include or avoid.
- `Theme` text input with a concrete placeholder such as `lost phone at a train station`.
- `Avoid topics` optional text input for subject matter the story should not include.
- `Length` segmented control: `Short`, `Medium`, `Long`.
- `Extra instructions` optional textarea for constraints such as avoiding a topic, using only present tense, adding transliteration, or focusing on dialogue.
- Collapsible `Prompt preview` showing the generated prompt before copying.
- `Copy Prompt` button repeated at the bottom for mobile ergonomics.

Right panel: `Paste AI Response`

- Large textarea for AI response input.
- `Render Story` button.
- `Copy Repair Prompt` button when validation fails.
- Inline validation summary under the textarea.

Helper strip below the panels:

- Short four-step checklist:
  - Fill the setup fields.
  - Copy the generated prompt.
  - Generate AI response in an AI assistant.
  - Paste and read here.
- This helper collapses after a story is rendered.
- A compact info tooltip explains: `This tool formats and reads AI-generated AI response locally. It does not send your story to an AI service.`

### Rendered Reading View

Once valid AI response is loaded, the page changes to a reader layout.

Header band:

- Story title.
- Target language, known language, level, estimated reading time.
- Reading progress such as `Paragraph 2 of 5`.
- Soft warning count when the story renders with quality warnings.

Reading area:

- Target-language story as paragraphs.
- Each sentence is individually selectable.
- Active sentence gets a subtle left border and background.
- Vocabulary words and short phrases with hints are rendered as focusable inline elements with dotted underlines.
- Paragraph-level check buttons appear after each paragraph when paragraph summaries or questions are present.

Side panel on desktop, bottom sheet on mobile:

- Selected word, phrase, sentence, or paragraph.
- The help content appropriate for that selection.
- Reveal controls that progress from clue to fuller explanation.
- Compact typography so the help area stays secondary to the target-language story.

Footer area:

- Comprehension questions.
- Optional answer reveal controls.
- Vocabulary review list.

## Interaction Design

### Help Layers

The reader supports three help surfaces. Sentence help inside the sentence surface has four reveal stages.

Word or phrase help:

- Used for vocabulary, idioms, and short grammar chunks.
- Opens as a popover on desktop.
- Always opens in the bottom help sheet on mobile.
- Shows a compact card: term, meaning, part of speech, hint, and the sentence fragment where it appears.

Sentence help:

- Used when the user needs to understand the whole sentence.
- Opens in a compact popover anchored to the selected sentence.
- Shows available clue, meaning, translation, and explanation together; no progressive `Reveal next` workflow.

Paragraph help:

- Used after the user has read a paragraph and wants to verify comprehension.
- Appears as a small `Check paragraph` button after the paragraph.
- Opens a compact popover with summary, key events, and optional paragraph-level question.

### Sentence Help

Default state:

- Only target-language text is visible.
- Sentence boundaries are represented by natural text spacing and a subtle hover/focus state, not boxes around every sentence.

Hover or focus:

- Sentence gets a light highlight.
- The cursor indicates the sentence can be selected.
- A small inline icon button appears at the sentence end when there is enough room.

Click, double-click, or Enter:

- Opens a sentence help popover.
- When highlighted word/phrase help is present, single-click can open word help and double-click can open sentence help.
- Click and double-click handling should be explicit: a single word/phrase click is delayed briefly so a double-click can cancel it and open sentence help instead.
- Shows the available clue, meaning, translation, and `Why it works` details without requiring staged reveals.
- Closing the popover returns the reader to the full-width story without shifting paragraph layout.

### Vocabulary Help

Vocabulary items and useful phrases appear as subtle dotted underlines inside the story. The AI-provided AI response should mark these as sentence `segments` so the UI does not need to guess which repeated word should receive a hint.

Hover, focus, click, or tap opens a small popover:

- lemma or dictionary form
- part of speech
- short meaning in the known language
- pronunciation or transliteration when available
- example phrase from the story

The popover should stay compact and must not permanently reduce the story reading area.

### Paragraph Check

Each paragraph may include optional paragraph-level help:

- `summary`: a one-sentence summary in the known language.
- `keyPoint`: the most important thing the learner should understand.
- `question`: a comprehension check for that paragraph.
- `answer`: the expected answer.

The paragraph help should not be shown automatically. After the paragraph, render a compact `Check paragraph` button. When clicked, show the available question, key point, summary, and answer in a popover. Do not add staged reveal controls for paragraph help.

This keeps paragraph-level help from interrupting normal reading.

### Reading Position

- Track active paragraph and active sentence.
- Preserve active paragraph when the user switches between paste mode and reading mode.
- Show simple progress for medium and long stories.
- `Continue reading` should return focus and scroll position to the last active sentence when a story is already loaded.

### Focus Model

Avoid placing every sentence in the tab order at once. Use roving focus:

- Only the active sentence is in the normal tab order.
- Arrow keys or `J` / `K` move active sentence.
- Vocabulary terms inside the active sentence are keyboard reachable.
- Closing a popover, side panel, or bottom sheet returns focus to the sentence or term that opened it.

### Keyboard Support

- `Tab`: move through interactive sentences and vocabulary.
- `Enter` or `Space`: open selected help.
- `Esc`: close popover or side panel.
- `J` / `K`: move to next or previous sentence when the textarea is not focused.
- `R`: reveal next help level for the active sentence.

Keyboard shortcuts should not be rendered as instructional text in the main UI. They can be present in tooltips or an accessible help dialog later.

## AI response Contract

The top-level AI response should be a single object with stable, versioned fields.

```json
{
  "schemaVersion": "1.0",
  "generationRequest": {
    "knownLanguage": "English",
    "targetLanguage": "Spanish",
    "level": "A1",
    "theme": "mystery in a small cafe",
    "length": "short",
    "lengthConstraints": {
      "paragraphCount": { "min": 2, "max": 2 },
      "sentenceCount": { "min": 4, "max": 6 },
      "targetLanguageWordCount": { "min": 80, "max": 120 },
      "targetLanguageCharacterCount": null
    },
    "levelConstraints": {
      "sentenceWordCount": { "min": 6, "max": 10 },
      "sentenceCharacterCount": null,
      "grammar": "mostly present tense, concrete nouns and verbs, no unexplained idioms",
      "highlightDensity": { "min": 1, "max": 2 }
    },
    "tone": "light mystery",
    "extraInstructions": "Use mostly present tense and include simple cafe dialogue."
  },
  "story": {
    "id": "cafe-misterioso-a1",
    "title": "El café misterioso",
    "targetLanguage": {
      "code": "es",
      "name": "Spanish",
      "direction": "ltr"
    },
    "knownLanguage": {
      "code": "en",
      "name": "English",
      "direction": "ltr"
    },
    "level": "A1",
    "theme": "mystery in a small café",
    "summary": "A beginner-friendly mystery story set in a café.",
    "estimatedMinutes": 5
  },
  "paragraphs": [
    {
      "id": "p1",
      "summary": "Lina enters a small café and notices something unusual.",
      "keyPoint": "Lina has arrived at the café where the mystery begins.",
      "question": "Where does Lina go?",
      "answer": "She goes into a small cafe.",
      "sentences": [
        {
          "id": "s1",
          "text": "Lina entra en un café pequeño.",
          "clue": "A person goes into a place.",
          "meaning": "Lina enters a small café.",
          "naturalTranslation": "Lina walks into a small café.",
          "literalTranslation": "Lina enters in a café small.",
          "grammarNotes": [
            {
              "topic": "Adjective position",
              "explanation": "Many Spanish adjectives come after the noun.",
              "whyUsedHere": "Pequeño describes café, so it follows the noun.",
              "literalBreakdown": "café pequeño = café small",
              "alternateFormWarning": "Putting pequeño before café can sound more subjective or literary."
            }
          ],
          "usageNotes": [
            {
              "topic": "Movement into a place",
              "explanation": "Entrar en can describe entering a place."
            }
          ],
          "commonMistakes": [
            {
              "mistake": "Using es instead of entra",
              "correction": "Use entra because Lina is doing the action of entering."
            }
          ],
          "wordByWord": [
            { "text": "Lina", "meaning": "Lina" },
            { "text": "entra", "meaning": "enters" },
            { "text": "en", "meaning": "in/into" },
            { "text": "un", "meaning": "a" },
            { "text": "café", "meaning": "café" },
            { "text": "pequeño", "meaning": "small" }
          ],
          "segments": [
            {
              "text": "Lina "
            },
            {
              "text": "entra",
              "kind": "word",
              "lemma": "entrar",
              "partOfSpeech": "verb",
              "meaning": "enters",
              "hint": "from the verb meaning to enter"
            },
            {
              "text": " en un café "
            },
            {
              "text": "pequeño",
              "kind": "word",
              "lemma": "pequeño",
              "partOfSpeech": "adjective",
              "meaning": "small",
              "hint": "describes café",
              "morphology": {
                "gender": "masculine",
                "number": "singular"
              }
            },
            {
              "text": "."
            }
          ]
        }
      ]
    }
  ],
  "vocabularyReview": [
    {
      "term": "entrar",
      "meaning": "to enter",
      "example": "Lina entra en un café pequeño."
    }
  ],
  "comprehensionQuestions": [
    {
      "id": "q1",
      "difficulty": "direct-recall",
      "question": "Where does Lina go?",
      "answer": "She goes into a small cafe."
    }
  ],
  "qualityNotes": [
    "The story uses mostly present-tense verbs and short A1 sentences."
  ]
}
```

### Allowed Values

- `story.targetLanguage.direction` and `story.knownLanguage.direction`: `ltr`, `rtl`, or `auto`.
- `segments[].kind`: `word` or `phrase`.
- `comprehensionQuestions[].difficulty`: `direct-recall`, `inference`, or `vocabulary-in-context`.
- `schemaVersion`: exactly `1.0` for this design.

### Required Fields

- `schemaVersion`
- `story.title`
- `story.targetLanguage.name`
- `story.knownLanguage.name`
- `story.level`
- `paragraphs`
- `paragraphs[].id`
- `paragraphs[].sentences`
- `sentences[].id`
- `sentences[].text`
- `sentences[].naturalTranslation`

### Optional Fields

- `story.id`
- `story.theme`
- `story.summary`
- `story.estimatedMinutes`
- `generationRequest`
- `generationRequest.lengthConstraints`
- `generationRequest.levelConstraints`
- `story.targetLanguage.direction`
- `story.knownLanguage.direction`
- `paragraphs[].summary`
- `paragraphs[].keyPoint`
- `paragraphs[].question`
- `paragraphs[].answer`
- `sentences[].clue`
- `sentences[].meaning`
- `sentences[].literalTranslation`
- `sentences[].grammarNotes`
- `sentences[].usageNotes`
- `sentences[].commonMistakes`
- `sentences[].wordByWord`
- `sentences[].segments`
- `segments[].romanization`
- `segments[].pronunciation`
- `segments[].scriptNote`
- `segments[].wordBreakdown`
- `segments[].morphology`
- `vocabularyReview`
- `comprehensionQuestions`
- `comprehensionQuestions[].difficulty`
- `qualityNotes`

Optional fields should enhance the experience but never block rendering.

Optional text fields in `generationRequest`, such as 
### Segment Rendering Rule

If a sentence has `segments`, the UI should render the sentence from `segments[].text` instead of trying to split `sentence.text`.

Segment rules:

- Plain text segments only need `text`.
- Hintable word or phrase segments should include `kind`, `meaning`, and optionally `lemma`, `partOfSpeech`, and `hint`.
- The concatenated segment text should exactly equal `sentence.text` after NFC normalization.
- The prompt should ask the AI for exact punctuation, spacing, accents, and native orthography.
- Offset-based matching is intentionally avoided for the first implementation because it adds complexity for Unicode scripts and user-visible repair.
- If segments are missing or invalid, render `sentence.text` without vocabulary highlights.

### Sentence Reveal Fields

The AI response field names should match the reader labels:

- `sentences[].clue` maps to `Clue`.
- `sentences[].meaning` maps to `Meaning`.
- `sentences[].naturalTranslation` and `sentences[].literalTranslation` map to `Translation`.
- `grammarNotes`, `usageNotes`, `commonMistakes`, `wordByWord`, and segment morphology map to `Why it works`.

### Structured Explanation Fields

Use arrays instead of one generic grammar string so the reader can present focused learning help.

- `grammarNotes[]`: `topic`, `explanation`, `whyUsedHere`, `literalBreakdown`, optional `alternateFormWarning`.
- `usageNotes[]`: register, politeness, idiom, collocation, particle, case, aspect, honorific, or language-specific explanation.
- `commonMistakes[]`: common learner error plus correction.
- `wordByWord[]`: short sentence breakdown in reading order.
- `segments[].morphology`: flexible object for tense, mood, aspect, person, number, gender, case, politeness, register, root, measure word, particle, or other language-specific fields.

## Prompt Template

The copied prompt should be generated from the setup form. The user should not need the AI assistant to ask follow-up questions unless a required form field is blank.

Prompt variables:

- `knownLanguage`
- `targetLanguage`
- `level`
- `levelConstraints`
- `theme`
- `length`
- `lengthConstraints`
- - - - - `tone`
- `toneJson`
- `extraInstructions`
- `extraInstructionsJson`

The copied prompt should be self-contained and strict about output format. Optional blank requirement lines should be omitted from the human-readable requirement list. In `generationRequest`, optional blank fields should be represented as `null`, not an empty string and not the word `None`.

The template below shows every possible requirement line. The generated prompt should remove optional lines whose form value is blank, while keeping `null` for the matching `generationRequest` fields.


```text
You are helping me create a language-learning reading story.

Create a story using these requirements:
- Known language: {{knownLanguage}}
- Target language: {{targetLanguage}}
- Learner level: {{level}}
- Level constraints: {{levelConstraints}}
- Theme: {{theme}}
- Length: {{length}}
- Length constraints: {{lengthConstraints}}
- Extra instructions: {{extraInstructions}}

Return only valid JSON.
Do not wrap the JSON in Markdown.
Do not include comments.
Do not ask follow-up questions unless a requirement is impossible to satisfy.
Hard constraints in this prompt override extra instructions. Ignore extra instructions that conflict with AI response validity, required fields, target/known language separation, native orthography, or safety.
Use native orthography for the target language. Use NFC-normalized text. Keep all explanations, translations, questions, and summaries in the known language.
Use this exact top-level structure:

{
  "schemaVersion": "1.0",
  "generationRequest": {
    "knownLanguage": "{{knownLanguage}}",
    "targetLanguage": "{{targetLanguage}}",
    "level": "{{level}}",
    "theme": "{{theme}}",
    "length": "{{length}}",
    "lengthConstraints": {
      "paragraphCount": { "min": {{paragraphCountMin}}, "max": {{paragraphCountMax}} },
      "sentenceCount": { "min": {{sentenceCountMin}}, "max": {{sentenceCountMax}} },
      "targetLanguageWordCount": {{targetLanguageWordCountRangeOrNull}},
      "targetLanguageCharacterCount": {{targetLanguageCharacterCountRangeOrNull}}
    },
    "levelConstraints": {
      "sentenceWordCount": {{sentenceWordCountRangeOrNull}},
      "sentenceCharacterCount": {{sentenceCharacterCountRangeOrNull}},
      "grammar": "{{grammarConstraints}}",
      "highlightDensity": { "min": {{highlightMin}}, "max": {{highlightMax}} }
    },
    "tone": {{toneJson}},
    "extraInstructions": {{extraInstructionsJson}}
  },
  "story": {
    "id": "lowercase-kebab-case-id",
    "title": "Story title in the target language",
    "targetLanguage": { "code": "optional ISO code", "name": "Target language name", "direction": "ltr" },
    "knownLanguage": { "code": "optional ISO code", "name": "Known language name", "direction": "ltr" },
    "level": "Learner level",
    "theme": "Requested theme",
    "summary": "One-sentence summary in the known language",
    "estimatedMinutes": 5
  },
  "paragraphs": [
    {
      "id": "p1",
      "summary": "One-sentence paragraph summary in the known language",
      "keyPoint": "Most important point the learner should understand",
      "question": "Paragraph comprehension question in the known language",
      "answer": "Answer in the known language",
      "sentences": [
        {
          "id": "s1",
          "text": "Sentence in the target language.",
          "clue": "Short clue before translation.",
          "meaning": "Short meaning in the known language.",
          "naturalTranslation": "Natural translation in the known language.",
          "literalTranslation": "Literal translation when useful.",
          "grammarNotes": [
            {
              "topic": "Grammar topic",
              "explanation": "Explanation in the known language.",
              "whyUsedHere": "Why this grammar appears in this sentence.",
              "literalBreakdown": "Literal breakdown when helpful.",
              "alternateFormWarning": "Common wrong alternative or why another form would be wrong."
            }
          ],
          "usageNotes": [
            {
              "topic": "Usage, register, idiom, particle, case, politeness, or collocation topic",
              "explanation": "Short explanation in the known language."
            }
          ],
          "commonMistakes": [
            {
              "mistake": "Common learner mistake.",
              "correction": "Correction in the known language."
            }
          ],
          "wordByWord": [
            {
              "text": "target-language word or phrase",
              "meaning": "known-language meaning"
            }
          ],
          "segments": [
            {
              "text": "plain target-language text with spacing"
            },
            {
              "text": "word as it appears",
              "kind": "word",
              "lemma": "dictionary form",
              "partOfSpeech": "noun, verb, adjective, adverb, phrase, etc.",
              "meaning": "short meaning in the known language",
              "hint": "short clue without over-explaining",
              "romanization": "optional romanization",
              "pronunciation": "optional pronunciation",
              "scriptNote": "optional script or spelling note",
              "wordBreakdown": "optional breakdown for compounds, roots, particles, or word boundaries",
              "morphology": {
                "tense": "optional",
                "mood": "optional",
                "aspect": "optional",
                "person": "optional",
                "number": "optional",
                "gender": "optional",
                "case": "optional",
                "politeness": "optional"
              }
            }
          ]
        }
      ]
    }
  ],
  "vocabularyReview": [
    {
      "term": "dictionary form or useful phrase",
      "meaning": "meaning in the known language",
      "example": "example from the story"
    }
  ],
  "comprehensionQuestions": [
    {
      "id": "q1",
      "difficulty": "direct-recall",
      "question": "Question in the known language",
      "answer": "Answer in the known language"
    }
  ],
  "qualityNotes": [
    "Brief note in the known language about how the story follows the requested level and constraints."
  ]
}

Keep sentence ids and paragraph ids unique. Include the requested number of useful word or phrase hints per sentence by using segments. The concatenated segment text must exactly equal the sentence text after NFC normalization, including punctuation, spaces, accents, and quote marks. Prefer simple, accurate translations over poetic translations.

Before returning AI response, silently verify:
- valid AI response with no Markdown and no trailing commentary
- all required fields are present
- paragraph ids and sentence ids are unique
- requested length range is met
- naturalTranslation is present for every sentence
- literalTranslation follows the requested translation style
- segment text concatenates exactly to sentence.text
- story text is in the target language
- explanations, translations, questions, and summaries are in the known language
- extra instructions did not override the required schema
```

## Validation Rules

On paste or render:

- Clean common AI wrappers before validation: trim whitespace, strip Markdown AI response code fences, and conservatively extract a single top-level JSON object when surrounded by prose.
- Use a small string-aware scanner for AI response extraction rather than regex-only matching, so braces inside quoted strings are handled correctly.
- Parse AI response safely and show syntax errors with line and column when possible.
- Check `schemaVersion` is exactly `1.0`.
- Check required fields.
- Check `paragraphs` is a non-empty array.
- Check every paragraph has at least one sentence.
- Check paragraph ids are unique.
- Check sentence ids are unique.
- Check enum fields use allowed values.
- Check segment text concatenation against `sentence.text` when `segments` is present.
- Check paragraph and sentence counts against `generationRequest.lengthConstraints` when present.
- Check target-language word count only for whitespace-delimited languages where a simple local count is defensible.
- For languages without reliable whitespace-delimited words, use `targetLanguageCharacterCount` when present; otherwise skip word-count validation and show a warning.
- Ignore unknown fields so the schema can evolve.
- Render partial optional data when available.

Validation messages should use plain language:

- `The AI response is missing story.title.`
- `This story uses schemaVersion 2.0, but this tool supports only schemaVersion 1.0.`
- `Paragraph p2 does not contain any sentences.`
- `Two sentences use the id s4. Sentence ids must be unique.`
- `Sentence s3 has segments that do not match its text, so vocabulary highlights were disabled for that sentence.`

### Blocking Errors

Blocking errors prevent rendering:

- invalid AI response after cleanup
- unsupported `schemaVersion`
- missing required top-level story fields
- missing `paragraphs`
- paragraph without sentences
- duplicate paragraph ids when state cannot safely map paragraph checks
- sentence without `id`, `text`, or `naturalTranslation`
- duplicate sentence ids when state cannot safely map reveals
- invalid enum values in fields required for layout or interaction, such as `direction`

### Render Warnings

Warnings should render the story where safe:

- Markdown fences were removed before parsing.
- Extra prose was removed before parsing.
- Segment text did not match `sentence.text`; vocabulary highlights disabled for that sentence.
- Story length is outside the requested range.
- Word-count validation was skipped because the target language does not use reliable whitespace-delimited words and no character-count range was provided.
- Language fields or story text appear inconsistent with the requested language pair.
- Literal translations are missing for a `Literal` or `Both` request.
- Grammar notes are missing for most sentences.
- Vocabulary highlights are too dense or absent.
- Multiple sentences have identical clues.
- Language direction is missing and was inferred as `auto`.

### Repair Prompt

When validation fails, show `Copy Repair Prompt`. The repair prompt should include:

- the exact validation errors
- the original pasted output
- the expected schema reminder
- an instruction to return only repaired AI response
- an instruction to preserve the story content unless a field must be changed to satisfy validation

If the pasted output is very large or badly garbled:

- Include at most the first 40,000 characters in the repair prompt.
- Prefer the first conservatively extracted AI response-looking object over surrounding prose.
- Add a truncation note such as `The pasted output was truncated before sending this repair prompt. Preserve all recoverable story content from the included AI response.`

The repair flow should not blame the user. The message should frame malformed output as normal external-AI behavior.

## State Model

The initial implementation can keep state in memory only.

Useful state:

- setup form values
- generated prompt text
- prompt preview expanded state
- raw AI response text
- cleaned AI response text
- parsed story object
- active sentence id
- active segment key
- active paragraph id
- reveal level by sentence id
- paragraph reveal state by paragraph id
- validation errors
- render warnings
- repair prompt text
- reading progress and last scroll target
- copy prompt feedback state

Optional later persistence:

- remember display settings
- export rendered story as printable HTML or EPUB

## Accessibility

- Use semantic article structure for the story.
- Use paragraphs as natural navigation landmarks and avoid announcing every sentence as a standalone button when the user is simply reading.
- Each active sentence control should have an accessible label like `Open help for sentence 3`.
- Dotted-underlined vocabulary terms must be keyboard focusable.
- Popovers and bottom sheets need focus management and Escape handling.
- Color should not be the only signal for active sentence or revealed help.
- The AI response textarea must have a visible label and associated error text.
- Keyboard shortcuts should be discoverable from a toolbar menu or accessible help dialog.
- Closing help returns focus to the sentence, segment, or paragraph control that opened it.
- Respect `direction` for target and known language text and set `dir` attributes on story and help regions.

## Responsive Behavior

Desktop:

- Toolbar at top.
- Story in the main column.
- Sentence help in a sticky right panel.

Tablet:

- Story full width.
- Help panel below the active paragraph or as a right drawer if space allows.

Mobile:

- Top actions collapse into a compact toolbar.
- Sentence and vocabulary help always opens in a bottom sheet.
- Bottom sheet snap points: compact preview, half screen, full screen.
- Tapping another sentence while the sheet is open updates the sheet content instead of closing it.
- Closing the sheet returns focus to the triggering sentence or segment.
- The bottom sheet should avoid covering the active sentence when possible by scrolling the sentence above the sheet.
- Textarea and reader occupy separate modes to avoid a cramped split view.

## Implementation Plan

1. Add `bilingual-story-reader` to the tool registry.
2. Create `/tools/bilingual-story-reader/` page and layout metadata.
3. Add setup form state and prompt generation under `src/features/bilingual-story-reader/`.
4. Add prompt preview, prompt-copy service, and prompt template.
5. Add AI response cleanup, domain types, parser validation, and render warnings under `src/features/bilingual-story-reader/`.
6. Add repair prompt generation.
7. Build the paste-and-render shell.
8. Build the reader view with sentence selection, roving focus, remembered reveal levels, and reading progress.
9. Add vocabulary segment popovers and mobile bottom sheet behavior.
10. Add paragraph check interactions.
11. Add curated examples: Spanish A1, Japanese A2 with romanization, and one RTL or non-Latin-script example.
12. Add focused tests for prompt generation, cleanup, validation, repair prompts, warnings, prompt copying, and reader interactions.

## Example Content


- Spanish A1: native orthography, short present-tense story, simple adjective and verb notes.
- Japanese A2: Japanese script, romanization, particles, word boundaries, and politeness notes.
- Arabic, Hebrew, Hindi, or Urdu example: non-Latin script, direction handling where applicable, pronunciation or transliteration, and script notes.

These examples should double as regression fixtures for parser, rendering, direction, and mobile help behavior.

## Testing Scope

Unit tests:

- setup form values generate a prompt with the expected requirements
- extra instructions are included in the generated prompt when provided
- optional blank fields are omitted from prompt requirement lines and represented as `null` in `generationRequest`
- length presets expand to exact paragraph, sentence, and word-count constraints
- level presets expand to grammar and sentence-length constraints
- `Beginner` expands to pre-A1/A1-lite constraints
- translation style rules always require `naturalTranslation`
- repair prompt includes validation errors and invalid AI response
- unsupported `schemaVersion` is rejected
- valid AI response parses into a renderable story
- Markdown-wrapped AI response is cleaned before validation
- trailing prose around one JSON object is cleaned before validation
- AI response extraction handles braces inside quoted strings
- malformed AI response produces a validation error
- missing required fields are reported
- missing natural translations are blocking errors
- invalid language leakage produces a warning where it can be detected cheaply
- duplicate sentence ids are rejected
- duplicate paragraph ids are rejected
- mismatched sentence segments disable highlights for that sentence
- NFC-equivalent segment text is accepted
- stories outside the requested word range produce warnings
- word-count validation is skipped or replaced with character-count validation for non-whitespace-delimited target languages
- enum fields reject invalid values such as `ltr, rtl, or auto` or `word or phrase`
- missing grammar notes and missing vocabulary highlights produce warnings
- bad segment spacing, smart quotes, punctuation drift, and accent mismatches produce warnings or disabled highlights
- hostile AI output with Markdown fences, trailing commentary, blank optional fields, and repeated clues is handled predictably
- repair prompt truncates very large invalid output with a clear truncation note
- optional fields can be omitted

Functional tests:

- copy prompt is disabled until required setup fields are filled
- prompt preview reflects setup form changes
- copy prompt button writes the prompt to clipboard
- extra instructions field changes the copied prompt
- invalid pasted output shows `Copy Repair Prompt`
- repair prompt copies validation errors and the original output
- example AI response loads and renders
- pasted AI response renders the title and story sentences
- clicking a sentence opens its help panel
- reveal button advances from clue to meaning to translation to why-it-works
- reveal state is remembered per sentence
- vocabulary segment opens a hint popover
- paragraph check opens paragraph-level help
- rendered story with warnings remains readable
- mobile viewport uses bottom help behavior
- mobile paste mode uses full-screen textarea and sticky render action

## Future Enhancements

- Save multiple stories locally.
- Add printable reading mode.
- Export the story as EPUB using the existing EPUB tooling where appropriate.
- Add spaced-review cards from `vocabularyReview`.
- Add display settings for hiding translations, larger text, line spacing, and transliteration.
- Add schema migration if `schemaVersion` changes.
- Add variation seed and `avoid repeating previous story` prompt support for quick regeneration.
