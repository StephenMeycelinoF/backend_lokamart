import express from "express";

import {
  allOrders,
  placeOrder,
  placeOrderStripe,
  updateStatus,
  userOrders,
  verifyStripe,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminauth.js";
import userAuth from "../middleware/auth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

// Payment features
orderRouter.post("/place", userAuth, placeOrder);
orderRouter.post("/stripe", userAuth, placeOrderStripe);

// User features
orderRouter.post("/userorders", userAuth, userOrders);

// verify payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);

export default orderRouter;
