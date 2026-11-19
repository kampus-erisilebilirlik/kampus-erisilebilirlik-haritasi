import { useState } from "react";
import { Pressable, type PressableProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

// Pressable + odak çerçevesi: harici klavye veya D-pad ile gezen kullanıcı odağın nerede olduğunu görür
// (WCAG 2.4.7, denetimdeki K6). Dokunmatik kullanımda odak olayı gelmez, çerçeve çıkmaz; outline yerleşimi kaydırmaz
export function AppPressable({ style, onFocus, onBlur, ...rest }: PressableProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const ring = focused
    ? { outlineColor: colors.focus, outlineStyle: "solid" as const, outlineWidth: 3, outlineOffset: 2 }
    : null;
  return (
    <Pressable
      {...rest}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={(state) => [typeof style === "function" ? style(state) : style, ring]}
    />
  );
}
