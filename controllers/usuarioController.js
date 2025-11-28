import Usuario from "../models/Usuario.js";
import Vehiculo from "../models/Vehiculo.js";
import Sensor from "../models/Sensor.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// POST usuario/registrar
export async function registrar(req, res) {
  const { usuario, password, nombre, correo } = req.body;

  const existe = await Usuario.findOne({ usuario });
  if (existe) return res.status(400).json({ msg: "Usuario ya existe" });

  const hash = await bcrypt.hash(password, 10);

  const nuevo = await Usuario.create({
    usuario,
    password: hash,
    nombre,
    correo
  });

  res.json(nuevo);
}

// POST usuario/ingresar
export async function ingresar(req, res) {
  const { usuario, password } = req.body;

  const user = await Usuario.findOne({ usuario });
  if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ msg: "Contraseña incorrecta" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ token, user });
}

// POST usuario/registrar-vehiculo
export async function registrarVehiculo(req, res) {
  const { uid, usuario_id, marca, modelo, año, estado } = req.body;

  const vehiculo = await Vehiculo.create({
    _id: uid,
    usuario_id,
    marca,
    modelo,
    año,
    estado
  });

  res.json(vehiculo);
}

// GET usuario/datos-vehiculo/:uid /69291174eb210b13b0d4d6a2
export async function datosVehiculo(req, res) {
  const { uid } = req.params;

  const vehiculo = await Vehiculo.findOne({ _id: uid });
  if (!vehiculo) return res.status(404).json({ msg: "Vehículo no existe" });

  const sensores = await Sensor.aggregate([
    { $match: { vehiculo_id: uid }}, // filtro por vehículo
    { $sort: { fecha_fin: -1 }}, // mas reciente
    {
      $group: {
        _id: "$nombre",
        ultimo: { $first: "$$ROOT" }//documento mas reciente
      }
    }
  ]);

  res.json({
    vehiculo,
    sensores: sensores.map(s => s.ultimo)
  });
}



// GET usuario/vehiculos/:usuario_id
export async function vehiculosPorUsuario(req, res) {
  try {
    const { usuario_id } = req.params;

    const vehiculos = await Vehiculo.find(
      { usuario_id },
      "_id marca modelo estado"
    );

    if (vehiculos.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontraron vehículos"
      });
    }

    res.json(vehiculos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
}


// POST usuario/alternar-estado-vehiculo/:uid
export async function alternarEstadoVehiculo(req, res) {
  const { uid } = req.body;
  const vehiculo = await Vehiculo.findById(uid);

  if (!vehiculo) {
    return res.status(404).json({ msg: "Vehículo no encontrado" });
  }

  const nuevoEstado = vehiculo.estado === "iniciado"
    ? "finalizado"
    : "iniciado";

  await Vehiculo.updateOne(
    { _id: uid },
    { $set: { estado: nuevoEstado } }
  );

  res.json({
    msg: `Estado actualizado a '${nuevoEstado}'`,
    estado: nuevoEstado
  });
}

