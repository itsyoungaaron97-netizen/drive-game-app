import { initializeApp } from "firebase/app";

import {
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  increment,
} from "firebase/firestore";

import {
  UserProfile,
  Trip,
  LeaderboardEntry,
  UserChallengeProgress,
} from "../types";

import {
  getLevelFromXP,
  calculateTripXP,
} from "../constants/challenges";


// Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDutwZoAo-LvAeXq5btSj7VQHlPpsLoYTg",
  authDomain: "drivegame-32eb5.firebaseapp.com",
  projectId: "drivegame-32eb5",
  storageBucket: "drivegame-32eb5.firebasestorage.app",
  messagingSenderId: "797436193798",
  appId: "1:797436193798:web:5fb3efbd47ebcc3cd76787",
  measurementId: "G-Y9RBVH01PY",
};


const app = initializeApp(firebaseConfig);


// Firebase Auth with persistent login storage

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(
    AsyncStorage
  ),
});


export const db = getFirestore(app);



// ---------- Auth ----------

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {

  const cred =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );


  await updateProfile(
    cred.user,
    {
      displayName,
    }
  );


  const profile: UserProfile = {

    uid: cred.user.uid,

    email,

    displayName,

    totalKm: 0,

    totalTrips: 0,

    maxSpeed: 0,

    totalXP: 0,

    level: 1,

    createdAt: Date.now(),

    lastActiveAt: Date.now(),

  };


  await setDoc(
    doc(db, "users", cred.user.uid),
    profile
  );


  return cred.user;
}



export async function loginWithEmail(
  email: string,
  password: string
) {

  return signInWithEmailAndPassword(
    auth,
    email,
    password
  );

}



export async function logout() {

  return signOut(auth);

}



export function subscribeToAuth(
  callback: (user: User | null) => void
) {

  return onAuthStateChanged(
    auth,
    callback
  );

}



// ---------- User Profile ----------

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {


  const snap =
    await getDoc(
      doc(db, "users", uid)
    );


  return snap.exists()
    ? (snap.data() as UserProfile)
    : null;

}




export async function updateUserStats(
  uid: string,
  distanceKm: number,
  maxSpeedKmh: number
) {


  const xpGained =
    calculateTripXP(
      distanceKm,
      maxSpeedKmh
    );


  const ref =
    doc(db, "users", uid);



  const profile =
    await getUserProfile(uid);



  const currentXP =
    profile?.totalXP || 0;



  const newXP =
    currentXP + xpGained;



  const newLevel =
    getLevelFromXP(newXP);



  await updateDoc(
    ref,
    {

      totalKm: increment(distanceKm),

      totalTrips: increment(1),

      maxSpeed: maxSpeedKmh,

      totalXP: newXP,

      level: newLevel,

      lastActiveAt: Date.now(),

    }
  );


  return {
    xpGained,
    newXP,
    newLevel,
  };

}




// ---------- Trips ----------

export async function saveTrip(
  trip: Omit<Trip, "id">
): Promise<string> {


  const ref =
    await addDoc(
      collection(db, "trips"),
      {
        ...trip,
        createdAt: serverTimestamp(),
      }
    );


  return ref.id;

}




export async function getUserTrips(
  uid: string,
  max = 20
): Promise<Trip[]> {


  const q =
    query(
      collection(db, "trips"),
      where("userId", "==", uid),
      orderBy("startedAt", "desc"),
      limit(max)
    );



  const snap =
    await getDocs(q);



  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
      } as Trip)
  );

}





// ---------- Leaderboards ----------

export async function getLeaderboard(
  scope: "global" | "country" | "state" | "city",
  placeName?: string,
  max = 50
): Promise<LeaderboardEntry[]> {


  const q =
    query(
      collection(db, "users"),
      orderBy("totalXP", "desc"),
      limit(max)
    );



  const snap =
    await getDocs(q);



  return snap.docs.map(
    (d, i) => {

      const data =
        d.data() as UserProfile;


      return {

        uid: data.uid,

        displayName: data.displayName,

        photoURL: data.photoURL,

        totalKm: data.totalKm,

        totalTrips: data.totalTrips,

        maxSpeed: data.maxSpeed,

        totalXP: data.totalXP,

        level: data.level,

        rank: i + 1,

      };

    }
  );

}





// ---------- Challenges ----------

export async function getUserChallengeProgress(
  uid: string
): Promise<UserChallengeProgress[]> {


  const snap =
    await getDocs(
      collection(
        db,
        "users",
        uid,
        "challenges"
      )
    );



  return snap.docs.map(
    (d) =>
      d.data() as UserChallengeProgress
  );

}




export async function updateChallengeProgress(
  uid: string,
  challengeId: string,
  progress: number,
  completed: boolean
) {


  const ref =
    doc(
      db,
      "users",
      uid,
      "challenges",
      challengeId
    );



  await setDoc(
    ref,
    {

      challengeId,

      progress,

      completed,

      claimed: false,

      updatedAt: Date.now(),

    },
    {
      merge: true,
    }
  );

}




export async function claimChallengeReward(
  uid: string,
  challengeId: string,
  xpReward: number
) {


  const challengeRef =
    doc(
      db,
      "users",
      uid,
      "challenges",
      challengeId
    );



  const userRef =
    doc(
      db,
      "users",
      uid
    );



  const profile =
    await getUserProfile(uid);



  const currentXP =
    profile?.totalXP || 0;



  const newXP =
    currentXP + xpReward;



  const newLevel =
    getLevelFromXP(newXP);



  await updateDoc(
    challengeRef,
    {
      claimed: true,
    }
  );



  await updateDoc(
    userRef,
    {

      totalXP: newXP,

      level: newLevel,

    }
  );



  return {
    newXP,
    newLevel,
  };

}