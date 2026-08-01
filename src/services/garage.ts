import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

import {
  db,
} from "./firebase";

import {
  Garage,
  OwnedCar,
} from "../types";




// ---------- Create Garage ----------

export async function createGarage(
  garage: Garage
) {

  await setDoc(
    doc(
      db,
      "garages",
      garage.id
    ),
    garage
  );

}



// ---------- Get Garage ----------

export async function getGarage(
  garageId: string
): Promise<Garage | null> {


  const snap =
    await getDoc(
      doc(
        db,
        "garages",
        garageId
      )
    );


  if (!snap.exists()) {

    return null;

  }


  return snap.data() as Garage;

}





// ---------- Add Car To Garage ----------

export async function addCarToGarage(
  garageId: string,
  car: OwnedCar
) {


  await updateDoc(

    doc(
      db,
      "garages",
      garageId
    ),

    {

      carIds:
        arrayUnion(car.id),

    }

  );

}






// ---------- Upgrade Garage ----------

export async function upgradeGarage(
  garageId: string,
  level: number
) {


  await updateDoc(

    doc(
      db,
      "garages",
      garageId
    ),

    {

      level,

    }

  );

}






// ---------- Update Garage 3D Model ----------

export async function updateGarageModel(
  garageId: string,
  model3D: string
) {


  await updateDoc(

    doc(
      db,
      "garages",
      garageId
    ),

    {

      model3D,

    }

  );

}