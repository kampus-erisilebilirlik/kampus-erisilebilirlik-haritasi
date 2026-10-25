import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";

import { pointTypeIcon } from "@/lib/icons";
import { pointTypeLabel } from "@/lib/labels";
import { photoUrl } from "@/lib/photos";
import type { Point } from "@/lib/schemas";
import { useTheme } from "@/theme/ThemeProvider";
import { AppText } from "./AppText";

// "Fotoğraf: Rampa, Ana giriş rampası, Teknoloji Fakültesi". Veride ayrı fotoğraf açıklaması yok
export function photoA11yLabel(point: Point, buildingName?: string): string {
  return `Fotoğraf: ${[pointTypeLabel[point.type], point.name, buildingName].filter(Boolean).join(", ")}`;
}

// Fotoğraf diskte önbelleklenir; çevrimdışıyken daha önce görülen fotoğraf açılır
export function PointPhoto({ point, buildingName }: { point: Point; buildingName?: string }) {
  const { colors, spacing, radius } = useTheme();
  const [failed, setFailed] = useState(false);

  if (!point.photo_path || failed) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
        }}
      >
        <MaterialCommunityIcons
          name={pointTypeIcon[point.type]}
          size={40}
          color={colors.textMuted}
          importantForAccessibility="no"
        />
        <AppText muted style={{ flex: 1 }}>
          {failed ? "Fotoğraf yüklenemedi." : "Bu nokta için fotoğraf yok."}
        </AppText>
      </View>
    );
  }

  return (
    <Image
      source={photoUrl(point.photo_path)}
      accessible
      accessibilityLabel={photoA11yLabel(point, buildingName)}
      contentFit="cover"
      transition={200}
      onError={() => setFailed(true)}
      style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.md }}
    />
  );
}
