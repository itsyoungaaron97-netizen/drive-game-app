import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";


import {
  db,
} from "./firebase";


import {
  CommunityPost,
  Comment,
} from "../types";




// Create community post

export async function createCommunityPost(

  post: Omit<CommunityPost,"id">

) {


  const ref = await addDoc(

    collection(
      db,
      "communityPosts"
    ),

    {

      ...post,

      createdAt:
        serverTimestamp(),

      likes:
        0,

    }

  );


  return ref.id;

}






// Get latest posts

export async function getCommunityPosts(

  max:number = 50

):Promise<CommunityPost[]> {


  const q = query(

    collection(
      db,
      "communityPosts"
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

    } as CommunityPost)

  );


}







// Add comment

export async function addComment(

  comment: Omit<Comment,"id">

) {


  const ref = await addDoc(

    collection(
      db,
      "comments"
    ),

    {

      ...comment,

      createdAt:
        serverTimestamp(),

    }

  );


  return ref.id;

}