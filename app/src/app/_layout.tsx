import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/AppText";
import { envResult } from "@/lib/env";
import { getSupabase } from "@/lib/supabase";
import { useDataStore } from "@/store/data";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

function EnvError({ message }: { message: string }) {
  const { colors, spacing } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md }}>
      <AppText variant="title">Yapılandırma hatası</AppText>
      <AppText>{message}</AppText>
    </SafeAreaView>
  );
}

function useInitialSync() {
  useEffect(() => {
    // Önbellek yüklenmeden çekilen veri, geç gelen önbellek tarafından ezilmesin
    const start = () => {
      void useDataStore.getState().load();
      getSupabase()
        .rpc("log_app_open")
        .then(
          () => undefined,
          () => undefined,
        );
    };
    if (useDataStore.persist.hasHydrated()) {
      start();
      return;
    }
    return useDataStore.persist.onFinishHydration(start);
  }, []);
}

function AppStack() {
  const { colors, highContrast } = useTheme();
  useInitialSync();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={highContrast ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="olcum" options={{ title: "Eğim ölçer" }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>{envResult.ok ? <AppStack /> : <EnvError message={envResult.message} />}</ThemeProvider>
    </SafeAreaProvider>
  );
}
