import express from "express";
import {
  registrar,
  ingresar,
  registrarVehiculo,
  datosVehiculo,
  alternarEstadoVehiculo
} from "../controllers/usuarioController.js";

const router = express.Router();

// Rutas de usuario
router.post("/registrar", registrar);
router.post("/ingresar", ingresar);

// Vehículos
router.post("/registrar-vehiculo", registrarVehiculo);
router.get("/datos-vehiculo/:uid", datosVehiculo);
router.get("/alternar-estado-vehiculo/:uid", alternarEstadoVehiculo);

export default router;
