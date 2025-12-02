import mongoose from "mongoose";

const TarjetaSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true
    },
    numeros: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["libre", "usado"],
      default: "libre"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Tarjeta", TarjetaSchema);
