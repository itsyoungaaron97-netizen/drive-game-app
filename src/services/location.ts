import * as Location from "expo-location";
import { getDistance } from "geolib";
import { TripPoint } from "../types";

export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foreground } =
    await Location.requestForegroundPermissionsAsync();

  if (foreground !== "granted") return false;

  await Location.requestBackgroundPermissionsAsync();

  return true;
}

export async function getCurrentPosition(): Promise<Location.LocationObject | null> {
  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch {
    return null;
  }
}

export function watchPosition(
  onUpdate: (point: TripPoint) => void,
  onError?: (err: any) => void
) {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 2000,
      distanceInterval: 5,
    },
    (loc) => {
      onUpdate({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        timestamp: loc.timestamp,
        speed: loc.coords.speed ?? undefined,
        altitude: loc.coords.altitude ?? undefined,
      });
    }
  );
}

export function calculateDistanceKm(
  points: TripPoint[]
): number {
  if (points.length < 2) return 0;

  let totalMeters = 0;

  for (let i = 1; i < points.length; i++) {
    totalMeters += getDistance(
      {
        latitude: points[i - 1].latitude,
        longitude: points[i - 1].longitude,
      },
      {
        latitude: points[i].latitude,
        longitude: points[i].longitude,
      }
    );
  }

  return totalMeters / 1000;
}

export function calculateMaxSpeedKmh(
  points: TripPoint[]
): number {
  let max = 0;

  for (const p of points) {
    if (p.speed != null && p.speed > 0) {
      const kmh = p.speed * 3.6;
      if (kmh > max) max = kmh;
    }
  }

  return Math.round(max * 10) / 10;
}

export function calculateAvgSpeedKmh(
  distanceKm: number,
  durationSeconds: number
): number {
  if (durationSeconds <= 0) return 0;

  const hours = durationSeconds / 3600;

  return Math.round((distanceKm / hours) * 10) / 10;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{
  city?: string;
  state?: string;
  country?: string;
}> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (!results.length) return {};

    const r = results[0];

    return {
      city: r.city || r.subregion || undefined,
      state: r.region || undefined,
      country: r.country || undefined,
    };
  } catch {
    return {};
  }
}
