import { View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { AppText } from "./AppText";

// Ekran okuyucu satırı "etiket: değer" olarak tek parça okur
export function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={{ paddingVertical: spacing.sm, gap: 2, borderBottomWidth: 1, borderColor: colors.border }}
    >
      <AppText variant="label" muted>
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </View>
  );
}
