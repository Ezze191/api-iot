import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const vehiculoSchema = mongoose.Schema({
  _id: String, // uid generado por ti
  usuario_id: { type: ObjectId, ref: "Usuario", required: true },
  marca: String,
  modelo: String,
  año: Number,
  estado: { type: String, default: "finalizado" }
});

export default mongoose.model("Vehiculo", vehiculoSchema);
