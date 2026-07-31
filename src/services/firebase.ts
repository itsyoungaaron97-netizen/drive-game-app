import { initializeApp } from "firebase/app";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";

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
} from "../types";


const firebaseConfig = {
  apiKey: "AIzaSyDutwZoAo-LvAeXq5btSj7VQHlPpsLoYTg",
  authDomain: "drivegame-32eb5.firebaseapp.com",
  projectId: "drivegame-32eb5",
  storageBucket: "drivegame-32eb5.firebasestorage.app",
  messagingSenderId: "797436193798",
  appId: "1:797436193798:web:5fb3efbd47ebcc3cd76787",
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


// REGISTER

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
    { displayName }
  );


  const profile: UserProfile = {
    uid: cred.user.uid,
    email,
    displayName,
    totalKm: 0,
    totalTrips: 0,
    maxSpeed: 0,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };


  await setDoc(
    doc(db, "users", cred.user.uid),
    profile
  );


  return cred.user;
}


// LOGIN

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


// LOGOUT

export async function logout() {
  return signOut(auth);
}


// AUTH LISTENER

export function subscribeToAuth(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(
    auth,
    callback
  );
}


// GET USER PROFILE

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


// UPDATE USER STATS

export async function updateUserStats(
  uid: string,
  distanceKm: number,
  maxSpeedKmh: number
) {

  const ref =
    doc(db, "users", uid);


  const snap =
    await getDoc(ref);


  const oldMaxSpeed =
    snap.exists()
      ? snap.data().maxSpeed || 0
      : 0;


  await updateDoc(ref, {

    totalKm:
      increment(distanceKm),

    totalTrips:
      increment(1),

    maxSpeed:
      Math.max(
        oldMaxSpeed,
        maxSpeedKmh
      ),

    lastActiveAt:
      Date.now(),
  });
}


// SAVE TRIP

export async function saveTrip(
  trip: Omit<Trip, "id">
): Promise<string> {

  const ref =
    await addDoc(
      collection(db, "trips"),
      {
        ...trip,
        createdAt:
          serverTimestamp(),
      }
    );


  return ref.id;
}


// GET USER TRIPS

export async function getUserTrips(
  uid: string,
  max = 20
): Promise<Trip[]> {


  const q =
    query(
      collection(db, "trips"),
      where(
        "userId",
        "==",
        uid
      ),
      orderBy(
        "startedAt",
        "desc"
      ),
      limit(max)
    );


  const snap =
    await getDocs(q);


  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  } as Trip));

}


// LEADERBOARD

export async function getLeaderboard(
  scope:
    | "global"
    | "country"
    | "state"
    | "city",

  placeName?: string,

  max = 50

): Promise<LeaderboardEntry[]> {


  const q =
    query(
      collection(db, "users"),
      orderBy(
        "totalKm",
        "desc"
      ),
      limit(max)
    );


  const snap =
    await getDocs(q);


  return snap.docs.map(
    (d, i) => {

      const data =
        d.data() as UserProfile;


      return {

        uid:
          data.uid,

        displayName:
          data.displayName,

        photoURL:
          data.photoURL,

        totalKm:
          data.totalKm,

        totalTrips:
          data.totalTrips,

        maxSpeed:
          data.maxSpeed,

        rank:
          i + 1,

      };

    }
  );

}
