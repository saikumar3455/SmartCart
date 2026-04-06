import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

/* SIGNUP */
router.post("/signup", async (req, res) => {
  try {
    console.log("SIGNUP ROUTE HIT ✅");
    console.log("BODY:", req.body);

    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    console.log("EXISTING USER:", existing);

    if (existing) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("HASHED PASSWORD READY ✅");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("USER SAVED TO ATLAS ✅", user);

    return res.status(201).json({
      message: "Signup successful",
      user,
    });
  } catch (error) {
    console.error("SIGNUP ERROR ❌", error);
    return res.status(500).json({
      message: error.message,
    });
  }
});
/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    console.log("LOGIN ROUTE HIT ✅");
    console.log(req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR ❌", error);
    return res.status(500).json({
      message: error.message,
    });
  }
});

export default router;