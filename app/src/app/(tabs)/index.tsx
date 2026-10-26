import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { CampusMap, type CampusMapHandle } from "@/components/CampusMap";
import { FilterBar } from "@/components/FilterBar";
import { NearestPanel, nearestProblemMessage, type NearestState } from "@/components/NearestPanel";
import { SelectionCard, type SelectionTarget } from "@/components/SelectionCard";
import { SyncStatus } from "@/components/SyncStatus";
import { toLatLng, type MapSelection } from "@/lib/campus";
import { formatDistance } from "@/lib/format";
import { findNearby, nearbyAnnouncement, typeName, type Nearby } from "@/lib/nearby";
import type { Building, Point, PointType } from "@/lib/schemas";
import { useLocation } from "@/lib/useLocation";
import { useDataStore } from "@/store/data";
import { useFilteredPoints, useFilterStore } from "@/store/filters";
import { useTheme } from "@/theme/ThemeProvider";

function resolve(selection: MapSelection | null, buildings: Building[], points: Point[]): SelectionTarget | null {
  if (selection?.kind === "building") {
    const building = buildings.find((b) => b.id === selection.id);
    return building ? { kind: "building", building } : null;
  }
  if (selection?.kind === "point") {
    const point = points.find((p) => p.id === selection.id);
    return point ? { kind: "point", point } : null;
  }
  return null;
}

export default function MapScreen() {
  const { spacing } = useTheme();
  const mapRef = useRef<CampusMapHandle>(null);
  const buildings = useDataStore((s) => s.buildings);
  const allPoints = useDataStore((s) => s.points);
  const filtered = useFilteredPoints();
  const types = useFilterStore((s) => s.types);
  const status = useDataStore((s) => s.status);
  const { permission, locating, checkPermission, locate } = useLocation();
  const [selection, setSelection] = useState<MapSelection | null>(null);
  const [nearest, setNearest] = useState<NearestState | null>(null);
  const [lastType, setLastType] = useState<PointType | null>(null);

  useEffect(() => {
    void checkPermission();
  }, [checkPermission]);

  const found = nearest?.step === "result" && nearest.result.kind === "found" ? nearest.result : null;
  // Arama sonucu filtre dışında kalsa da haritada ve kartta gösterilir
  const mapPoints = useMemo(() => {
    if (!found) return filtered;
    const ids = new Set(filtered.map((p) => p.id));
    return [...filtered, ...found.items.filter((p) => !ids.has(p.id))];
  }, [filtered, found]);
  // Filtre seçili noktayı gizlerse kart da kapanır; bina işaretleri filtreden etkilenmez
  const target = resolve(selection, buildings, mapPoints);
  const nearby: Nearby | undefined =
    target?.kind === "point" ? found?.items.find((p) => p.id === target.point.id) : undefined;
  // Filtrede tek tür seçiliyse "en yakın" doğrudan o türü arar
  const singleType = types.length === 1 ? types[0]! : null;

  async function search(type: PointType) {
    setLastType(type);
    const fix = await locate();
    if (!fix.ok) {
      setNearest({ step: "problem", reason: fix.reason });
      AccessibilityInfo.announceForAccessibility(nearestProblemMessage(fix.reason));
      return;
    }
    const result = findNearby(allPoints, type, fix.position);
    setNearest({ step: "result", result, accuracyM: fix.accuracyM });
    if (result.kind === "found") {
      const first = result.items[0]!;
      setSelection({ kind: "point", id: first.id });
      mapRef.current?.focus(toLatLng(first));
    } else {
      setSelection(null);
      AccessibilityInfo.announceForAccessibility(nearbyAnnouncement(result, buildings));
    }
  }

  function showOnMap(point: Nearby) {
    setSelection({ kind: "point", id: point.id });
    mapRef.current?.focus(toLatLng(point));
  }

  // İlk sonuç kartta tam cümleyle, diğerleri mesafesiyle duyurulur
  const announcement =
    nearby && found
      ? nearby.id === found.items[0]?.id
        ? nearbyAnnouncement(found, buildings)
        : `${nearby.name} seçildi, ${formatDistance(nearby.distance)}`
      : undefined;

  return (
    <View style={{ flex: 1 }}>
      <FilterBar />
      <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
        <AppButton
          label={locating ? "Konum alınıyor…" : singleType ? `Bana en yakın ${typeName(singleType)}` : "Bana en yakın…"}
          disabled={locating}
          accessibilityState={{ disabled: locating, busy: locating }}
          accessibilityHint="Konumunuz yalnızca telefonda kullanılır, sunucuya gönderilmez"
          onPress={() => (singleType ? void search(singleType) : setNearest({ step: "choose" }))}
        />
      </View>
      {nearest && (
        <NearestPanel
          state={nearest}
          onChoose={(type) => void search(type)}
          onSelect={showOnMap}
          onRetry={() => lastType && void search(lastType)}
          onClose={() => setNearest(null)}
        />
      )}
      {status !== "ready" && (
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
          <SyncStatus />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <CampusMap
          ref={mapRef}
          buildings={buildings}
          points={mapPoints}
          selection={selection}
          onSelect={setSelection}
          showsUserLocation={permission === "granted"}
        />
        {target && (
          <SelectionCard target={target} onClose={() => setSelection(null)} announcement={announcement}>
            {nearby && <AppText variant="label">{`Kuş uçuşu ${formatDistance(nearby.distance)}`}</AppText>}
          </SelectionCard>
        )}
      </View>
    </View>
  );
}
