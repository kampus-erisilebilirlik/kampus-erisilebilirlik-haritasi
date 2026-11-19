import type { PressableProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { minTouchSize } from "@/theme/tokens";
import { AppPressable } from "./AppPressable";
import { AppText } from "./AppText";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  variant?: "primary" | "secondary";
};

export function AppButton({ label, variant = "primary", disabled, style, ...rest }: Props) {
  const { colors, spacing, radius } = useTheme();
  const primary = variant === "primary";
  return (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={(state) => [
        {
          minHeight: minTouchSize,
          minWidth: minTouchSize,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.md,
          borderWidth: 2,
          borderColor: primary ? colors.primary : colors.border,
          backgroundColor: primary ? colors.primary : colors.background,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : state.pressed ? 0.8 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      <AppText variant="label" style={{ color: primary ? colors.onPrimary : colors.text }}>
        {label}
      </AppText>
    </AppPressable>
  );
}
