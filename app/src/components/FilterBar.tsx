import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { AccessibilityInfo, Pressable, ScrollView, View } from "react-native";

import { pointTypeIcon } from "@/lib/icons";
import { pointTypeLabel } from "@/lib/labels";
import { pointTypeSchema, type PointType } from "@/lib/schemas";
import { isFilterActive, useFilteredPoints, useFilterStore } from "@/store/filters";
import { useTheme } from "@/theme/ThemeProvider";
import { minTouchSize } from "@/theme/tokens";
import { AppText } from "./AppText";

// Çipte kısa ad, ekran okuyucuda tam ad
const chipLabel: Record<PointType, string> = {
  ramp: "Rampa",
  elevator: "Asansör",
  toilet: "Tuvalet",
  parking: "Otopark",
  auto_door: "Otomatik kapı",
};

export function resultMessage(count: number): string {
  return count === 0 ? "Bu filtreye uygun nokta yok" : `${count} nokta gösteriliyor`;
}

type ChipProps = {
  label: string;
  accessibilityLabel: string;
  checked?: boolean;
  role?: "checkbox" | "button";
  hint?: string;
  icon?: ReactNode;
  onPress: () => void;
};

function Chip({ label, accessibilityLabel, checked = false, role = "checkbox", hint, icon, onPress }: ChipProps) {
  const { colors, spacing } = useTheme();
  const color = checked ? colors.onPrimary : colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={role === "checkbox" ? { checked } : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={hint}
      style={{
        minHeight: minTouchSize,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        borderWidth: 2,
        borderRadius: minTouchSize / 2,
        borderColor: checked ? colors.primary : colors.border,
        backgroundColor: checked ? colors.primary : colors.background,
      }}
    >
      {/* Seçili olduğu yalnızca dolgu rengiyle değil onay işaretiyle de belli olur */}
      {checked && <Ionicons name="checkmark" size={20} color={color} importantForAccessibility="no" />}
      {icon}
      <AppText variant="label" style={{ color }}>
        {label}
      </AppText>
    </Pressable>
  );
}

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

// Harita ve liste üstündeki ortak filtre (#16): türler, "Sadece çalışanlar", etkinse "Temizle"
export function FilterBar() {
  const { colors, spacing } = useTheme();
  const types = useFilterStore((s) => s.types);
  const onlyWorking = useFilterStore((s) => s.onlyWorking);
  const toggleType = useFilterStore((s) => s.toggleType);
  const setOnlyWorking = useFilterStore((s) => s.setOnlyWorking);
  const clear = useFilterStore((s) => s.clear);
  const count = useFilteredPoints().length;
  const message = resultMessage(count);
  const active = isFilterActive({ types, onlyWorking });

  // Sonuç yalnızca filtre değişince duyurulur; veri yenilenince ya da ilk açılışta değil
  const filterKey = `${[...types].sort().join(",")}|${onlyWorking}`;
  const announcedKey = useRef(filterKey);
  useEffect(() => {
    if (announcedKey.current === filterKey) return;
    announcedKey.current = filterKey;
    AccessibilityInfo.announceForAccessibility(message);
  }, [filterKey, message]);

  const icon = (name: IconName, checked: boolean) => (
    <MaterialCommunityIcons
      name={name}
      size={20}
      color={checked ? colors.onPrimary : colors.text}
      importantForAccessibility="no"
    />
  );

  return (
    <View style={{ backgroundColor: colors.background }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="toolbar"
        accessibilityLabel="Filtreler"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
      >
        {pointTypeSchema.options.map((type) => {
          const checked = types.includes(type);
          return (
            <Chip
              key={type}
              label={chipLabel[type]}
              accessibilityLabel={pointTypeLabel[type]}
              checked={checked}
              icon={icon(pointTypeIcon[type], checked)}
              onPress={() => toggleType(type)}
            />
          );
        })}
        <Chip
          label="Sadece çalışanlar"
          accessibilityLabel="Sadece çalışanlar"
          hint="Arızalı noktaları gizler"
          checked={onlyWorking}
          icon={icon("check-decagram", onlyWorking)}
          onPress={() => setOnlyWorking(!onlyWorking)}
        />
        {active && (
          <Chip
            label="Temizle"
            accessibilityLabel="Filtreleri temizle"
            role="button"
            icon={icon("close", false)}
            onPress={clear}
          />
        )}
      </ScrollView>
      <AppText variant="label" muted style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
        {message}
      </AppText>
    </View>
  );
}
