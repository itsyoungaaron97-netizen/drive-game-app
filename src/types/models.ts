export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;

  level: number;
  xp: number;
  coins: number;

  totalDistanceKm: number;
  totalTrips: number;

  createdAt: number;
}


export interface Car {
  id: string;

  ownerId: string;

  vinHash?: string;

  brand: string;
  model: string;
  year: number;

  engine?: string;
  color?: string;

  image?: string;

  createdAt: number;
}


export interface Trip {
  id: string;

  userId: string;
  carId: string;

  distanceKm: number;
  durationMinutes: number;

  averageSpeed: number;
  maxSpeed: number;

  route: {
    latitude: number;
    longitude: number;
  }[];

  createdAt: number;
}


export interface Garage {
  id: string;

  ownerId: string;

  name: string;

  location?: {
    latitude: number;
    longitude: number;
  };

  level: number;

  cars: string[];
}


export interface Report {
  id: string;

  userId: string;

  type:
    | "traffic"
    | "accident"
    | "police"
    | "hazard"
    | "other";

  message: string;

  location: {
    latitude: number;
    longitude: number;
  };

  image?: string;

  createdAt: number;
}