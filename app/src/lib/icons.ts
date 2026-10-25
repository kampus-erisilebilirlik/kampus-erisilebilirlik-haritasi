import type Ionicons from "@expo/vector-icons/Ionicons";
import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";

import type { AccessScore, PointType } from "./schemas";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

// Her tür ayrı şekille ayırt edilir (harita işaretleri, filtre, listeler); Ionicons'ta bu simgeler yok
export const pointTypeIcon: Record<PointType, MaterialIconName> = {
  ramp: "slope-uphill",
  elevator: "elevator-passenger",
  toilet: "toilet",
  parking: "parking",
  auto_door: "door-sliding",
};

// Puan yalnızca renkle değil simge şekliyle de verilir (WCAG 1.4.1)
export const accessScoreIcon: Record<AccessScore, IoniconName> = {
  green: "checkmark-circle",
  yellow: "alert-circle",
  red: "close-circle",
};
