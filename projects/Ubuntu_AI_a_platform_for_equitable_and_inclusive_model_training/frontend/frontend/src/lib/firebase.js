// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { apiKey } from "../../keys";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: apiKey,
    // authDomain: "react-blog-b4ada.firebaseapp.com",
    projectId: "react-blog-b4ada",
    storageBucket: "react-blog-b4ada.appspot.com",
    messagingSenderId: "570365255686",
    appId: "1:570365255686:web:f32cfca9d6dd120dfba387"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = null;
export const storage = getStorage(app)