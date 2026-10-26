import { photos, type SectionId } from "@/content/profile";

// Page order. Photography only appears once photos are added to content/shared.ts.
export const sections: SectionId[] = [
  "intro",
  "about",
  "experience",
  "work",
  "stack",
  ...(photos.length > 0 ? (["photography"] as const) : []),
  "contact",
];
