import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { accessScoreIcon } from "@/lib/icons";
import { accessScoreLabel } from "@/lib/labels";
import type { AccessScore } from "@/lib/schemas";
import { useTheme } from "@/theme/ThemeProvider";
import { AppText } from "./AppText";

// Bina puanı: renk, simge ve metin birlikte (WCAG 1.4.1). large: bina sayfasındaki büyük rozet
export function ScoreBadge({ score, large = false }: { score: AccessScore; large?: boolean }) {
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
        gap: large ? spacing.sm : spacing.xs,
        paddingHorizontal: large ? spacing.md : spacing.sm,
        paddingVertical: large ? spacing.sm : spacing.xs,
        borderRadius: large ? radius.md : radius.sm,
        borderWidth: large ? 2 : 1.5,
        borderColor: color,
      }}
    >
      <Ionicons name={accessScoreIcon[score]} size={large ? 32 : 18} color={color} importantForAccessibility="no" />
      <AppText variant={large ? "heading" : "label"} accessibilityRole="text" style={{ color }}>
        {accessScoreLabel[score]}
      </AppText>
    </View>
  );
}
