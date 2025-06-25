const express = require("express");
const cors = require("cors");
const { db } = require("./firebaseConfig");

const app = express();
app.use(cors());

app.get("/api/suscripcion/:uid", async (req, res) => {
  const uid = req.params.uid;
  try {
    const snapshot = await db.collection("suscripciones").where("uid", "==", uid).get();
    if (snapshot.empty) return res.status(404).json({ error: "No encontrado" });

    const data = snapshot.docs[0].data();
    res.json({
      nombre: data.nombre,
      plan: data.plan,
      fecha: data.fechaInicio
    });
  } catch (e) {
    res.status(500).json({ error: "Error al obtener datos" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
