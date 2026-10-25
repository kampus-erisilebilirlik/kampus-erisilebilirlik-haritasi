import { FlatList, View } from "react-native";

import { AppText } from "@/components/AppText";
import { StatusBadge } from "@/components/StatusBadge";
import { SyncStatus } from "@/components/SyncStatus";
import { pointTypeLabel } from "@/lib/labels";
import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";

export default function ListScreen() {
  const { colors, spacing } = useTheme();
  const points = useDataStore((s) => s.points);
  return (
    <FlatList
      data={points}
      keyExtractor={(p) => p.id}
      contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
      ListHeaderComponent={<SyncStatus />}
      ListEmptyComponent={<AppText muted>Henüz kayıtlı nokta yok.</AppText>}
      renderItem={({ item }) => (
        <View
          style={{
            padding: spacing.md,
            gap: spacing.xs,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            backgroundColor: colors.surface,
          }}
        >
          <AppText variant="heading">{item.name}</AppText>
          <AppText muted>{pointTypeLabel[item.type]}</AppText>
          <StatusBadge status={item.status} />
        </View>
      )}
    />
  );
}
