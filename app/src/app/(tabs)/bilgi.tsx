import { Link } from "expo-router";
import { ScrollView, Switch, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { InfoSections } from "@/components/InfoSections";
import { VersionFooter } from "@/components/VersionFooter";
import { teamToolsEnabled } from "@/lib/featureFlags";
import { useSettingsStore } from "@/store/settings";
import { useTheme } from "@/theme/ThemeProvider";
import { minTouchSize } from "@/theme/tokens";

// Üstte birim, hizmetler, haklar, uygulama hakkında ve gizlilik; altta ayarlar ve sürüm
export default function InfoScreen() {
  const { colors, spacing } = useTheme();
  const highContrast = useSettingsStore((s) => s.highContrast);
  const setHighContrast = useSettingsStore((s) => s.setHighContrast);
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <InfoSections />
      <AppText variant="heading">Görünüm</AppText>
      <AppText muted>Yazı boyutunu telefonunuzun Ayarlar → Ekran bölümünden büyütebilirsiniz.</AppText>
      <View
        style={{ minHeight: minTouchSize, flexDirection: "row", alignItems: "center", gap: spacing.md }}
      >
        <AppText style={{ flex: 1 }} importantForAccessibility="no" accessibilityElementsHidden>
          Yüksek kontrast
        </AppText>
        <Switch
          value={highContrast}
          onValueChange={setHighContrast}
          accessibilityLabel="Yüksek kontrast"
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>
      {/* Ekip aracı: #5'te yalnızca admin oturumunda gösterilecek */}
      {teamToolsEnabled && (
        <Link href="/olcum" asChild>
          <AppButton label="Eğim ölçer (ekip)" variant="secondary" />
        </Link>
      )}
      <VersionFooter />
    </ScrollView>
  );
}
