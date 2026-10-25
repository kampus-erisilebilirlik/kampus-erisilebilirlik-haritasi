import { View } from "react-native";

import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";

const formatter = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" });

// Bağlantı yokken önbellekteki verinin ne zamana ait olduğunu gösterir
export function SyncStatus() {
  const { spacing } = useTheme();
  const status = useDataStore((s) => s.status);
  const lastSyncedAt = useDataStore((s) => s.lastSyncedAt);
  const load = useDataStore((s) => s.load);

  if (status === "ready") return null;
  if (status === "loading" || status === "idle") {
    return (
      <AppText muted accessibilityLiveRegion="polite">
        Veriler güncelleniyor…
      </AppText>
    );
  }
  return (
    <View accessibilityLiveRegion="polite" style={{ gap: spacing.sm }}>
      <AppText>
        {lastSyncedAt
          ? `Bağlantı kurulamadı. ${formatter.format(new Date(lastSyncedAt))} tarihli kayıtlı veriler gösteriliyor.`
          : "Bağlantı kurulamadı ve kayıtlı veri yok. İnternet bağlantınızı kontrol edin."}
      </AppText>
      <AppButton label="Tekrar dene" variant="secondary" onPress={() => void load()} />
    </View>
  );
}
