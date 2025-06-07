// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmwo_BPHWKRcMvZcRLrx7X6oatL9uxYbc",
  authDomain: "gymmylopez-41b90.firebaseapp.com",
  projectId: "gymmylopez-41b90",
  storageBucket: "gymmylopez-41b90.firebasestorage.app",
  messagingSenderId: "213243730253",
  appId: "1:213243730253:web:7743db0e5e8dce495e3f04",
  measurementId: "G-72XDP7PEBX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
