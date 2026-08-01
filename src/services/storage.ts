import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  app,
} from "./firebase";



const storage = getStorage(app);




// Upload image file

export async function uploadImage(
  uri: string,
  path: string
) {


  const response =
    await fetch(uri);


  const blob =
    await response.blob();



  const storageRef =
    ref(
      storage,
      path
    );



  await uploadBytes(
    storageRef,
    blob
  );



  return getDownloadURL(
    storageRef
  );

}