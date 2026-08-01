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
  Car,
} from "../data/cars";


import {
  getLevelFromXP,
  calculateTripXP,
} from "../constants/challenges";



// =====================================
// FIREBASE CONFIG
// =====================================

const firebaseConfig = {

  apiKey:
    "AIzaSyDutwZoAo-LvAeXq5btSj7VQHlPpsLoYTg",

  authDomain:
    "drivegame-32eb5.firebaseapp.com",

  projectId:
    "drivegame-32eb5",

  storageBucket:
    "drivegame-32eb5.firebasestorage.app",

  messagingSenderId:
    "797436193798",

  appId:
    "1:797436193798:web:5fb3efbd47ebcc3cd76787",

  measurementId:
    "G-Y9RBVH01PY",

};



// =====================================
// INITIALIZE FIREBASE
// =====================================

export const app =
  initializeApp(firebaseConfig);



export const auth =
  initializeAuth(

    app,

    {

      persistence:

        getReactNativePersistence(
          AsyncStorage
        ),

    }

  );



export const db =
  getFirestore(app);




// =====================================
// AUTH TYPES
// =====================================

export interface RegisterDetails {

  nationality?: string;

  country?: string;

  state?: string;

  city?: string;

  birthDate?: string;

}




// =====================================
// REGISTER USER
// =====================================

export async function registerWithEmail(

  email:string,

  password:string,

  displayName:string,

  details:RegisterDetails = {}

):Promise<User>{


  const cleanEmail =
    email.trim().toLowerCase();


  const cleanName =
    displayName.trim();



  const cred =

    await createUserWithEmailAndPassword(

      auth,

      cleanEmail,

      password

    );



  await updateProfile(

    cred.user,

    {

      displayName:
        cleanName,

    }

  );



  const profile:UserProfile = {

    uid:
      cred.user.uid,


    email:
      cleanEmail,


    displayName:
      cleanName,


    nationality:
      details.nationality || "",


    country:
      details.country || "",


    state:
      details.state || "",


    city:
      details.city || "",


    birthDate:
      details.birthDate || "",


    totalKm:
      0,


    totalTrips:
      0,


    maxSpeed:
      0,


    totalXP:
      0,


    level:
      1,


    coins:
      0,


    createdAt:
      Date.now(),


    lastActiveAt:
      Date.now(),


    carsDriven:
      {},


  };



  await setDoc(

    doc(

      db,

      "users",

      cred.user.uid

    ),

    profile

  );



  return cred.user;

}




// =====================================
// LOGIN / LOGOUT
// =====================================

export async function loginWithEmail(

  email:string,

  password:string

){


  return signInWithEmailAndPassword(

    auth,

    email.trim().toLowerCase(),

    password

  );

}



export async function logout(){

  return signOut(auth);

}



export function subscribeToAuth(

  callback:(user:User|null)=>void

){

  return onAuthStateChanged(

    auth,

    callback

  );

}
// =====================================
// PROFILE
// =====================================


export async function getUserProfile(

  uid:string

):Promise<UserProfile | null>{


  const snap =

    await getDoc(

      doc(

        db,

        "users",

        uid

      )

    );



  if(!snap.exists()){

    return null;

  }



  return snap.data() as UserProfile;

}






export async function updateSelectedCar(

  uid:string,

  car:Car

){


  await updateDoc(

    doc(

      db,

      "users",

      uid

    ),

    {

      selectedCar:

        car,

    }

  );


}






export async function updateCarDriven(

  uid:string,

  car:Car

){


  const profile =

    await getUserProfile(uid);



  const currentCars =

    profile?.carsDriven || {};



  const updatedCars = {


    ...currentCars,


    [car.id]:

      (currentCars[car.id] || 0) + 1,


  };



  await updateDoc(

    doc(

      db,

      "users",

      uid

    ),

    {

      carsDriven:

        updatedCars,

    }

  );



  return updatedCars;

}






// =====================================
// USER STATS
// =====================================


export async function updateUserStats(

  uid:string,

  distanceKm:number,

  maxSpeedKmh:number

){


  const xpGained =

    calculateTripXP(

      distanceKm,

      maxSpeedKmh

    );



  const profile =

    await getUserProfile(uid);



  const newXP =

    (profile?.totalXP || 0)

    +

    xpGained;



  const newLevel =

    getLevelFromXP(newXP);



  await updateDoc(

    doc(

      db,

      "users",

      uid

    ),

    {


      totalKm:

        increment(distanceKm),



      totalTrips:

        increment(1),



      maxSpeed:

        maxSpeedKmh,



      totalXP:

        newXP,



      level:

        newLevel,



      lastActiveAt:

        Date.now(),


    }

  );




  return {


    xpGained,


    newXP,


    newLevel,


  };


}






// =====================================
// TRIPS
// =====================================


export async function saveTrip(

  trip:Omit<Trip,"id">

):Promise<string>{


  const ref =

    await addDoc(

      collection(

        db,

        "trips"

      ),

      {


        ...trip,


        createdAt:

          serverTimestamp(),


      }


    );



  return ref.id;

}






export async function getUserTrips(

  uid:string,

  max:number = 20

):Promise<Trip[]>{



  const q =

    query(

      collection(

        db,

        "trips"

      ),



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





  return snap.docs.map(

    d =>


    ({

      id:

        d.id,


      ...d.data(),


    } as Trip)


  );


}
// =====================================
// LEADERBOARD
// =====================================


export async function getLeaderboard(

  scope:
    | "global"
    | "country"
    | "state"
    | "city",

  placeName?:string,

  max:number = 50

):Promise<LeaderboardEntry[]>{



  const q =

    query(

      collection(

        db,

        "users"

      ),



      orderBy(

        "totalXP",

        "desc"

      ),



      limit(max)


    );





  const snap =

    await getDocs(q);





  return snap.docs.map(

    (d,index)=>{


      const data =

        d.data() as UserProfile;



      return {


        uid:

          data.uid,



        displayName:

          data.displayName,



        photoURL:

          data.photoURL || "",



        totalKm:

          data.totalKm || 0,



        totalTrips:

          data.totalTrips || 0,



        maxSpeed:

          data.maxSpeed || 0,



        totalXP:

          data.totalXP || 0,



        level:

          data.level || 1,



        rank:

          index + 1,


      };


    }

  );


}






// =====================================
// CHALLENGES
// =====================================


export async function getUserChallengeProgress(

  uid:string

):Promise<UserChallengeProgress[]>{



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

    d =>

      d.data() as UserChallengeProgress


  );


}







export async function updateChallengeProgress(

  uid:string,

  challengeId:string,

  progress:number,

  completed:boolean

){



  await setDoc(

    doc(

      db,

      "users",

      uid,

      "challenges",

      challengeId

    ),



    {


      challengeId,


      progress,


      completed,


      claimed:false,


      updatedAt:

        Date.now(),


    },



    {


      merge:true,


    }


  );


}







export async function claimChallengeReward(

  uid:string,

  challengeId:string,

  xpReward:number

){



  const profile =

    await getUserProfile(uid);





  const newXP =

    (profile?.totalXP || 0)

    +

    xpReward;





  const newLevel =

    getLevelFromXP(newXP);






  await updateDoc(

    doc(

      db,

      "users",

      uid,

      "challenges",

      challengeId

    ),



    {


      claimed:true,


    }


  );







  await updateDoc(

    doc(

      db,

      "users",

      uid

    ),



    {


      totalXP:

        newXP,



      level:

        newLevel,



      lastActiveAt:

        Date.now(),


    }


  );






  return {


    newXP,


    newLevel,


  };


}