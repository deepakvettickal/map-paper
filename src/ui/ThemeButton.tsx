import { UI_THEMES, usePoster, type UiTheme } from "../store";

const LABEL: Record<UiTheme, string> = {
  light: "Light interface",
  dark: "Dark interface",
  amoled: "AMOLED black interface",
};

/** Sun, crescent moon, and a moon in full eclipse for AMOLED black. */
function Icon({ theme }: { theme: UiTheme }) {
  if (theme === "light") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
      </svg>
    );
  }
  if (theme === "dark") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="8.2" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

/** One button that cycles light, dark and AMOLED, showing the current theme. */
export function ThemeButton() {
  const uiTheme = usePoster((s) => s.uiTheme);
  const set = usePoster((s) => s.set);
  const next = UI_THEMES[(UI_THEMES.indexOf(uiTheme) + 1) % UI_THEMES.length];

  return (
    <button
      className="icon"
      title={`${LABEL[uiTheme]} · click for ${next}`}
      aria-label={`Interface theme: ${uiTheme}. Switch to ${next}.`}
      onClick={() => set({ uiTheme: next })}
    >
      <Icon theme={uiTheme} />
    </button>
  );
}
