import express from "express";
import {
  createNegotiation,
  getNegotiationsByUser,
  updateNegotiationStatus,
} from "../controllers/negotiationController.js";
import authUser from "../middleware/auth.js";
import adminAuth from "../middleware/adminauth.js";

const negotiationRouter = express.Router();

// Create negotiation (user authorized by authUser)
negotiationRouter.post("/", authUser, createNegotiation);

// Get all negotiations (only accessible by admin)
negotiationRouter.get("/", authUser, getNegotiationsByUser);

// Update negotiation status (only accessible by admin)
negotiationRouter.put("/:id", adminAuth, updateNegotiationStatus);

export default negotiationRouter;
