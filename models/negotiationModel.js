import mongoose from "mongoose";

const negotiationSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
  buyer: { type: String, required: true }, // bisa ID user atau email
  offeredPrice: { type: Number, required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const negotiationModel =
  mongoose.models.Negotiation || mongoose.model("negotiation", negotiationSchema);

export default negotiationModel;
