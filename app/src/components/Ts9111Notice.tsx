import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { AppText } from "./AppText";

const STANDARD = "TS 9111 (Türk erişilebilirlik standardı)";
const DISCLAIMER = "Saha ölçümüne dayanan ön tespittir, kesin denetim değildir.";

type Props = {
  // Veri girişinden (#23) gelen ts9111_compliant; uygulama karar vermez
  compliant: boolean | null;
  // Aşılan kurallar (lib/ramp.ts), eşikler veya ölçümler yoksa boş
  violations?: string[];
};

export function Ts9111Notice({ compliant, violations = [] }: Props) {
  const { colors, spacing, radius } = useTheme();

  if (compliant === null) {
    return <AppText muted>{`${STANDARD} uygunluğu henüz değerlendirilmedi.`}</AppText>;
  }

  const color = compliant ? colors.status.working : colors.status.broken;
  const title = compliant ? `${STANDARD} ölçütlerine uygun` : `${STANDARD} ölçütlerini karşılamıyor`;
  const details = compliant ? [] : violations;
  return (
    <View
      accessible
      accessibilityLabel={[title, ...details, DISCLAIMER].join(". ")}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.md,
        borderWidth: 2,
        borderColor: color,
        borderRadius: radius.md,
      }}
    >
      <Ionicons
        name={compliant ? "checkmark-circle" : "warning"}
        size={28}
        color={color}
        importantForAccessibility="no"
      />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <AppText variant="label" style={{ color }}>
          {title}
        </AppText>
        {details.map((v) => (
          <AppText key={v}>{`• ${v}`}</AppText>
        ))}
        <AppText>{DISCLAIMER}</AppText>
      </View>
    </View>
  );
}
