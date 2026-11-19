import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { AppText } from "@/components/AppText";
import { ReportForm } from "@/components/ReportForm";
import { SyncStatus } from "@/components/SyncStatus";
import { pointTypeLabel } from "@/lib/labels";
import { pointStatusSchema } from "@/lib/schemas";
import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";

// Anonim sorun bildirimi (#26). `durum` parametresi ön seçimi verir: "Bu nokta düzeldi mi?" → working
export default function ReportScreen() {
  const { spacing } = useTheme();
  const router = useRouter();
  const { pointId, durum } = useLocalSearchParams<{ pointId: string; durum?: string }>();
  const point = useDataStore((s) => s.points.find((p) => p.id === pointId));
  const building = useDataStore((s) =>
    point?.building_id ? s.buildings.find((b) => b.id === point.building_id) : undefined,
  );
  const status = useDataStore((s) => s.status);
  const initial = pointStatusSchema.safeParse(durum);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: "Sorun bildir" }} />
      {/* Klavye açıkken Gönder'e kaydırılarak ulaşılır; dokunuş klavyeyi kapatmadan düğmeye geçer */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl }}
      >
        <SyncStatus />
        {point ? (
          <>
            <View style={{ gap: spacing.xs }}>
              <AppText variant="title">{`Sorun bildir: ${point.name}`}</AppText>
              <AppText muted>{[pointTypeLabel[point.type], building?.name].filter(Boolean).join(" · ")}</AppText>
            </View>
            <ReportForm
              point={point}
              initialStatus={initial.success ? initial.data : "broken"}
              onDone={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            />
          </>
        ) : (
          status !== "loading" && status !== "idle" && <AppText>Nokta bulunamadı. Silinmiş olabilir.</AppText>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
