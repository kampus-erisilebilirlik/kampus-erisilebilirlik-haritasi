import { ScrollView } from "react-native";

import { AppText } from "@/components/AppText";
import { SyncStatus } from "@/components/SyncStatus";
import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";

// Harita bileşeni #14'te eklenecek; şimdilik veri katmanının çalıştığını gösterir
export default function MapScreen() {
  const { spacing } = useTheme();
  const buildingCount = useDataStore((s) => s.buildings.length);
  const pointCount = useDataStore((s) => s.points.length);
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <SyncStatus />
      <AppText>{`${buildingCount} bina, ${pointCount} erişilebilirlik noktası`}</AppText>
    </ScrollView>
  );
}
