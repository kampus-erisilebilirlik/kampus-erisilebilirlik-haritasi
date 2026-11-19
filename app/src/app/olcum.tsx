import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { useAccelerometer } from "@/hooks/useAccelerometer";
import { averageSample, isSteady, median, riseRunPercent, slopeAngle, slopePercent } from "@/lib/slope";
import { checkRamp, type Handrail } from "@/lib/ts9111";
import { useCalibrationStore } from "@/store/calibration";
import { useTheme } from "@/theme/ThemeProvider";
import { minTouchSize } from "@/theme/tokens";

// Ekip için eğim ölçer (#22). Yöntem: docs/saha/olcum-yontemi.md
const RECORD_MS = 2000;
const MEASUREMENTS = 3;
const handrailOptions: { value: Handrail; label: string }[] = [
  { value: "both", label: "İki tarafta" },
  { value: "one", label: "Tek tarafta" },
  { value: "none", label: "Yok" },
];
const handrailFormValue: Record<Handrail, string> = { both: "iki tarafta", one: "tek tarafta", none: "yok" };

// Ekranda Türkçe ondalık (7,8); panoya kopyalanan metin saha formu için noktalı (7.8)
const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const formValue = (n: number) => n.toFixed(1);
// 2 sn içinde en az 10 örnek toplanmalı (farklı Android cihazların 10-50 Hz arası örnekleme hızlarına uyumlu)
const MIN_SAMPLES = 10;
const parseCm = (text: string) => {
  const n = Number(text.replace(",", "."));
  return text.trim() !== "" && Number.isFinite(n) && n > 0 ? n : null;
};

export default function SlopeMeterScreen() {
  const { colors, spacing, radius } = useTheme();
  const { available, live, record } = useAccelerometer();
  const offset = useCalibrationStore((s) => s.offset);
  const calibratedAt = useCalibrationStore((s) => s.calibratedAt);
  const setOffset = useCalibrationStore((s) => s.setOffset);

  const [busy, setBusy] = useState<"calibrate" | "measure" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [rise, setRise] = useState("");
  const [handrail, setHandrail] = useState<Handrail | null>(null);

  const liveSlope = live.length > 0 && offset !== null ? Math.abs(slopePercent(averageSample(live), offset)) : null;
  const done = results.length >= MEASUREMENTS;
  const med = results.length > 0 ? median(results) : null;
  const lengthCm = parseCm(length);
  const widthCm = parseCm(width);
  const riseCm = parseCm(rise);
  const tapeSlope = riseCm !== null && lengthCm !== null ? riseRunPercent(riseCm, lengthCm) : null;
  const check =
    done && med !== null && lengthCm !== null && widthCm !== null && handrail !== null
      ? checkRamp({ slopePct: med, lengthCm, widthCm, handrail, riseCm: riseCm ?? undefined })
      : null;

  async function calibrate() {
    setBusy("calibrate");
    setMessage("Telefonu düz zemine koyun ve dokunmayın…");
    const samples = await record(RECORD_MS);
    setBusy(null);
    if (samples.length < MIN_SAMPLES) {
      setMessage(`Sensörden yeterli veri gelmedi (${samples.length}/${MIN_SAMPLES}), ekran açıkken tekrar deneyin.`);
      return;
    }
    if (!isSteady(samples)) {
      setMessage("Telefon hareket etti, kalibrasyonu tekrarlayın.");
      return;
    }
    setOffset(slopeAngle(averageSample(samples)));
    setMessage("Kalibrasyon kaydedildi.");
  }

  async function measure() {
    if (offset === null) return;
    setBusy("measure");
    setMessage("Ölçülüyor, telefona dokunmayın…");
    const samples = await record(RECORD_MS);
    setBusy(null);
    if (samples.length < MIN_SAMPLES) {
      setMessage(`Sensörden yeterli veri gelmedi (${samples.length}/${MIN_SAMPLES}), ekran açıkken tekrar deneyin.`);
      return;
    }
    if (!isSteady(samples)) {
      setMessage("Telefon hareket etti, tekrar ölçün.");
      return;
    }
    const value = Math.abs(slopePercent(averageSample(samples), offset));
    setResults((r) => [...r, value]);
    setMessage(`Ölçüm ${results.length + 1}: %${fmt(value)}`);
  }

  function reset() {
    setResults([]);
    setLength("");
    setWidth("");
    setRise("");
    setHandrail(null);
    setMessage(null);
  }

  async function copy() {
    const lines = results.map((v, i) => `rampa_egim_${i + 1}: ${formValue(v)}`);
    if (riseCm !== null) lines.push(`rampa_yukseklik_cm: ${riseCm}`);
    if (lengthCm !== null) lines.push(`rampa_uzunluk_cm: ${lengthCm}`);
    if (widthCm !== null) lines.push(`rampa_genislik_cm: ${widthCm}`);
    if (handrail !== null) lines.push(`korkuluk: ${handrailFormValue[handrail]}`);
    await Clipboard.setStringAsync(lines.join("\n"));
    setMessage("Sonuçlar panoya kopyalandı.");
  }

  const inputStyle = {
    minHeight: minTouchSize,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.surface,
  };

  if (available === false) {
    return (
      <View style={{ flex: 1, padding: spacing.md }}>
        <AppText>Bu cihazda ivmeölçer bulunamadı.</AppText>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }} keyboardShouldPersistTaps="handled">
      <View
        accessible
        accessibilityLabel={liveSlope === null ? "Anlık eğim: önce kalibrasyon yapın" : `Anlık eğim yüzde ${fmt(liveSlope)}`}
        style={{ alignItems: "center", padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface }}
      >
        <AppText muted>Anlık eğim</AppText>
        <AppText style={{ fontSize: 64, lineHeight: 76, fontWeight: "700" }}>
          {liveSlope === null ? "—" : `%${fmt(liveSlope)}`}
        </AppText>
      </View>

      {message && (
        <AppText accessibilityLiveRegion="polite" variant="label">
          {message}
        </AppText>
      )}

      <AppButton
        label={busy === "calibrate" ? "Kalibre ediliyor…" : "Kalibre et"}
        variant={offset === null ? "primary" : "secondary"}
        disabled={busy !== null}
        onPress={calibrate}
      />
      <AppText muted>
        {calibratedAt
          ? `Son kalibrasyon: ${new Date(calibratedAt).toLocaleString("tr-TR")}`
          : "Ölçümden önce telefonu düz zemine koyup kalibre edin."}
      </AppText>

      <AppButton
        label={busy === "measure" ? "Ölçülüyor…" : `Ölç (${Math.min(results.length + 1, MEASUREMENTS)}/${MEASUREMENTS})`}
        disabled={offset === null || busy !== null || done}
        onPress={measure}
      />

      {results.length > 0 && (
        <View style={{ gap: spacing.xs }}>
          <AppText variant="heading">Ölçümler</AppText>
          {results.map((v, i) => (
            <AppText key={i}>
              {["Başı", "Ortası", "Sonu"][i] ?? `${i + 1}.`}: %{fmt(v)}
            </AppText>
          ))}
          {done && med !== null && <AppText variant="label">Medyan: %{fmt(med)}</AppText>}
        </View>
      )}

      {done && (
        <View style={{ gap: spacing.sm }}>
          <AppText variant="heading">Şerit metre</AppText>
          <TextInput
            style={inputStyle}
            value={length}
            onChangeText={setLength}
            keyboardType="decimal-pad"
            placeholder="Yatay uzunluk L (cm)"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Rampa yatay uzunluğu, santimetre"
          />
          <TextInput
            style={inputStyle}
            value={rise}
            onChangeText={setRise}
            keyboardType="decimal-pad"
            placeholder="Toplam yükselme H (cm)"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Rampa toplam yükselmesi, santimetre"
          />
          <TextInput
            style={inputStyle}
            value={width}
            onChangeText={setWidth}
            keyboardType="decimal-pad"
            placeholder="En dar genişlik (cm)"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Rampa en dar genişliği, santimetre"
          />
          {tapeSlope !== null && med !== null && (
            <AppText style={{ color: Math.abs(tapeSlope - med) > 1 ? colors.status.broken : colors.text }}>
              H/L: %{fmt(tapeSlope)} (fark {fmt(Math.abs(tapeSlope - med))})
              {Math.abs(tapeSlope - med) > 1 ? ". Fark %1'den büyük, ölçümü tekrarlayın." : ""}
            </AppText>
          )}

          <AppText variant="label">Korkuluk</AppText>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Korkuluk"
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
          >
            {handrailOptions.map((o) => (
              <AppButton
                key={o.value}
                label={o.label}
                variant={handrail === o.value ? "primary" : "secondary"}
                accessibilityRole="radio"
                accessibilityState={{ checked: handrail === o.value }}
                onPress={() => setHandrail(o.value)}
              />
            ))}
          </View>

          {check && (
            <View style={{ gap: spacing.xs, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface }}>
              <AppText
                variant="heading"
                style={{
                  color:
                    check.compliant === null ? colors.text : check.compliant ? colors.status.working : colors.status.broken,
                }}
              >
                {check.compliant === null ? "TS 9111: bilinmiyor" : check.compliant ? "TS 9111'e uygun" : "TS 9111'e uygun değil"}
              </AppText>
              {check.violations.map((v) => (
                <AppText key={v}>• {v}</AppText>
              ))}
            </View>
          )}
        </View>
      )}

      {results.length > 0 && (
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <AppButton label="Kopyala" variant="secondary" style={{ flex: 1 }} onPress={copy} />
          <AppButton label="Sıfırla" variant="secondary" style={{ flex: 1 }} onPress={reset} />
        </View>
      )}
    </ScrollView>
  );
}
