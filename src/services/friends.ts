import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  limit,
} from "firebase/firestore";

import { db } from "./firebase";

import { Friend, FriendRequest, UserProfile } from "../types";



// Search users by email OR display name

export async function searchUsers(
  text: string
): Promise<UserProfile[]> {

  const value = text.trim();

  if (!value) {
    return [];
  }


  const usersRef = collection(
    db,
    "users"
  );


  const emailQuery = query(
    usersRef,
    where(
      "email",
      "==",
      value.toLowerCase()
    ),
    limit(10)
  );


  const nameQuery = query(
    usersRef,
    where(
      "displayName",
      "==",
      value
    ),
    limit(10)
  );


  const [
    emailSnap,
    nameSnap,
  ] = await Promise.all([
    getDocs(emailQuery),
    getDocs(nameQuery),
  ]);



  const results: UserProfile[] = [];



  emailSnap.forEach((d) => {

    results.push(
      d.data() as UserProfile
    );

  });



  nameSnap.forEach((d) => {

    const user =
      d.data() as UserProfile;


    if (
      !results.some(
        (u) =>
          u.uid === user.uid
      )
    ) {

      results.push(user);

    }

  });


  return results;
}





// Send friend request

export async function sendFriendRequest(

  fromUid: string,

  toUid: string,

  fromDisplayName: string,

  toDisplayName: string

) {


  if (fromUid === toUid) {

    throw new Error(
      "You cannot add yourself"
    );

  }



  const existing = await getDocs(

    query(

      collection(
        db,
        "friendRequests"
      ),

      where(
        "fromUid",
        "==",
        fromUid
      ),

      where(
        "toUid",
        "==",
        toUid
      ),

      where(
        "status",
        "==",
        "pending"
      )

    )

  );



  if (!existing.empty) {

    throw new Error(
      "Request already sent"
    );

  }




  await addDoc(

    collection(
      db,
      "friendRequests"
    ),

    {

      fromUid,

      toUid,

      fromDisplayName,

      toDisplayName,

      status:
        "pending",

      createdAt:
        Date.now(),

    }

  );

}





// Get incoming requests

export async function getFriendRequests(

  uid: string

): Promise<FriendRequest[]> {


  const q = query(

    collection(
      db,
      "friendRequests"
    ),

    where(
      "toUid",
      "==",
      uid
    ),

    where(
      "status",
      "==",
      "pending"
    )

  );



  const snap =
    await getDocs(q);



  return snap.docs.map(

    (d) =>

      ({

        id:d.id,

        ...d.data(),

      } as FriendRequest)

  );

}





// Accept request

export async function acceptFriendRequest(

  request: FriendRequest

) {


  await updateDoc(

    doc(

      db,

      "friendRequests",

      request.id

    ),

    {

      status:
        "accepted",

    }

  );



  await setDoc(

    doc(

      db,

      "users",

      request.fromUid,

      "friends",

      request.toUid

    ),

    {

      uid:
        request.toUid,

      displayName:
        request.toDisplayName,

      addedAt:
        Date.now(),

    }

  );



  await setDoc(

    doc(

      db,

      "users",

      request.toUid,

      "friends",

      request.fromUid

    ),

    {

      uid:
        request.fromUid,

      displayName:
        request.fromDisplayName,

      addedAt:
        Date.now(),

    }

  );

}





// Decline request

export async function declineFriendRequest(

  requestId:string

) {


  await deleteDoc(

    doc(

      db,

      "friendRequests",

      requestId

    )

  );

}





// Get friends list

export async function getFriends(

  uid:string

):Promise<Friend[]> {


  const snap = await getDocs(

    collection(

      db,

      "users",

      uid,

      "friends"

    )

  );



  return snap.docs.map(

    (d) =>

      ({

        uid:d.id,

        ...d.data(),

      } as Friend)

  );

}