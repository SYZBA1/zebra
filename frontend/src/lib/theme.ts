export type Theme = "light" | "dark";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("zebra-theme") as Theme) || "dark";
}

export function setStoredTheme(theme: Theme) {
  localStorage.setItem("zebra-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function initTheme() {
  const theme = getStoredTheme();
  document.documentElement.classList.toggle("dark", theme === "dark");
  return theme;
}
