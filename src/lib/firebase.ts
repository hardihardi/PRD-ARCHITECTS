import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "model-age-scf5x",
  appId: "1:572799937699:web:1e69079c30ebc669142316",
  apiKey: "AIzaSyCXLYp4GaQ4xkyA0qaKXxXn_LXTtXNYujQ",
  authDomain: "model-age-scf5x.firebaseapp.com",
  storageBucket: "model-age-scf5x.firebasestorage.app",
  messagingSenderId: "572799937699",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(
  app,
  "ai-studio-3bbb8583-8026-468f-8b95-a0df8db3fd3f",
);
export const storage = getStorage(app);
