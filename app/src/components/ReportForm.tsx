import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { useRef, useState } from "react";
import { AccessibilityInfo, Pressable, TextInput, View } from "react-native";

import { MAX_DESCRIPTION_LENGTH, submitReport, validateReport } from "@/lib/reports";
import type { Point, PointStatus } from "@/lib/schemas";
import { useTheme } from "@/theme/ThemeProvider";
import { minTouchSize } from "@/theme/tokens";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Option = { status: PointStatus; label: string; icon: IconName };

// "unknown" bildirimi "bilgi yanlış" anlamında kullanılır; açıklama zorunludur (#26)
export function reportOptions(current: PointStatus): Option[] {
  return [
    { status: "broken", label: "Çalışmıyor / arızalı", icon: "close-circle" },
    { status: "working", label: current === "broken" ? "Tekrar çalışıyor" : "Çalışıyor", icon: "checkmark-circle" },
    { status: "unknown", label: "Bilgi yanlış (yer, kat, tarif)", icon: "alert-circle" },
  ];
}

export const SUCCESS_MESSAGE =
  "Teşekkürler! Bildiriminiz Engelli Öğrenci Birimi'ne iletildi. İncelendikten sonra haritada güncellenecek.";

type Props = {
  point: Point;
  initialStatus: PointStatus;
  onDone: () => void;
};

type Result = { kind: "success" } | { kind: "error"; message: string } | null;

export function ReportForm({ point, initialStatus, onDone }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const [status, setStatus] = useState<PointStatus>(initialStatus);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);
  // Çift dokunuşta state güncellenmeden ikinci gönderim başlamasın
  const sending = useRef(false);

  const options = reportOptions(point.status);
  const invalid = validateReport({ pointId: point.id, status, description });
  const remaining = MAX_DESCRIPTION_LENGTH - description.length;

  const send = async () => {
    if (sending.current || invalid) return;
    sending.current = true;
    setBusy(true);
    setResult(null);
    const res = await submitReport({ pointId: point.id, status, description });
    sending.current = false;
    setBusy(false);
    if (res.ok) {
      setResult({ kind: "success" });
      AccessibilityInfo.announceForAccessibility(SUCCESS_MESSAGE);
    } else {
      // Form verisi korunur, kullanıcı aynı içerikle tekrar deneyebilir
      setResult({ kind: "error", message: res.message });
      AccessibilityInfo.announceForAccessibility(`Gönderilemedi. ${res.message}`);
    }
  };

  if (result?.kind === "success") {
    return (
      <View style={{ gap: spacing.md }}>
        <ResultBox tone="success" title="Bildiriminiz alındı" message={SUCCESS_MESSAGE} />
        <AppButton label="Noktaya dön" onPress={onDone} />
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      <AppText variant="heading">Ne oldu?</AppText>
      <View accessibilityRole="radiogroup" accessibilityLabel="Ne oldu?" style={{ gap: spacing.sm }}>
        {options.map((o) => {
          const checked = status === o.status;
          const color = checked ? colors.onPrimary : colors.text;
          return (
            <Pressable
              key={o.status}
              accessibilityRole="radio"
              accessibilityState={{ checked }}
              accessibilityLabel={o.label}
              onPress={() => setStatus(o.status)}
              style={{
                minHeight: minTouchSize,
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderWidth: 2,
                borderRadius: radius.md,
                borderColor: checked ? colors.primary : colors.border,
                backgroundColor: checked ? colors.primary : colors.background,
              }}
            >
              {/* Seçim dolgu rengine ek olarak dolu/boş daireyle de belli olur */}
              <Ionicons
                name={checked ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={color}
                importantForAccessibility="no"
              />
              <Ionicons name={o.icon} size={22} color={color} importantForAccessibility="no" />
              <AppText style={{ flex: 1, color }}>{o.label}</AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: spacing.xs }}>
        <AppText variant="label" importantForAccessibility="no" accessibilityElementsHidden>
          {status === "unknown" ? "Açıklama (zorunlu)" : "Açıklama (isteğe bağlı)"}
        </AppText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={MAX_DESCRIPTION_LENGTH}
          placeholder="Örn: Asansör 2. katta duruyor, kapısı açılmıyor."
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={status === "unknown" ? "Açıklama, zorunlu" : "Açıklama, isteğe bağlı"}
          accessibilityHint="Kişisel bilgi yazmayın"
          textAlignVertical="top"
          style={{
            ...typography.body,
            minHeight: 120,
            padding: spacing.sm,
            borderWidth: 2,
            borderRadius: radius.md,
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: colors.background,
          }}
        />
        <AppText variant="label" muted accessibilityLiveRegion="polite">
          {`${description.length} / ${MAX_DESCRIPTION_LENGTH}`}
        </AppText>
        {remaining === 0 && <AppText muted>Karakter sınırına ulaştınız.</AppText>}
        <AppText muted>Lütfen ad, telefon gibi kişisel bilgi yazmayın.</AppText>
      </View>

      {invalid && status === "unknown" && <AppText muted>{invalid}</AppText>}

      {result?.kind === "error" && <ResultBox tone="error" title="Gönderilemedi" message={result.message} />}

      <AppButton
        label={busy ? "Gönderiliyor…" : result?.kind === "error" ? "Tekrar dene" : "Gönder"}
        disabled={busy || invalid !== null}
        accessibilityState={{ disabled: busy || invalid !== null, busy }}
        onPress={() => void send()}
      />
      <AppText muted>Bildirim anonimdir. Yönetici onaylamadan noktanın durumu değişmez.</AppText>
    </View>
  );
}

function ResultBox({ tone, title, message }: { tone: "success" | "error"; title: string; message: string }) {
  const { colors, spacing, radius } = useTheme();
  const color = tone === "success" ? colors.status.working : colors.status.broken;
  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${message}`}
      accessibilityLiveRegion="assertive"
      style={{
        flexDirection: "row",
        gap: spacing.sm,
        padding: spacing.md,
        borderWidth: 2,
        borderRadius: radius.md,
        borderColor: color,
        backgroundColor: colors.surface,
      }}
    >
      <Ionicons
        name={tone === "success" ? "checkmark-circle" : "alert-circle"}
        size={28}
        color={color}
        importantForAccessibility="no"
      />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <AppText variant="heading" style={{ color }}>
          {title}
        </AppText>
        <AppText>{message}</AppText>
      </View>
    </View>
  );
}
