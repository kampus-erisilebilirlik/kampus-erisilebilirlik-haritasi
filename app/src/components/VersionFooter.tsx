import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useRef } from "react";

import { createTapCounter } from "@/lib/secretTap";
import { AppText } from "./AppText";

// #5 bu rotayı ekler; normal kullanıcıya görünmez, alternatifi kampuserisim://admin deep link'i
export const ADMIN_LOGIN_HREF = "/admin/giris";

// Bilgi sekmesinin en altındaki sürüm satırı: 3 saniye içinde 5 dokunuş yönetici girişini açar
export function VersionFooter() {
  const router = useRouter();
  const tap = useRef(createTapCounter()).current;
  return (
    <AppText
      muted
      accessibilityRole="text"
      onPress={() => {
        if (tap()) router.push(ADMIN_LOGIN_HREF);
      }}
      style={{ textAlign: "center" }}
    >
      {`Sürüm ${Constants.expoConfig?.version ?? "-"}`}
    </AppText>
  );
}
