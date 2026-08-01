import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";


import {
  db,
} from "./firebase";


import {
  Message,
} from "../types";





// Send message

export async function sendMessage(

  message: Omit<Message,"id">

) {


  const ref = await addDoc(

    collection(
      db,
      "messages"
    ),

    {

      ...message,

      createdAt:
        serverTimestamp(),

      read:
        false,

    }

  );


  return ref.id;

}







// Get conversation messages

export async function getMessages(

  userId:string,

  otherUserId:string

):Promise<Message[]> {


  const q = query(

    collection(
      db,
      "messages"
    ),

    where(
      "senderId",
      "in",
      [
        userId,
        otherUserId
      ]
    ),

    where(
      "receiverId",
      "in",
      [
        userId,
        otherUserId
      ]
    ),

    orderBy(
      "createdAt",
      "asc"
    )

  );



  const snap =
    await getDocs(q);



  return snap.docs.map(

    doc =>

    ({

      id:doc.id,

      ...doc.data(),

    } as Message)

  );

}