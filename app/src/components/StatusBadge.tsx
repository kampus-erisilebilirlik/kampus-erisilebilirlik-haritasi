import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { View } from "react-native";

import { pointStatusLabel } from "@/lib/labels";
import type { PointStatus } from "@/lib/schemas";
import { useTheme } from "@/theme/ThemeProvider";
import { AppText } from "./AppText";

const icons: Record<PointStatus, ComponentProps<typeof Ionicons>["name"]> = {
  working: "checkmark-circle",
  broken: "close-circle",
  unknown: "help-circle",
};

// Durum yalnızca renkle değil ikon ve metinle de verilir (WCAG 1.4.1)
export function StatusBadge({ status }: { status: PointStatus }) {
  const { colors, spacing, radius } = useTheme();
  const color = colors.status[status];
  return (
    <View
      accessible
      accessibilityLabel={`Durum: ${pointStatusLabel[status]}`}
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
      <Ionicons name={icons[status]} size={18} color={color} importantForAccessibility="no" />
      <AppText variant="label" style={{ color }}>
        {pointStatusLabel[status]}
      </AppText>
    </View>
  );
}
