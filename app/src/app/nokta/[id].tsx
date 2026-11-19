import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { InfoRow } from "@/components/InfoRow";
import { PointPhoto } from "@/components/PointPhoto";
import { StatusBadge } from "@/components/StatusBadge";
import { SyncStatus } from "@/components/SyncStatus";
import { Ts9111Notice } from "@/components/Ts9111Notice";
import { formatDate, formatNumber, yesNo } from "@/lib/format";
import { pointTypeIcon } from "@/lib/icons";
import { pointTypeLabel } from "@/lib/labels";
import { floorLabel } from "@/lib/points";
import { rampViolations } from "@/lib/ramp";
import type { Building, Point } from "@/lib/schemas";
import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";
import { minTouchSize } from "@/theme/tokens";

const handrailText: Record<number, string> = { 0: "Yok", 1: "Tek tarafta", 2: "İki tarafta" };

// Okuma sırası (#15): fotoğraf → başlık → durum → rampa / TS 9111 uyarısı → sözlü tarif → kılavuz iz
export default function PointScreen() {
  const { colors, spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const point = useDataStore((s) => s.points.find((p) => p.id === id));
  const building = useDataStore((s) =>
    point?.building_id ? s.buildings.find((b) => b.id === point.building_id) : undefined,
  );
  const status = useDataStore((s) => s.status);

  if (!point) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <Stack.Screen options={{ title: "Nokta" }} />
        <SyncStatus />
        {status !== "loading" && status !== "idle" && <AppText>Nokta bulunamadı. Silinmiş olabilir.</AppText>}
      </ScrollView>
    );
  }

  const floor = floorLabel(point.floor);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl }}>
      <Stack.Screen options={{ title: point.name }} />
      <SyncStatus />
      <PointPhoto point={point} buildingName={building?.name} />

      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <MaterialCommunityIcons
            name={pointTypeIcon[point.type]}
            size={28}
            color={colors.text}
            importantForAccessibility="no"
          />
          <AppText variant="label" muted>
            {pointTypeLabel[point.type]}
          </AppText>
        </View>
        <AppText variant="title">{point.name}</AppText>
        {building && <BuildingLink building={building} />}
        {floor && <AppText>{floor}</AppText>}
      </View>

      <View style={{ gap: spacing.xs }}>
        <StatusBadge status={point.status} />
        <AppText muted>{`Son güncelleme: ${formatDate(point.updated_at)}`}</AppText>
      </View>

      {point.type === "ramp" ? (
        <RampSection point={point} />
      ) : (
        point.ts9111_compliant !== null && <Ts9111Notice compliant={point.ts9111_compliant} />
      )}

      <AppText variant="heading">Sözlü tarif</AppText>
      <AppText style={{ fontSize: 18, lineHeight: 28 }}>
        {point.verbal_directions || "Bu nokta için sözlü tarif henüz eklenmedi."}
      </AppText>

      <InfoRow
        label="Kılavuz iz (hissedilebilir yüzey)"
        value={
          point.has_tactile_paving === null ? "Bilinmiyor" : point.has_tactile_paving ? "Girişten itibaren var" : "Yok"
        }
      />

      <ReportLinks point={point} />
    </ScrollView>
  );
}

// Bina adına dokununca bina detayı açılır
function BuildingLink({ building }: { building: Building }) {
  const { colors, spacing } = useTheme();
  return (
    <Link href={{ pathname: "/bina/[slug]", params: { slug: building.slug } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Bina: ${building.name}`}
        accessibilityHint="Bina sayfasını açar"
        style={({ pressed }) => ({
          minHeight: minTouchSize,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.xs,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <MaterialCommunityIcons name="office-building" size={22} color={colors.primary} />
        <AppText style={{ flex: 1, color: colors.primary, textDecorationLine: "underline", fontWeight: "600" }}>
          {building.name}
        </AppText>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
      </Pressable>
    </Link>
  );
}

// Sorun bildir (#26); arızalı görünen noktada düzeldiğini bildirmek için ikinci düğme
function ReportLinks({ point }: { point: Point }) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Link href={{ pathname: "/bildir/[pointId]", params: { pointId: point.id } }} asChild>
        <AppButton label="Sorun bildir" variant="secondary" accessibilityHint="Anonim bildirim formunu açar" />
      </Link>
      {point.status === "broken" && (
        <Link href={{ pathname: "/bildir/[pointId]", params: { pointId: point.id, durum: "working" } }} asChild>
          <AppButton label="Bu nokta düzeldi mi? Bildirin" variant="secondary" />
        </Link>
      )}
    </View>
  );
}

function RampSection({ point }: { point: Point }) {
  const { spacing } = useTheme();
  const handrail =
    point.ramp_handrail_sides != null
      ? (handrailText[point.ramp_handrail_sides] ?? "Bilinmiyor")
      : yesNo(point.ramp_has_handrail);
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="heading">Rampa ölçümleri</AppText>
      <View>
        <InfoRow
          label="Eğim"
          value={point.ramp_slope_pct === null ? "Ölçülmedi" : `%${formatNumber(point.ramp_slope_pct)}`}
        />
        <InfoRow label="Genişlik" value={point.ramp_width_cm === null ? "Ölçülmedi" : `${point.ramp_width_cm} cm`} />
        <InfoRow label="Korkuluk" value={handrail} />
      </View>
      <Ts9111Notice compliant={point.ts9111_compliant} violations={rampViolations(point)} />
    </View>
  );
}
