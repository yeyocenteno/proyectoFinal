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

app.get("/api/estadisticas/planes", async (req, res) => {
  try {
    const snapshot = await db.collection("suscripciones").get();
    const conteoPlanes = {};

    snapshot.forEach(doc => {
      const plan = doc.data().plan;
      if (plan) {
        conteoPlanes[plan] = (conteoPlanes[plan] || 0) + 1;
      }
    });

    res.json(conteoPlanes); // ejemplo: { Básico: 3, Intermedio: 5, Avanzado: 2 }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estadísticas." });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
