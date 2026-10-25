import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { InfoRow } from "@/components/InfoRow";
import { PointRow } from "@/components/PointRow";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ScoreExplanation } from "@/components/ScoreExplanation";
import { SyncStatus } from "@/components/SyncStatus";
import { formatDate } from "@/lib/format";
import { pointTypeLabel, pointTypePluralLabel } from "@/lib/labels";
import { sortPoints } from "@/lib/points";
import { pointTypeSchema } from "@/lib/schemas";
import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";

// Bina özeti. QR sayfası (#27) uygulama yüklüyse kampuserisim://bina/<slug> ile buraya açar
export default function BuildingScreen() {
  const { spacing } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const building = useDataStore((s) => s.buildings.find((b) => b.slug === slug));
  const points = useDataStore((s) => s.points);
  const status = useDataStore((s) => s.status);

  // Her tür için noktalar; olmayan tür de listelenir, eksiklik de bir bilgidir
  const groups = useMemo(() => {
    const inBuilding = building ? sortPoints(points.filter((p) => p.building_id === building.id)) : [];
    return pointTypeSchema.options.map((type) => ({ type, points: inBuilding.filter((p) => p.type === type) }));
  }, [points, building]);

  if (!building) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <Stack.Screen options={{ title: "Bina" }} />
        <SyncStatus />
        {status !== "loading" && status !== "idle" && (
          <>
            <AppText>Bina bulunamadı.</AppText>
            <Link href="/" asChild>
              <AppButton label="Haritaya dön" />
            </Link>
          </>
        )}
      </ScrollView>
    );
  }

  const present = groups.filter((g) => g.points.length > 0);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl }}>
      <Stack.Screen options={{ title: building.name }} />
      <SyncStatus />
      <ScoreBadge score={building.score} large />
      {building.summary !== "" && <AppText>{building.summary}</AppText>}
      <ScoreExplanation current={building.score} />

      <View>
        {groups.map(({ type, points: group }) => {
          const broken = group.filter((p) => p.status === "broken").length;
          const value =
            group.length === 0 ? "Bulunmuyor" : broken > 0 ? `${group.length} (${broken} arızalı)` : `${group.length}`;
          return <InfoRow key={type} label={pointTypeLabel[type]} value={value} />;
        })}
        <InfoRow label="Son güncelleme" value={formatDate(building.updated_at)} />
      </View>

      {present.map(({ type, points: group }) => (
        <View key={type} style={{ gap: spacing.sm }}>
          <AppText variant="heading">{`${pointTypePluralLabel[type]} (${group.length})`}</AppText>
          {group.map((point) => (
            <PointRow key={point.id} point={point} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
