import { useMemo } from "react";
import { SectionList, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { FilterBar } from "@/components/FilterBar";
import { PointRow } from "@/components/PointRow";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SyncStatus } from "@/components/SyncStatus";
import { groupByBuilding, type BuildingSection } from "@/lib/points";
import { useDataStore } from "@/store/data";
import { isFilterActive, useFilteredPoints, useFilterStore } from "@/store/filters";
import { useTheme } from "@/theme/ThemeProvider";

// Haritayı kullanamayanlar (ör. ekran okuyucu) için haritadaki her bilginin liste karşılığı
export default function ListScreen() {
  const { spacing } = useTheme();
  const buildings = useDataStore((s) => s.buildings);
  const points = useFilteredPoints();
  const types = useFilterStore((s) => s.types);
  const onlyWorking = useFilterStore((s) => s.onlyWorking);
  const clear = useFilterStore((s) => s.clear);
  const status = useDataStore((s) => s.status);
  const load = useDataStore((s) => s.load);
  const active = isFilterActive({ types, onlyWorking });
  const sections = useMemo(() => {
    const all = groupByBuilding(buildings, points);
    // Filtre etkinken uygun noktası olmayan binalar gizlenir
    return active ? all.filter((s) => s.data.length > 0) : all;
  }, [buildings, points, active]);

  return (
    <View style={{ flex: 1 }}>
      <FilterBar />
      <SectionList
        sections={sections}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        stickySectionHeadersEnabled={false}
        refreshing={status === "loading"}
        onRefresh={() => void load()}
        ListHeaderComponent={<SyncStatus />}
        ListEmptyComponent={
          active ? (
            <View style={{ gap: spacing.sm }}>
              <AppText muted>Bu filtreye uygun nokta yok.</AppText>
              <AppButton label="Filtreleri temizle" variant="secondary" onPress={clear} />
            </View>
          ) : (
            <AppText muted>Henüz kayıtlı nokta yok.</AppText>
          )
        }
        renderSectionHeader={({ section }) => <SectionHeader section={section} />}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? <AppText muted>Bu binada kayıtlı erişilebilirlik noktası yok.</AppText> : null
        }
        renderItem={({ item }) => <PointRow point={item} />}
      />
    </View>
  );
}

function SectionHeader({ section }: { section: BuildingSection }) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.xs, paddingTop: spacing.md }}>
      <AppText variant="title">{section.building?.name ?? "Bina dışı noktalar"}</AppText>
      {section.building && <ScoreBadge score={section.building.score} />}
    </View>
  );
}
