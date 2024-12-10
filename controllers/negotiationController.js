import negotiationModel from "../models/negotiationModel.js";
import productModel from "../models/productModel.js";
import jwt from "jsonwebtoken";

export const createNegotiation = async (req, res) => {
  const { productId, offeredPrice } = req.body;
  const buyer = req.body.userId;

  try {
    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const negotiation = await negotiationModel.create({
      product: productId,
      buyer,
      offeredPrice,
    });

    res.json({ success: true, data: negotiation });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getNegotiationsByUser = async (req, res) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token not provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const isAdmin =
      decodedToken === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;

    let negotiations;

    if (isAdmin) {
      negotiations = await negotiationModel.find().populate("product");
    } else {
      negotiations = await negotiationModel
        .find({ buyer: decodedToken.id })
        .populate("product");
    }

    if (!negotiations || negotiations.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No negotiations found" });
    }

    res.status(200).json({ success: true, data: negotiations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNegotiationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const negotiation = await negotiationModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!negotiation)
      return res
        .status(404)
        .json({ success: false, message: "Negotiation not found" });

    res.json({ success: true, data: negotiation });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
