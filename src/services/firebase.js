import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOKDBW0yRVp1xLqNAuGp3xDfuprg8NWW8",
  authDomain: "hire-me-maybe-505d0.firebaseapp.com",
  projectId: "hire-me-maybe-505d0",
  storageBucket: "hire-me-maybe-505d0.appspot.com",
  messagingSenderId: "357079879104",
  appId: "1:357079879104:web:81b7cf7260119851548c25"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);