import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link } from "expo-router";
import { useEffect, useMemo, type ReactNode } from "react";
import { AccessibilityInfo, Pressable, View } from "react-native";

import { pointTypeIcon } from "@/lib/icons";
import { facilitySummary, pointSubtitle } from "@/lib/points";
import type { Building, Point } from "@/lib/schemas";
import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";
import { minTouchSize } from "@/theme/tokens";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";
import { ScoreBadge } from "./ScoreBadge";
import { StatusBadge } from "./StatusBadge";

export type SelectionTarget = { kind: "building"; building: Building } | { kind: "point"; point: Point };

type Props = {
  target: SelectionTarget;
  onClose: () => void;
  // Varsayılan "<ad> seçildi" yerine ekran okuyucuya okunacak metin
  announcement?: string;
  // Özetin altına eklenen içerik ve eylemler
  children?: ReactNode;
};

// Haritada seçilen bina veya noktanın özet kartı
export function SelectionCard({ target, onClose, announcement, children }: Props) {
  const { colors, spacing, radius } = useTheme();
  const title = target.kind === "building" ? target.building.name : target.point.name;

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(announcement ?? `${title} seçildi`);
  }, [title, announcement]);

  return (
    <View
      style={{
        position: "absolute",
        left: spacing.sm,
        right: spacing.sm,
        bottom: spacing.sm,
        padding: spacing.md,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.background,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        {target.kind === "point" && (
          <MaterialCommunityIcons
            name={pointTypeIcon[target.point.type]}
            size={28}
            color={colors.text}
            importantForAccessibility="no"
          />
        )}
        <AppText variant="heading" style={{ flex: 1 }}>
          {title}
        </AppText>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Kartı kapat"
          style={{ width: minTouchSize, height: minTouchSize, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="close" size={28} color={colors.text} importantForAccessibility="no" />
        </Pressable>
      </View>
      {target.kind === "building" ? (
        <BuildingSummary building={target.building} />
      ) : (
        <PointSummary point={target.point} />
      )}
      {children}
    </View>
  );
}

function BuildingSummary({ building }: { building: Building }) {
  const points = useDataStore((s) => s.points);
  const facilities = useMemo(
    () => facilitySummary(points.filter((p) => p.building_id === building.id)),
    [points, building.id],
  );
  return (
    <>
      <ScoreBadge score={building.score} />
      {building.summary !== "" && <AppText numberOfLines={3}>{building.summary}</AppText>}
      <AppText muted>{facilities || "Bu binada kayıtlı erişilebilirlik noktası yok."}</AppText>
      <Link href={{ pathname: "/bina/[slug]", params: { slug: building.slug } }} asChild>
        <AppButton label="Bina sayfasını aç" />
      </Link>
    </>
  );
}

function PointSummary({ point }: { point: Point }) {
  const buildingName = useDataStore((s) => s.buildings.find((b) => b.id === point.building_id)?.name);
  return (
    <>
      <AppText muted>{pointSubtitle(point, buildingName)}</AppText>
      <StatusBadge status={point.status} />
      <Link href={{ pathname: "/nokta/[id]", params: { id: point.id } }} asChild>
        <AppButton label="Detayı aç" />
      </Link>
    </>
  );
}
