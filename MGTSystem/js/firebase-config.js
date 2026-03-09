import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyCzuWj9YZdBQGIIn8C10TKpMmTN1hkxEgk",
    authDomain: "tmvc-e-office.firebaseapp.com",
    projectId: "tmvc-e-office",
    storageBucket: "tmvc-e-office.firebasestorage.app",
    messagingSenderId: "185843947175",
    appId: "1:185843947175:web:56e3ad304debde55512d82",
    measurementId: "G-EDK980H19E"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage };
