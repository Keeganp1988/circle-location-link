import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs, FirestoreError } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const joinCircleWithCode = async (code: string, userId: string) => {
  try {
    console.log('Attempting to join circle with code:', code);
    console.log('Current user ID:', userId);
    
    const circlesRef = collection(db, "circles");
    const q = query(circlesRef, where("inviteCode", "==", code));
    console.log('Executing query for invite code:', code);
    
    const querySnapshot = await getDocs(q);
    console.log('Query completed, empty?', querySnapshot.empty);

    if (querySnapshot.empty) {
      console.log('No circle found with invite code:', code);
      return { success: false, message: "Invalid invite code" };
    }

    const circleDoc = querySnapshot.docs[0];
    const data = circleDoc.data();
    const members = data.members || [];
    
    console.log('Found circle:', {
      id: circleDoc.id,
      name: data.name,
      currentMembers: members,
      inviteCode: data.inviteCode
    });
    
    if (members.includes(userId)) {
      console.log('User already a member:', userId);
      return { success: false, message: "You are already a member of this circle" };
    }

    console.log('Adding user to circle:', userId);
    const circleRef = doc(db, "circles", circleDoc.id);
    console.log('Circle reference:', circleRef.path);
    
    await updateDoc(circleRef, {
      members: arrayUnion(userId),
    });

    console.log('Successfully joined circle');
    return { success: true };
  } catch (error) {
    console.error("Error joining circle:", error);
    if (error instanceof FirestoreError) {
      console.error("Firestore error details:", {
        code: error.code,
        message: error.message,
        name: error.name
      });
      if (error.code === 'permission-denied') {
        return { success: false, message: "Permission denied. Please check your security rules." };
      }
    }
    return { success: false, message: "Something went wrong" };
  }
};
