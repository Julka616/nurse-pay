// Pobierz aktualnie zapisany motyw (lub preferencję systemową, jeśli nic nie zapisano)
export const getTheme = () => {

  const saved = localStorage.getItem("theme");

  if (saved === "light" || saved === "dark") {
    return saved;
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";

};


// Nałóż motyw na całą aplikację (dodaje/usuwa klasę "dark" na <html>)
export const applyTheme = (theme) => {

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

};


// Zapisz i nałóż nowy motyw
export const setTheme = (theme) => {

  localStorage.setItem("theme", theme);

  applyTheme(theme);

};
