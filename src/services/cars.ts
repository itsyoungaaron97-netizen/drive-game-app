import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
  getUserProfile,
} from "./firebase";

import { Car } from "../data/cars";



// Save the player's selected car

export async function saveSelectedCar(
  uid: string,
  car: Car
) {

  await updateDoc(
    doc(db, "users", uid),
    {
      selectedCar: car,
    }
  );

}



// Get selected car

export async function getSelectedCar(
  uid: string
) {

  const profile =
    await getUserProfile(uid);


  return profile?.selectedCar || null;

}



// Add distance to a driven car

export async function updateCarsDriven(
  uid: string,
  carId: string,
  distanceKm: number
) {

  const profile =
    await getUserProfile(uid);


  const carsDriven =
    profile?.carsDriven || {};


  carsDriven[carId] =
    (carsDriven[carId] || 0)
    + distanceKm;


  await updateDoc(
    doc(db, "users", uid),
    {
      carsDriven,
    }
  );

}



// Find the car driven the most

export async function getMostDrivenCar(
  uid: string
) {

  const profile =
    await getUserProfile(uid);


  const carsDriven =
    profile?.carsDriven || {};


  const entries =
    Object.entries(carsDriven);


  if (entries.length === 0) {
    return null;
  }


  entries.sort(
    (a, b) =>
      b[1] - a[1]
  );


  return entries[0];

}