import { Link } from "expo-router";
import { useMemo } from "react";
import { SectionList, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { PointRow } from "@/components/PointRow";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SyncStatus } from "@/components/SyncStatus";
import { groupByBuilding, type BuildingSection } from "@/lib/points";
import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";

// Haritayı kullanamayanlar (ör. ekran okuyucu) için haritadaki her bilginin liste karşılığı
export default function ListScreen() {
  const { spacing } = useTheme();
  const buildings = useDataStore((s) => s.buildings);
  const points = useDataStore((s) => s.points);
  const status = useDataStore((s) => s.status);
  const load = useDataStore((s) => s.load);
  const sections = useMemo(() => groupByBuilding(buildings, points), [buildings, points]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(p) => p.id}
      contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
      stickySectionHeadersEnabled={false}
      refreshing={status === "loading"}
      onRefresh={() => void load()}
      ListHeaderComponent={<SyncStatus />}
      ListEmptyComponent={<AppText muted>Henüz kayıtlı nokta yok.</AppText>}
      renderSectionHeader={({ section }) => <SectionHeader section={section} />}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? <AppText muted>Bu binada kayıtlı erişilebilirlik noktası yok.</AppText> : null
      }
      renderItem={({ item }) => <PointRow point={item} />}
    />
  );
}

function SectionHeader({ section }: { section: BuildingSection }) {
  const { spacing } = useTheme();
  const { building } = section;
  if (!building) {
    return (
      <View style={{ paddingTop: spacing.md }}>
        <AppText variant="title">Bina dışı noktalar</AppText>
      </View>
    );
  }
  return (
    <View style={{ gap: spacing.xs, paddingTop: spacing.md }}>
      <AppText variant="title">{building.name}</AppText>
      <ScoreBadge score={building.score} />
      <Link href={{ pathname: "/bina/[slug]", params: { slug: building.slug } }} asChild>
        <AppButton
          label="Bina sayfasını aç"
          variant="secondary"
          accessibilityLabel={`${building.name}: Bina sayfasını aç`}
        />
      </Link>
    </View>
  );
}
