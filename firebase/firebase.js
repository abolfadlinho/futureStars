import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIfKGeh338JoETfHC1D2BY7DYpbEecLYw",
  authDomain: "recycling2.firebaseapp.com",
  projectId: "recycling2",
  storageBucket: "recycling2.firebasestorage.app",
  messagingSenderId: "473358040161",
  appId: "1:473358040161:web:26bf7ea7530f750cc1be20"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {app, db};