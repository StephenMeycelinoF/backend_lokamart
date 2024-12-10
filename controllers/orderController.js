import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import negotiationModel from "../models/negotiationModel.js";
import Stripe from "stripe";

// gateway initalized
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// global variables
const currency = "idr";
const deliveryCharge = 1000;

// Placing orders using COD Method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, {
      cartData: {},
    });

    res.json({ success: true, message: "Pesanan Berhasil Dibuat" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address, negotiationId } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "TRANSFER",
      payment: false,
      date: Date.now(),
      negotiationId,
    };

    if (negotiationId) {
      await negotiationModel.findByIdAndDelete(negotiationId);
    }

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => {
      let itemPrice = item.price;
      const matchedNegotiation = item.negotiation;
      if (matchedNegotiation && matchedNegotiation.status === "accepted") {
        itemPrice = matchedNegotiation.offeredPrice;
      }
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: itemPrice * 100,
        },
        quantity: item.quantity,
      };
    });

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const calculatedAmount = line_items.reduce(
      (sum, item) => sum + item.price_data.unit_amount * item.quantity,
      0
    );

    if (calculatedAmount !== amount * 100) {
      throw new Error("Amount mismatch between FE and BE");
    }

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// verify stripe
const verifyStripe = async (req, res) => {
  const { orderId, success, userId, negotiationId } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });

      if (negotiationId) {
        await negotiationModel.findByIdAndDelete(negotiationId);
      }

      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// All Orders data for admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// User order data for frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// update order status from admin panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, {
      status,
    });

    res.json({ success: true, message: "Status Orderan Berhasil Diperbaruhi" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  verifyStripe,
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
};
