import mongoose from "mongoose";

const usuarioSchema = mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombre: String,
  correo: String
});

export default mongoose.model("Usuario", usuarioSchema);
