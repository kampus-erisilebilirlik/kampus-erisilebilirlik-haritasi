import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";

import { AppText } from "@/components/AppText";
import { privacySections } from "@/lib/info";
import { useTheme } from "@/theme/ThemeProvider";

// KVKK aydınlatma metni; başlıklar ekran okuyucuda bölüm bölüm gezilebilir
export default function KvkkScreen() {
  const { spacing } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl }}>
      <Stack.Screen options={{ title: "KVKK aydınlatma metni" }} />
      {privacySections.map((section) => (
        <View key={section.title} style={{ gap: spacing.xs }}>
          <AppText variant="heading">{section.title}</AppText>
          <AppText>{section.body}</AppText>
        </View>
      ))}
    </ScrollView>
  );
}
