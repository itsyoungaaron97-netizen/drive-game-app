import { Car } from "../data/cars";


// ---------- User Profile ----------

export interface UserProfile {

  uid: string;

  email: string;

  displayName: string;

  photoURL?: string;


  totalKm: number;

  totalTrips: number;

  maxSpeed: number;


  totalXP: number;

  level: number;


  createdAt: number;

  lastActiveAt: number;



  // ---------- Car System ----------

  selectedCar?: Car;


  carsDriven?: {

    [carId: string]: number;

  };

}



// ---------- Trip ----------

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


  xpEarned?: number;


  // Car used during trip

  carId?: string;

  carName?: string;

}



// ---------- Leaderboard ----------

export interface LeaderboardEntry {

  uid: string;

  displayName: string;

  photoURL?: string;


  totalKm: number;

  totalTrips: number;

  maxSpeed: number;


  totalXP?: number;

  level?: number;

  rank?: number;

}



// ---------- Lobby ----------

export type LobbyScope =

  | "city"

  | "state"

  | "country"

  | "global";




export interface Lobby {

  id: string;

  scope: LobbyScope;

  name: string;

  memberCount?: number;

}



// ---------- Challenges ----------

export interface Challenge {

  id: string;

  title: string;

  description: string;


  type:

    | "distance"

    | "trips"

    | "speed"

    | "time";


  target: number;

  xpReward: number;

  isDaily: boolean;

}




export interface UserChallengeProgress {

  challengeId: string;

  progress: number;

  completed: boolean;

  claimed: boolean;

  updatedAt: number;

}



// ---------- Friends System ----------

export interface FriendRequest {

  id: string;


  fromUid: string;

  toUid: string;


  fromDisplayName: string;

  toDisplayName: string;


  status:

    | "pending"

    | "accepted"

    | "declined";


  createdAt: number;

}




export interface Friend {

  uid: string;


  displayName: string;

  photoURL?: string;


  totalKm: number;

  totalTrips: number;


  level: number;

  totalXP: number;


  addedAt: number;

}