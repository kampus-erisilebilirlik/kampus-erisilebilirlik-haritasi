import { useState } from "react";
import { View } from "react-native";

import { CampusMap } from "@/components/CampusMap";
import { SelectionCard, type SelectionTarget } from "@/components/SelectionCard";
import { SyncStatus } from "@/components/SyncStatus";
import type { MapSelection } from "@/lib/campus";
import type { Building, Point } from "@/lib/schemas";
import { useDataStore } from "@/store/data";
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
  const points = useDataStore((s) => s.points);
  const status = useDataStore((s) => s.status);
  const [selection, setSelection] = useState<MapSelection | null>(null);
  const target = resolve(selection, buildings, points);

  return (
    <View style={{ flex: 1 }}>
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
