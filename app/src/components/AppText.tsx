import { Text, type TextProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import type { TextRole } from "@/theme/tokens";

type Props = TextProps & {
  variant?: TextRole;
  muted?: boolean;
};

// allowFontScaling bilerek kapatılmaz: sistem yazı boyutu her zaman uygulanır
export function AppText({ variant = "body", muted = false, style, ...rest }: Props) {
  const { colors, typography } = useTheme();
  return (
    <Text
      accessibilityRole={variant === "title" || variant === "heading" ? "header" : undefined}
      style={[typography[variant], { color: muted ? colors.textMuted : colors.text }, style]}
      {...rest}
    />
  );
}
