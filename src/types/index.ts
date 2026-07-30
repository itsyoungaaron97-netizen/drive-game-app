export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  totalKm: number;
  totalTrips: number;
  maxSpeed: number;
  createdAt: number;
  lastActiveAt: number;
}

export interface TripPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
  altitude?: number;
}

export interface Trip {
  id: string;
  userId: string;
  userDisplayName: string;
  startedAt: number;
  endedAt: number;
  distanceKm: number;
  durationSeconds: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  route: TripPoint[];
  startCity?: string;
  startState?: string;
  startCountry?: string;
  endCity?: string;
  endState?: string;
  endCountry?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  totalKm: number;
  totalTrips: number;
  maxSpeed: number;
  rank?: number;
}

export type LobbyScope = "city" | "state" | "country" | "global";

export interface Lobby {
  id: string;
  scope: LobbyScope;
  name: string;
  memberCount?: number;
}
