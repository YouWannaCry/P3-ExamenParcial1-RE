type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "foodStoreTheme";

function getSavedTheme(): Theme {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function updateThemeSwitch(input: HTMLInputElement, theme: Theme): void {
  input.checked = theme === "dark";
}

export function setupThemeToggle(buttonId = "themeToggle"): void {
  const input = document.getElementById(buttonId) as HTMLInputElement | null;
  let currentTheme = getSavedTheme();

  applyTheme(currentTheme);

  if (!input) {
    return;
  }

  updateThemeSwitch(input, currentTheme);

  input.addEventListener("change", () => {
    currentTheme = input.checked ? "dark" : "light";
    applyTheme(currentTheme);
    updateThemeSwitch(input, currentTheme);
  });
}
