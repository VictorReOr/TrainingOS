import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDImhHhgaCzGRaYyCX0o4qeKNi_HjNt9x8",
  authDomain: "trainingos-login.firebaseapp.com",
  projectId: "trainingos-login",
  storageBucket: "trainingos-login.firebasestorage.app",
  messagingSenderId: "588735908665",
  appId: "1:588735908665:web:70dd8227a073aadf19b6e8",
  measurementId: "G-3329N9X16V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
