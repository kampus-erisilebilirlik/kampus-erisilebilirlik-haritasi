import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { accessScoreIcon } from "@/lib/icons";
import { accessScoreLabel } from "@/lib/labels";
import type { AccessScore } from "@/lib/schemas";
import { useTheme } from "@/theme/ThemeProvider";
import { AppText } from "./AppText";

// Bina puanı: renk, simge ve metin birlikte (WCAG 1.4.1)
export function ScoreBadge({ score }: { score: AccessScore }) {
  const { colors, spacing, radius } = useTheme();
  const color = colors.score[score];
  return (
    <View
      accessible
      accessibilityLabel={`Erişilebilirlik puanı: ${accessScoreLabel[score]}`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
        borderWidth: 1.5,
        borderColor: color,
      }}
    >
      <Ionicons name={accessScoreIcon[score]} size={18} color={color} importantForAccessibility="no" />
      <AppText variant="label" style={{ color }}>
        {accessScoreLabel[score]}
      </AppText>
    </View>
  );
}
