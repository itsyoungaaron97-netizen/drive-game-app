import { Car } from "../data/cars";


// ---------- Owned Car System ----------

export interface OwnedCar {

  id: string;

  ownerId: string;

  vinHash?: string;

  verifiedOwnership?: boolean;


  brand: string;

  model: string;

  year: number;

  engine?: string;

  horsepower?: number;

  color?: string;

  mileage?: number;


  model3D?: string;

  imageURL?: string;


  createdAt: number;

}



// ---------- User Profile ----------

export interface UserProfile {

  uid: string;

  email: string;

  displayName: string;

  photoURL?: string;



  // Location Identity

  nationality?: string;

  country?: string;

  state?: string;

  city?: string;

  language?: string;



  totalKm: number;

  totalTrips: number;

  maxSpeed: number;


  totalXP: number;

  level: number;


  coins?: number;


  createdAt: number;

  lastActiveAt: number;



  selectedCar?: Car | OwnedCar;


  ownedCars?: OwnedCar[];


  carsDriven?: {

    [carId: string]: number;

  };


  garageId?: string;

}





// ---------- Garage System ----------

export interface Garage {

  id: string;

  ownerId: string;


  name: string;


  location: {

    latitude: number;

    longitude: number;

  };


  level: number;


  carIds: string[];


  model3D?: string;


  createdAt: number;

}






// ---------- World Map Objects ----------

export type WorldObjectType =

  | "garage"

  | "house"

  | "building"

  | "mechanic"

  | "business"

  | "custom";





export interface WorldObject {

  id: string;

  ownerId?: string;


  type: WorldObjectType;


  name: string;

  description?: string;



  location: {

    latitude: number;

    longitude: number;

  };



  model3D?: string;


  imageURL?: string;


  createdAt: number;

}






// ---------- Business System ----------

export interface Business {

  id: string;

  ownerId: string;


  name: string;


  type:

    | "mechanic"

    | "garage"

    | "dealer"

    | "other";



  description?: string;



  location: {

    latitude: number;

    longitude: number;

  };



  imageURL?: string;


  verified?: boolean;


  createdAt: number;

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


  carId?: string;

  carName?: string;

}







// ---------- Live Reports ----------

export type ReportType =

  | "traffic"

  | "accident"

  | "police"

  | "hazard"

  | "other";





export interface Report {

  id: string;

  userId: string;


  type: ReportType;


  message: string;


  location: {

    latitude: number;

    longitude: number;

  };


  imageURL?: string;


  createdAt: number;

}







// ---------- Community Feed ----------

export interface CommunityPost {

  id: string;

  userId: string;


  displayName: string;

  photoURL?: string;


  text: string;


  imageURL?: string;


  location?: {

    latitude: number;

    longitude: number;

  };


  likes?: number;


  createdAt: number;

}





export interface Comment {

  id: string;


  postId: string;


  userId: string;


  displayName: string;


  text: string;


  createdAt: number;

}







// ---------- Messages ----------

export interface Message {

  id: string;


  senderId: string;


  receiverId: string;


  text: string;


  imageURL?: string;


  createdAt: number;


  read?: boolean;

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







// ---------- Friends ----------

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