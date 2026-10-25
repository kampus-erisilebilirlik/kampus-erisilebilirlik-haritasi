import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useSettingsStore } from "@/store/settings";
import { palettes, radius, spacing, typography, type Theme } from "./tokens";

const buildTheme = (highContrast: boolean): Theme => ({
  colors: highContrast ? palettes.highContrast : palettes.normal,
  spacing,
  radius,
  typography,
  highContrast,
});

const ThemeContext = createContext<Theme>(buildTheme(false));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const highContrast = useSettingsStore((s) => s.highContrast);
  const theme = useMemo(() => buildTheme(highContrast), [highContrast]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
