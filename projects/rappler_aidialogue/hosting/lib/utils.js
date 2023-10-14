import { serverTimestamp, setDoc, doc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";

export const getRandomInt = (max) =>
  Math.floor(Math.random() * Math.floor(max));

export const toSentenceCase = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const updateUserStatus = async (uid, status) => {
  await setDoc(
    doc(collection(db, "users"), uid),
    {
      lastactive: serverTimestamp(),
      status,
    },
    { merge: true }
  );
};

export const isValidEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};
