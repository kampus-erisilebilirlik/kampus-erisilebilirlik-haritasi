import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link } from "expo-router";
import { View } from "react-native";

import { formatDistance, formatNumber } from "@/lib/format";
import { pointTypeIcon } from "@/lib/icons";
import { pointA11yLabel, pointSubtitle } from "@/lib/points";
import type { Point } from "@/lib/schemas";
import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";
import { AppPressable } from "./AppPressable";
import { AppText } from "./AppText";
import { StatusBadge } from "./StatusBadge";

// Nokta detayına giden liste satırı: tür simgesi, ad, tür · bina · kat, durum ve (konum varsa) mesafe;
// ekran okuyucu satırı tek parça okur
export function PointRow({ point, distance }: { point: Point; distance?: number }) {
  const { colors, spacing, radius } = useTheme();
  const buildingName = useDataStore((s) => s.buildings.find((b) => b.id === point.building_id)?.name);
  const label = pointA11yLabel(point, buildingName);
  return (
    <Link href={{ pathname: "/nokta/[id]", params: { id: point.id } }} asChild>
      <AppPressable
        accessibilityRole="link"
        accessibilityLabel={distance === undefined ? label : `${label}, ${formatDistance(distance)}`}
        accessibilityHint="Ayrıntıları açar"
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <MaterialCommunityIcons name={pointTypeIcon[point.type]} size={28} color={colors.text} />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText variant="heading">{point.name}</AppText>
          <AppText muted>{pointSubtitle(point, buildingName)}</AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
            <StatusBadge status={point.status} />
            {point.type === "ramp" && point.ramp_slope_pct !== null && (
              <View
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  borderRadius: radius.sm,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: point.ts9111_compliant === false ? colors.status.broken : colors.border,
                }}
              >
                <AppText
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: point.ts9111_compliant === false ? colors.status.broken : colors.text,
                  }}
                >
                  {`Eğim: %${formatNumber(point.ramp_slope_pct)}`}
                </AppText>
              </View>
            )}
          </View>
        </View>
        {distance !== undefined && <AppText variant="label">{formatDistance(distance, true)}</AppText>}
        <MaterialCommunityIcons name="chevron-right" size={28} color={colors.textMuted} />
      </AppPressable>
    </Link>
  );
}
