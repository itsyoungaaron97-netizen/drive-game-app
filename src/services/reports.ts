import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
} from "firebase/firestore";


import {
  db,
} from "./firebase";


import {
  Report,
} from "../types";





// Create live report

export async function createReport(

  report: Omit<Report,"id">

) {


  const ref = await addDoc(

    collection(
      db,
      "reports"
    ),

    {

      ...report,

      createdAt:
        serverTimestamp(),

    }

  );


  return ref.id;

}







// Get active reports near map

export async function getReports(

  max:number = 100

):Promise<Report[]> {


  const q = query(

    collection(
      db,
      "reports"
    ),

    orderBy(
      "createdAt",
      "desc"
    ),

    limit(max)

  );



  const snap =
    await getDocs(q);



  return snap.docs.map(

    doc =>

    ({

      id:doc.id,

      ...doc.data(),

    } as Report)

  );


}







// Get reports by type

export async function getReportsByType(

  type:string

):Promise<Report[]> {


  const q = query(

    collection(
      db,
      "reports"
    ),

    where(
      "type",
      "==",
      type
    )

  );



  const snap =
    await getDocs(q);



  return snap.docs.map(

    doc =>

    ({

      id:doc.id,

      ...doc.data(),

    } as Report)

  );


}