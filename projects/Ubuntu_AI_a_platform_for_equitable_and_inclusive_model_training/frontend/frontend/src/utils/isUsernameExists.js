import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default async function isUsernameExists(username) {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0;
}