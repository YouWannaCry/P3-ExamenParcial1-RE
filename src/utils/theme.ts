type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "foodStoreTheme";

function getSavedTheme(): Theme {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function updateThemeButton(button: HTMLButtonElement, theme: Theme): void {
  const isDark = theme === "dark";

  button.setAttribute("aria-pressed", String(isDark));
  button.textContent = isDark ? "Modo claro" : "Modo oscuro";
}

export function setupThemeToggle(buttonId = "themeToggle"): void {
  const button = document.getElementById(buttonId) as HTMLButtonElement | null;
  let currentTheme = getSavedTheme();

  applyTheme(currentTheme);

  if (!button) {
    return;
  }

  updateThemeButton(button, currentTheme);

  button.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(currentTheme);
    updateThemeButton(button, currentTheme);
  });
}
