import mongoose from "mongoose";

const sensorSchema = mongoose.Schema({
  vehiculo_id: String,
  nombre: String,
  valor: String,
  datetime: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Sensores", sensorSchema);
