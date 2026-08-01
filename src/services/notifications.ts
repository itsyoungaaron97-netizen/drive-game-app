import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "./firebase";


export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
}



// Create notification

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string
) {

  await addDoc(
    collection(db, "notifications"),
    {
      userId,
      type,
      title,
      message,
      read:false,
      createdAt:Date.now(),
    }
  );

}





// Get user notifications

export async function getNotifications(
  userId:string
):Promise<NotificationItem[]> {


  const q = query(

    collection(db,"notifications"),

    where(
      "userId",
      "==",
      userId
    ),

    orderBy(
      "createdAt",
      "desc"
    )

  );


  const snap =
    await getDocs(q);



  return snap.docs.map(

    d => ({

      id:d.id,

      ...d.data(),

    } as NotificationItem)

  );

}





// Mark as read

export async function markNotificationRead(
  id:string
){

  await updateDoc(

    doc(
      db,
      "notifications",
      id
    ),

    {
      read:true,
    }

  );

}