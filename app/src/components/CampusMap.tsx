import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type LatLng } from "react-native-maps";

import { accessScoreIcon, pointTypeIcon } from "@/lib/icons";
import { accessScoreLabel, pointStatusLabel, pointTypeLabel } from "@/lib/labels";
import { CAMPUS_REGION, toLatLng, type MapSelection } from "@/lib/campus";
import { floorLabel, pointA11yLabel } from "@/lib/points";
import type { Building, Point } from "@/lib/schemas";
import { useTheme } from "@/theme/ThemeProvider";

export type CampusMapHandle = {
  focus: (coordinate: LatLng) => void;
  fit: (coordinates: LatLng[]) => void;
};

type Props = {
  ref?: Ref<CampusMapHandle>;
  buildings: Building[];
  points: Point[];
  selection: MapSelection | null;
  onSelect: (selection: MapSelection | null) => void;
  showsUserLocation?: boolean;
  // Ek katmanlar (ör. #25 rota çizgisi)
  children?: ReactNode;
};

const EDGE_PADDING = { top: 48, right: 48, bottom: 48, left: 48 };

export function CampusMap({ ref, buildings, points, selection, onSelect, showsUserLocation, children }: Props) {
  const theme = useTheme();
  const { colors } = theme;
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const fitted = useRef(false);

  useImperativeHandle(ref, () => ({
    focus: (coordinate) =>
      mapRef.current?.animateToRegion({ ...coordinate, latitudeDelta: 0.004, longitudeDelta: 0.004 }, 400),
    fit: (coordinates) => mapRef.current?.fitToCoordinates(coordinates, { edgePadding: EDGE_PADDING, animated: true }),
  }));

  // İlk veri geldiğinde harita tüm kayıtları gösterecek şekilde yakınlaşır
  useEffect(() => {
    if (!ready || fitted.current) return;
    const coordinates = [...buildings, ...points].map(toLatLng);
    if (coordinates.length === 0) return;
    mapRef.current?.fitToCoordinates(coordinates, { edgePadding: EDGE_PADDING, animated: false });
    fitted.current = true;
  }, [ready, buildings, points]);

  // Özel işaret görünümleri her karede yeniden çizilmesin: değişiklikten sonra kısa süre izlenir
  const version = useMemo(() => ({ buildings, points, selection, theme }), [buildings, points, selection, theme]);
  const [settled, setSettled] = useState<typeof version | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(version), 1000);
    return () => clearTimeout(timer);
  }, [version]);
  const tracksViewChanges = settled !== version;

  const buildingNames = useMemo(() => new Map(buildings.map((b) => [b.id, b.name])), [buildings]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      initialRegion={CAMPUS_REGION}
      userInterfaceStyle={theme.highContrast ? "dark" : "light"}
      onMapReady={() => setReady(true)}
      onPress={() => onSelect(null)}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      accessibilityLabel="Kampüs haritası"
      accessibilityHint="Tüm noktaları liste olarak görmek için Liste sekmesini kullanın"
    >
      {/* Android'de TalkBack işareti title/description ile okur; accessibilityLabel orada yalnızca test etiketi (iOS'ta okunur) */}
      {buildings.map((building) => {
        const selected = selection?.kind === "building" && selection.id === building.id;
        const scoreColor = colors.score[building.score];
        return (
          <Marker
            key={`b-${building.id}`}
            coordinate={toLatLng(building)}
            onPress={() => onSelect({ kind: "building", id: building.id })}
            stopPropagation
            tracksViewChanges={tracksViewChanges}
            title={`Bina: ${building.name}`}
            description={accessScoreLabel[building.score]}
            accessibilityLabel={`Bina: ${building.name}, ${accessScoreLabel[building.score]}`}
          >
            <View
              style={[
                styles.marker,
                styles.building,
                {
                  backgroundColor: colors.background,
                  borderColor: selected ? colors.primary : scoreColor,
                  borderWidth: selected ? 4 : 3,
                },
              ]}
            >
              <MaterialCommunityIcons name="office-building" size={22} color={colors.text} />
              <Ionicons
                name={accessScoreIcon[building.score]}
                size={18}
                color={scoreColor}
                style={[styles.corner, { backgroundColor: colors.background }]}
              />
            </View>
          </Marker>
        );
      })}
      {points.map((point) => {
        const selected = selection?.kind === "point" && selection.id === point.id;
        const buildingName = point.building_id ? buildingNames.get(point.building_id) : undefined;
        return (
          <Marker
            key={`p-${point.id}`}
            coordinate={toLatLng(point)}
            onPress={() => onSelect({ kind: "point", id: point.id })}
            stopPropagation
            tracksViewChanges={tracksViewChanges}
            title={`${pointTypeLabel[point.type]}: ${point.name}`}
            description={[buildingName, floorLabel(point.floor), pointStatusLabel[point.status]]
              .filter(Boolean)
              .join(", ")}
            accessibilityLabel={pointA11yLabel(point, buildingName)}
          >
            <View
              style={[
                styles.marker,
                {
                  backgroundColor: colors.background,
                  borderColor: selected ? colors.primary : colors.status[point.status],
                  borderWidth: selected ? 4 : 2,
                },
              ]}
            >
              <MaterialCommunityIcons name={pointTypeIcon[point.type]} size={20} color={colors.text} />
              {/* Arıza yalnızca kenarlık rengiyle değil ek simgeyle de belli olur */}
              {point.status === "broken" && (
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.status.broken}
                  style={[styles.corner, { backgroundColor: colors.background }]}
                />
              )}
            </View>
          </Marker>
        );
      })}
      {children}
    </MapView>
  );
}

const styles = StyleSheet.create({
  marker: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  building: { width: 42, height: 42, borderRadius: 8 },
  corner: { position: "absolute", top: -8, right: -8, borderRadius: 10, overflow: "hidden" },
});
