const express = require("express");
const session = require("express-session");
const router = express.Router();
const HitnTrial = require("../modal/userSchema");
const Session = require("../modal/Session");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const crypto = require("crypto");
require("../db/connect");
const { validationResult, check } = require("express-validator");
router.use(cors());

// SIgnup Route

const validateRegistration = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Valid email is required"),
  // Remove the phone number validation
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("confirmpassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

router.post("/register", validateRegistration, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, password, confirmpassword } = req.body;

  try {
    const userExist = await HitnTrial.findOne({ email });

    if (userExist) {
      return res.status(422).json({ error: "Email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = Math.floor(1000 + Math.random() * 9000);

    const user = new HitnTrial({
      name,
      email,
      password: hashedPassword,
      confirmpassword,
      userId,
    });

    await user.save();
    console.log("User saved successfully.");

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Failed to save user to the database",
        details: error.message,
      });
  }
});

// Login Route

// Validation middleware using express-validator
const validateLogin = [
  check("email").isEmail().withMessage("Valid email is required"),
  check("password").notEmpty().withMessage("Password is required"),
];

router.post("/login", validateLogin, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await HitnTrial.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please register first." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const existingSession = await Session.findOne({
      userId: user.userId,
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(24, 0, 0, 0),
      },
    });

    let sessionId;
    let sessionExpiration;

    if (existingSession) {
      sessionId = existingSession.sessionId;
      sessionExpiration = existingSession.sessionExpiration;
    } else {
      sessionId = generateUniqueId();
      sessionExpiration = new Date(Date.now() + 12 * 60 * 60 * 1000);

      const newSession = new Session({
        userId: user.userId,
        sessionId,
        sessionExpiration,
        email: user.email,
        date: new Date(),
      });
      await newSession.save();
    }

    res.status(200).json({
      message: "Login successful",
      email: user.email,
      userId: user.userId,
      sessionId,
      sessionExpiration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return timestamp + randomPart;
}

const secretKey = crypto.randomBytes(32).toString("hex");

module.exports = router;
