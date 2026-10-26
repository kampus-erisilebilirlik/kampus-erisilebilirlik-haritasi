import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { SectionList, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { FilterBar } from "@/components/FilterBar";
import { PointRow } from "@/components/PointRow";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SyncStatus } from "@/components/SyncStatus";
import { nearest } from "@/lib/geo";
import { groupByBuilding, type BuildingSection } from "@/lib/points";
import { useLocation } from "@/lib/useLocation";
import { useDataStore } from "@/store/data";
import { isFilterActive, useFilteredPoints, useFilterStore } from "@/store/filters";
import { useTheme } from "@/theme/ThemeProvider";

const DISTANCE_KEY = "mesafe";

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
  const { permission, locating, last, checkPermission, locate } = useLocation();
  const [byName, setByName] = useState(false);
  const active = isFilterActive({ types, onlyWorking });

  useEffect(() => {
    void checkPermission();
  }, [checkPermission]);
  // İzin önceden verildiyse sormadan konum alınır; açılışta izin istenmez
  useEffect(() => {
    if (permission === "granted" && !last) void locate();
  }, [permission, last, locate]);

  // Konum varsa yakından uzağa tek liste, yoksa bina adına göre bölümler
  const distances = useMemo(
    () => (last && !byName ? nearest(last.position, points, points.length) : null),
    [last, byName, points],
  );
  const sections = useMemo<BuildingSection[]>(() => {
    if (distances) return distances.length > 0 ? [{ key: DISTANCE_KEY, building: null, data: distances }] : [];
    const all = groupByBuilding(buildings, points);
    // Filtre etkinken uygun noktası olmayan binalar gizlenir
    return active ? all.filter((s) => s.data.length > 0) : all;
  }, [distances, buildings, points, active]);
  const distanceOf = useMemo(() => new Map(distances?.map((p) => [p.id, p.distance])), [distances]);

  const sortBar = (
    <View style={{ gap: spacing.sm }}>
      <SyncStatus />
      <AppText muted>
        {distances ? "Konumunuza göre yakından uzağa sıralandı (kuş uçuşu)." : "Bina adına göre sıralandı."}
      </AppText>
      {distances ? (
        <AppButton label="Bina adına göre sırala" variant="secondary" onPress={() => setByName(true)} />
      ) : (
        <AppButton
          label={locating ? "Konum alınıyor…" : "Konumuma göre sırala"}
          variant="secondary"
          disabled={locating}
          accessibilityState={{ disabled: locating, busy: locating }}
          accessibilityHint="Konumunuz yalnızca telefonda kullanılır, sunucuya gönderilmez"
          onPress={() => {
            setByName(false);
            if (!last) void locate();
          }}
        />
      )}
      {permission === "denied" && !distances && (
        <AppText muted>Konum izni verilmediği için liste bina adına göre sıralı.</AppText>
      )}
    </View>
  );

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
        ListHeaderComponent={sortBar}
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
        renderSectionHeader={({ section }) =>
          section.key === DISTANCE_KEY ? null : <SectionHeader section={section} />
        }
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? <AppText muted>Bu binada kayıtlı erişilebilirlik noktası yok.</AppText> : null
        }
        renderItem={({ item }) => <PointRow point={item} distance={distanceOf.get(item.id)} />}
      />
    </View>
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
