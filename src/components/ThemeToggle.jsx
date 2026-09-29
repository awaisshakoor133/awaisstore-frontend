import { useEffect, useState } from "react";

// Sets data-theme="light" | "dark" on <html> (your CSS reads [data-theme="dark"])
function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return [theme, toggle];
}

export default function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <span className="icon-moon">🌙</span>
      <span className="icon-sun">☀️</span>
    </button>
  );
}