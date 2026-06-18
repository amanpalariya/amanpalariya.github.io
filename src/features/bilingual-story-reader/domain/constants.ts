export const BILINGUAL_STORY_READER_TOOL_ID = "bilingual-story-reader";

export const BILINGUAL_STORY_READER_LEVELS = [
  "Beginner",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

export const BILINGUAL_STORY_READER_LENGTHS = ["Short", "Medium", "Long"] as const;

export const BILINGUAL_STORY_READER_LANGUAGE_OPTIONS = [
  { name: "English", label: "🇺🇸 English" },
  { name: "Spanish", label: "🇪🇸 Spanish" },
  { name: "French", label: "🇫🇷 French" },
  { name: "German", label: "🇩🇪 German" },
  { name: "Hindi", label: "🇮🇳 Hindi" },
  { name: "Japanese", label: "🇯🇵 Japanese" },
  { name: "Korean", label: "🇰🇷 Korean" },
  { name: "Mandarin Chinese", label: "🇨🇳 Mandarin Chinese" },
  { name: "Arabic", label: "🇸🇦 Arabic" },
  { name: "Portuguese", label: "🇧🇷 Portuguese" },
  { name: "Italian", label: "🇮🇹 Italian" },
  { name: "Russian", label: "🇷🇺 Russian" },
  { name: "Custom", label: "🌐 Custom" },
] as const;
