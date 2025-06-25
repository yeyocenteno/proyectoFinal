const admin = require("firebase-admin");
const serviceAccount = require("./clave-firebase.json"); // Asegúrate que esté bien ubicado

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://proyectofinal-f0a0c.firebaseio.com"
});

const db = admin.firestore();

module.exports = { db };
