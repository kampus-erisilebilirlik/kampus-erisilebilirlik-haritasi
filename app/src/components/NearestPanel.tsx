import { Link } from "expo-router";
import { Linking, ScrollView, View } from "react-native";

import { formatDistance } from "@/lib/format";
import { pointTypeLabel, pointTypePluralLabel } from "@/lib/labels";
import { nearbyAnnouncement, type Nearby, type NearbyResult } from "@/lib/nearby";
import { pointA11yLabel, pointSubtitle } from "@/lib/points";
import { pointTypeSchema, type PointType } from "@/lib/schemas";
import { LOW_ACCURACY_M } from "@/lib/useLocation";
import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";
import { minTouchSize } from "@/theme/tokens";
import { AppButton } from "./AppButton";
import { AppPressable } from "./AppPressable";
import { AppText } from "./AppText";

export type NearestState =
  | { step: "choose" }
  | { step: "result"; result: NearbyResult; accuracyM: number | null }
  | { step: "problem"; reason: "denied" | "unavailable" };

export function nearestProblemMessage(reason: "denied" | "unavailable"): string {
  return reason === "denied"
    ? "Konum izni verilmedi. En yakın noktayı bulmak için konum gerekir; konumunuz yalnızca telefonda kullanılır, sunucuya gönderilmez."
    : "Konumunuz alınamadı. Telefonun konum hizmetinin açık olduğundan emin olup tekrar deneyin.";
}

type Props = {
  state: NearestState;
  onChoose: (type: PointType) => void;
  onSelect: (point: Nearby) => void;
  onRetry: () => void;
  onClose: () => void;
};

function ResultRow({ point, index, onPress }: { point: Nearby; index: number; onPress: () => void }) {
  const { colors, spacing } = useTheme();
  const buildingName = useDataStore((s) => s.buildings.find((b) => b.id === point.building_id)?.name);
  return (
    <AppPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${index + 1}. ${pointA11yLabel(point, buildingName)}, ${formatDistance(point.distance)}`}
      accessibilityHint="Haritada gösterir"
      style={({ pressed }) => ({
        minHeight: minTouchSize,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.xs,
        borderTopWidth: index === 0 ? 0 : 1,
        borderColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <AppText variant="label">{`${index + 1}. ${point.name}`}</AppText>
        <AppText muted>{pointSubtitle(point, buildingName)}</AppText>
      </View>
      <AppText variant="label">{formatDistance(point.distance, true)}</AppText>
    </AppPressable>
  );
}

// "Bana en yakın" (#17): tür seçimi, en yakın sonuçlar ve konum sorunları
export function NearestPanel({ state, onChoose, onSelect, onRetry, onClose }: Props) {
  const { colors, spacing, radius } = useTheme();
  const buildings = useDataStore((s) => s.buildings);
  const close = <AppButton label="Kapat" variant="secondary" onPress={onClose} />;

  let body;
  if (state.step === "choose") {
    body = (
      <>
        <AppText variant="heading">Hangi türü arıyorsunuz?</AppText>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {pointTypeSchema.options.map((type) => (
            <AppButton key={type} label={pointTypeLabel[type]} onPress={() => onChoose(type)} />
          ))}
        </View>
        <AppButton label="Vazgeç" variant="secondary" onPress={onClose} />
      </>
    );
  } else if (state.step === "problem") {
    body =
      state.reason === "denied" ? (
        <>
          <AppText>{nearestProblemMessage("denied")}</AppText>
          <AppButton label="Ayarları aç" onPress={() => void Linking.openSettings()} />
          <Link href="/liste" asChild>
            <AppButton label="Listeden bina seçerek devam et" variant="secondary" />
          </Link>
          {close}
        </>
      ) : (
        <>
          <AppText>{nearestProblemMessage("unavailable")}</AppText>
          <AppButton label="Tekrar dene" onPress={onRetry} />
          {close}
        </>
      );
  } else if (state.result.kind === "found") {
    const { result, accuracyM } = state;
    body = (
      <>
        <AppText variant="heading">{`En yakın ${pointTypePluralLabel[result.type].toLocaleLowerCase("tr-TR")}`}</AppText>
        <AppText muted>Kuş uçuşu mesafe; arızalı olanlar gösterilmez.</AppText>
        {accuracyM !== null && accuracyM > LOW_ACCURACY_M && (
          <AppText>{`Konum hassasiyeti düşük (yaklaşık ${Math.round(accuracyM)} metre); mesafeler yaklaşıktır.`}</AppText>
        )}
        <View>
          {result.items.map((point, index) => (
            <ResultRow key={point.id} point={point} index={index} onPress={() => onSelect(point)} />
          ))}
        </View>
        {close}
      </>
    );
  } else {
    body = (
      <>
        <AppText>{nearbyAnnouncement(state.result, buildings)}</AppText>
        {close}
      </>
    );
  }

  // Büyük yazıda harita tamamen kaybolmasın diye panel sınırlı yükseklikte kayar
  return (
    <ScrollView
      style={{
        maxHeight: 320,
        flexGrow: 0,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
      }}
      contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
    >
      {body}
    </ScrollView>
  );
}
