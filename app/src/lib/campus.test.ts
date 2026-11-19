import { CAMPUS_REGION, mapBounds } from "./campus";

const inside = (bounds: ReturnType<typeof mapBounds>, latitude: number, longitude: number) =>
  latitude < bounds.northEast.latitude &&
  latitude > bounds.southWest.latitude &&
  longitude < bounds.northEast.longitude &&
  longitude > bounds.southWest.longitude;

describe("mapBounds", () => {
  it("veri yokken yerleşkeyi pay bırakarak kapsar", () => {
    const bounds = mapBounds([]);
    const { latitude, longitude, latitudeDelta, longitudeDelta } = CAMPUS_REGION;
    expect(inside(bounds, latitude + latitudeDelta / 2, longitude + longitudeDelta / 2)).toBe(true);
    expect(inside(bounds, latitude - latitudeDelta / 2, longitude - longitudeDelta / 2)).toBe(true);
  });

  it("yerleşke dışındaki kaydı da kapsayacak şekilde genişler", () => {
    const outside = { latitude: 38.06, longitude: 32.56 };
    expect(inside(mapBounds([]), outside.latitude, outside.longitude)).toBe(false);
    expect(inside(mapBounds([outside]), outside.latitude, outside.longitude)).toBe(true);
  });

  it("kampüsten çok uzaktaki yeri kapsamaz", () => {
    expect(inside(mapBounds([]), 39.93, 32.85)).toBe(false);
  });
});
