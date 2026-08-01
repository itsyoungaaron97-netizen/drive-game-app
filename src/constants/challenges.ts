import { Challenge } from "../types";

export const CHALLENGES: Challenge[] = [
  {
    id: "daily_drive_5km",
    title: "Daily Driver",
    description: "Drive 5 km today",
    type: "distance",
    target: 5,
    xpReward: 50,
    isDaily: true,
  },
  {
    id: "daily_3_trips",
    title: "Trip Hopper",
    description: "Complete 3 trips today",
    type: "trips",
    target: 3,
    xpReward: 40,
    isDaily: true,
  },
  {
    id: "speed_100",
    title: "Speed Demon",
    description: "Reach 100 km/h in one trip",
    type: "speed",
    target: 100,
    xpReward: 80,
    isDaily: false,
  },
  {
    id: "distance_50",
    title: "Road Warrior",
    description: "Drive a total of 50 km",
    type: "distance",
    target: 50,
    xpReward: 150,
    isDaily: false,
  },
  {
    id: "trips_10",
    title: "Frequent Driver",
    description: "Complete 10 trips",
    type: "trips",
    target: 10,
    xpReward: 120,
    isDaily: false,
  },
  {
    id: "distance_200",
    title: "Long Hauler",
    description: "Drive a total of 200 km",
    type: "distance",
    target: 200,
    xpReward: 300,
    isDaily: false,
  },
];

// Simple level calculation
export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

// XP earned from a normal trip
export function calculateTripXP(distanceKm: number, maxSpeedKmh: number): number {
  const distanceXP = Math.round(distanceKm * 10); // 10 XP per km
  const speedBonus = maxSpeedKmh >= 100 ? 20 : maxSpeedKmh >= 80 ? 10 : 0;
  return distanceXP + speedBonus;
}