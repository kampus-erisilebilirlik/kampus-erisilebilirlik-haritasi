import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import type { ComponentProps } from "react";
import { Linking, View } from "react-native";

import { about, repoUrl, rights, unitContact, unitServices } from "@/lib/info";
import { useDataStore } from "@/store/data";
import { useTheme } from "@/theme/ThemeProvider";
import { minTouchSize } from "@/theme/tokens";
import { AppButton } from "./AppButton";
import { AppPressable } from "./AppPressable";
import { AppText } from "./AppText";

type IconName = ComponentProps<typeof Ionicons>["name"];

const syncFormatter = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" });

// Dış bağlantı: telefonu, e-postayı, haritayı veya tarayıcıyı açar; etiket nereye gidildiğini söyler
function ExternalLink({ icon, text, label, url }: { icon: IconName; text: string; label: string; url: string }) {
  const { colors, spacing } = useTheme();
  return (
    <AppPressable
      onPress={() => void Linking.openURL(url)}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        minHeight: minTouchSize,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon} size={24} color={colors.primary} importantForAccessibility="no" />
      <AppText style={{ flex: 1, color: colors.primary, textDecorationLine: "underline", fontWeight: "600" }}>
        {text}
      </AppText>
    </AppPressable>
  );
}

function BulletList({ items }: { items: string[] }) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((item) => (
        <View key={item} style={{ flexDirection: "row", gap: spacing.sm }}>
          <AppText importantForAccessibility="no" accessibilityElementsHidden>
            •
          </AppText>
          <AppText style={{ flex: 1 }}>{item}</AppText>
        </View>
      ))}
    </View>
  );
}

// Bilgi sekmesinin içeriği (#19): birim, hizmetler, haklar, uygulama hakkında ve gizlilik özeti
export function InfoSections() {
  const { spacing } = useTheme();
  const lastSyncedAt = useDataStore((s) => s.lastSyncedAt);
  return (
    <>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="heading">{unitContact.name}</AppText>
        <AppText>{unitContact.address}</AppText>
        {unitContact.phones.map((phone) => (
          <ExternalLink
            key={phone}
            icon="call-outline"
            text={phone}
            label={`Ara: ${phone}, telefon veya faks`}
            url={`tel:${phone.replace(/\s/g, "")}`}
          />
        ))}
        <ExternalLink
          icon="mail-outline"
          text={unitContact.email}
          label={`E-posta gönder: ${unitContact.email}`}
          url={`mailto:${unitContact.email}`}
        />
        <ExternalLink
          icon="map-outline"
          text="Haritada göster"
          label="Birimi haritada göster, Google Haritalar açılır"
          url={unitContact.mapsUrl}
        />
        <ExternalLink
          icon="globe-outline"
          text="Birimin web sayfası"
          label="Birimin web sayfası, tarayıcıda açılır"
          url={unitContact.web}
        />
      </View>

      <AppText variant="heading">Birimin hizmetleri</AppText>
      <BulletList items={unitServices} />
      <AppText muted>Başvuru ve talep formları birimin web sayfasındadır.</AppText>

      <AppText variant="heading">Haklarınız</AppText>
      {rights.map((right) => (
        <View key={right.source} style={{ gap: spacing.xs }}>
          <AppText>{right.text}</AppText>
          {right.url ? (
            <ExternalLink
              icon="document-text-outline"
              text={`Kaynak: ${right.source}`}
              label={`Kaynak: ${right.source}, tarayıcıda açılır`}
              url={right.url}
            />
          ) : (
            <AppText muted>{`Kaynak: ${right.source}`}</AppText>
          )}
        </View>
      ))}

      <AppText variant="heading">Bu uygulama hakkında</AppText>
      <AppText>{about.project}</AppText>
      <AppText>{`Ekip: ${about.team}`}</AppText>
      <AppText>{`Danışman: ${about.advisor}`}</AppText>
      <AppText>{about.measurements}</AppText>
      <AppText>{about.score}</AppText>
      <AppText muted>
        {lastSyncedAt
          ? `Veriler en son ${syncFormatter.format(new Date(lastSyncedAt))} tarihinde güncellendi.`
          : "Veriler henüz indirilmedi."}
      </AppText>
      <ExternalLink
        icon="logo-github"
        text="Kaynak kod: GitHub"
        label="Kaynak kod GitHub'da, tarayıcıda açılır"
        url={repoUrl}
      />

      <AppText variant="heading">Gizlilik</AppText>
      <AppText>
        Uygulama üyelik istemez ve kişisel veri toplamaz. Konumunuz yalnızca telefonda kullanılır, sunucuya gönderilmez.
        Sorun bildirimleri anonimdir.
      </AppText>
      <Link href="/kvkk" asChild>
        <AppButton label="KVKK aydınlatma metni" variant="secondary" />
      </Link>
    </>
  );
}
