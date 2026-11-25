export type StudioLanguage = "en" | "am";

const LANGUAGE_STORAGE_KEY = "zebra-studio-language";

export function getStoredStudioLanguage(): StudioLanguage {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "am" ? "am" : "en";
}

export function setStoredStudioLanguage(language: StudioLanguage): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}
