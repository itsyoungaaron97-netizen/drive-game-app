import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
} from "./firebase";

import {
  WorldObject,
  Business,
  Report,
  CommunityPost,
  Comment,
} from "../types";




// ---------- World Objects ----------


export async function createWorldObject(
  object: WorldObject
) {

  const ref =
    await addDoc(
      collection(
        db,
        "worldObjects"
      ),
      object
    );


  return ref.id;

}





export async function getWorldObjects(
  max: number = 100
): Promise<WorldObject[]> {


  const q =
    query(

      collection(
        db,
        "worldObjects"
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

    d => ({

      id:d.id,

      ...d.data(),

    } as WorldObject)

  );

}








// ---------- Businesses ----------


export async function createBusiness(
  business: Business
) {


  const ref =
    await addDoc(

      collection(
        db,
        "businesses"
      ),

      business

    );


  return ref.id;

}






export async function getBusinesses()
:Promise<Business[]> {


  const snap =
    await getDocs(

      collection(
        db,
        "businesses"
      )

    );


  return snap.docs.map(

    d => ({

      id:d.id,

      ...d.data(),

    } as Business)

  );

}







// ---------- Reports ----------


export async function createReport(
  report: Report
) {


  const ref =
    await addDoc(

      collection(
        db,
        "reports"
      ),

      report

    );


  return ref.id;

}






export async function getReports()
:Promise<Report[]> {


  const snap =
    await getDocs(

      collection(
        db,
        "reports"
      )

    );



  return snap.docs.map(

    d => ({

      id:d.id,

      ...d.data(),

    } as Report)

  );

}







// ---------- Community ----------


export async function createPost(
  post: CommunityPost
) {


  const ref =
    await addDoc(

      collection(
        db,
        "posts"
      ),

      post

    );


  return ref.id;

}






export async function addComment(
  comment: Comment
) {


  const ref =
    await addDoc(

      collection(
        db,
        "comments"
      ),

      comment

    );


  return ref.id;

}