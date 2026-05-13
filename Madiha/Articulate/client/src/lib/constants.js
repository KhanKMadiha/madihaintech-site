/** Focus areas (onboarding chips + profile); used as passage themes. */
export const FOCUS_AREA_OPTIONS = [
  "Executive communication",
  "AI & tech fluency",
  "Confidence & presence",
  "Managing upwards",
  "Storytelling with data",
  "Technical leadership",
  "Strategic thinking",
  "Influencing without authority",
];

/** Theme list for daily check-in “pick a theme” (matches server rotation). */
export const THEMES = [...FOCUS_AREA_OPTIONS];

export const MOODS = [
  { id: "fresh", label: "Fresh", hint: "Up for a stretch" },
  { id: "focused", label: "Focused", hint: "Steady pace" },
  { id: "tired", label: "Tired", hint: "Gentle but clear" },
];

export const PASSAGE_LENGTH_MINUTES = {
  short: 2,
  medium: 4,
  long: 6,
};
