import {
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

import {
  db,
  getUserProfile,
} from "./firebase";

import {
  Car,
} from "../data/cars";

import {
  OwnedCar,
} from "../types";


// ---------- Selected Car ----------


export async function saveSelectedCar(
  uid: string,
  car: Car | OwnedCar
) {

  await updateDoc(
    doc(db, "users", uid),
    {
      selectedCar: car,
    }
  );

}





export async function getSelectedCar(
  uid: string
) {

  const profile =
    await getUserProfile(uid);


  return profile?.selectedCar || null;

}





// ---------- Owned Car System ----------


export async function addOwnedCar(
  uid: string,
  car: OwnedCar
) {

  await updateDoc(
    doc(db, "users", uid),
    {
      ownedCars: arrayUnion(car),
    }
  );

}





export async function getOwnedCars(
  uid: string
): Promise<OwnedCar[]> {


  const profile =
    await getUserProfile(uid);


  return (
    profile?.ownedCars || []
  ) as OwnedCar[];

}







export async function verifyCarOwnership(
  uid: string,
  carId: string
) {


  const profile =
    await getUserProfile(uid);



  const cars =
    (profile?.ownedCars || []) as OwnedCar[];



  const updatedCars =
    cars.map((car) => {

      if (car.id === carId) {

        return {
          ...car,
          verifiedOwnership: true,
        };

      }


      return car;

    });



  await updateDoc(
    doc(db, "users", uid),
    {
      ownedCars: updatedCars,
    }
  );

}





// ---------- Driven Car Statistics ----------


export async function updateCarsDriven(
  uid: string,
  carId: string,
  distanceKm: number
) {


  const profile =
    await getUserProfile(uid);



  const carsDriven =
    {
      ...(profile?.carsDriven || {}),
    };



  carsDriven[carId] =
    (carsDriven[carId] || 0) + distanceKm;



  await updateDoc(
    doc(db, "users", uid),
    {
      carsDriven,
    }
  );

}







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
      Number(b[1]) - Number(a[1])
  );



  return entries[0];

}