import { useState } from "react";
import { View } from "react-native";

import { CampusMap } from "@/components/CampusMap";
import { FilterBar } from "@/components/FilterBar";
import { SelectionCard, type SelectionTarget } from "@/components/SelectionCard";
import { SyncStatus } from "@/components/SyncStatus";
import type { MapSelection } from "@/lib/campus";
import type { Building, Point } from "@/lib/schemas";
import { useDataStore } from "@/store/data";
import { useFilteredPoints } from "@/store/filters";
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
  const buildings = useDataStore((s) => s.buildings);
  const points = useFilteredPoints();
  const status = useDataStore((s) => s.status);
  const [selection, setSelection] = useState<MapSelection | null>(null);
  // Filtre seçili noktayı gizlerse kart da kapanır; bina işaretleri filtreden etkilenmez
  const target = resolve(selection, buildings, points);

  return (
    <View style={{ flex: 1 }}>
      <FilterBar />
      {status !== "ready" && (
        <View style={{ padding: spacing.md }}>
          <SyncStatus />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <CampusMap buildings={buildings} points={points} selection={selection} onSelect={setSelection} />
        {target && <SelectionCard target={target} onClose={() => setSelection(null)} />}
      </View>
    </View>
  );
}
