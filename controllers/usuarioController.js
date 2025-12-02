import Usuario from "../models/Usuario.js";
import Vehiculo from "../models/Vehiculo.js";
import Tarjeta from "../models/Tarjeta.js";
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
  try {
    const { _id, usuario_id, marca, modelo, año, estado } = req.body;

    // 1. Buscar tarjeta donde el campo "numeros" sea igual al _id enviado
    const tarjeta = await Tarjeta.findOne({ numeros: String(_id) });

    if (!tarjeta) {
      return res.status(404).json({
        ok: false,
        msg: "No existe una tarjeta con ese número"
      });
    }

    // 2. Verificar que la tarjeta esté libre
    if (tarjeta.status !== "libre") {
      return res.status(400).json({
        ok: false,
        msg: "La tarjeta ya está en uso"
      });
    }

    // 3. Reemplazar el _id del vehículo por el UID real de la tarjeta
    const nuevoIdVehiculo = tarjeta.uid; // <-- este será el _id verdadero

    // 4. Crear el vehículo usando el UID de la tarjeta
    const vehiculo = await Vehiculo.create({
      _id: nuevoIdVehiculo,
      usuario_id,
      marca,
      modelo,
      año,
      estado
    });

    // 5. Actualizar tarjeta a "usado"
    tarjeta.status = "usado";
    await tarjeta.save();

    res.json({
      ok: true,
      msg: "Vehículo registrado correctamente",
      vehiculo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
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

