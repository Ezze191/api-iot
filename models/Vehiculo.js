import mongoose from "mongoose";

const vehiculoSchema = mongoose.Schema({
  _id: String,           // uid
  usuario_id: String,
  marca: String,
  modelo: String,
  año: Number,
  estado: String
});

export default mongoose.model("Vehiculo", vehiculoSchema);
