import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const joinCircleWithCode = async (code: string, userId: string) => {
  try {
    const circleRef = doc(db, "circles", code);
    const circleSnap = await getDoc(circleRef);

    if (!circleSnap.exists()) {
      return { success: false, message: "Invalid invite code" };
    }

    await updateDoc(circleRef, {
      members: arrayUnion(userId),
    });

    return { success: true };
  } catch (error) {
    console.error("Error joining circle:", error);
    return { success: false, message: "Something went wrong" };
  }
};
