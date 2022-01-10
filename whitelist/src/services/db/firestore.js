import { initializeApp, cert, getApps } from "firebase-admin/app";
import serviceAccount from "../../services/db/serviceAccountKey.json";

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://near-ticket-show.firebaseio.com",
    storageBucket: "near-ticket-show.appspot.com",
  });
}
