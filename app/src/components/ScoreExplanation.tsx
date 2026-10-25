import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { accessScoreIcon } from "@/lib/icons";
import { accessScoreLabel, accessScoreRule } from "@/lib/labels";
import { accessScoreSchema, type AccessScore } from "@/lib/schemas";
import { useTheme } from "@/theme/ThemeProvider";
import { minTouchSize } from "@/theme/tokens";
import { AppText } from "./AppText";

// "Puan nasıl belirlenir?" (#15): kural docs/saha/puanlama.md'den, bu binanın puanı işaretlenir
export function ScoreExplanation({ current }: { current: AccessScore }) {
  const { colors, spacing } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: spacing.sm }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="Puan nasıl belirlenir?"
        style={{ minHeight: minTouchSize, flexDirection: "row", alignItems: "center", gap: spacing.sm }}
      >
        <Ionicons name={open ? "chevron-down" : "chevron-forward"} size={24} color={colors.primary} />
        <AppText style={{ color: colors.primary, fontWeight: "600" }}>Puan nasıl belirlenir?</AppText>
      </Pressable>
      {open && (
        <View style={{ gap: spacing.sm }}>
          {accessScoreSchema.options.map((score) => (
            <View
              key={score}
              accessible
              accessibilityLabel={`${accessScoreLabel[score]}${score === current ? " (bu bina)" : ""}: ${accessScoreRule[score]}`}
              style={{ flexDirection: "row", gap: spacing.sm }}
            >
              <Ionicons name={accessScoreIcon[score]} size={22} color={colors.score[score]} />
              <View style={{ flex: 1 }}>
                <AppText variant="label" style={{ color: colors.score[score] }}>
                  {score === current ? `${accessScoreLabel[score]} (bu bina)` : accessScoreLabel[score]}
                </AppText>
                <AppText>{accessScoreRule[score]}</AppText>
              </View>
            </View>
          ))}
          <AppText muted>
            Puan saha verisinden hesaplanır. Kural bir binada gerçeği yansıtmıyorsa ekip puanı düzeltir ve nedenini bina
            özetinde açıklar.
          </AppText>
        </View>
      )}
    </View>
  );
}
