import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usuarioRoutes from "./routes/usuario.js";
import conectarDB from "./config/db.js";

dotenv.config();
conectarDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/usuario", usuarioRoutes);

app.listen(80, () => {
  console.log("API corriendo en http://localhost:80");
});
