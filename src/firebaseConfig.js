import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/database'; 
import 'firebase/compat/storage';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyCtmAj7m8Lg4oyOazOBfKSE4e8C82-uEes",
    authDomain: "opensecurityroom.firebaseapp.com",
    databaseURL: "https://opensecurityroom-default-rtdb.firebaseio.com",
    projectId: "opensecurityroom",
    storageBucket: "opensecurityroom.appspot.com",
    messagingSenderId: "100768688093",
    appId: "1:100768688093:web:39e42da6d5e35258acb834"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore(); 
export const auth = firebase.auth();  
export const database = firebase.database(); 
export const storage = firebase.storage(); 
export const messaging = getMessaging(firebase.app());
