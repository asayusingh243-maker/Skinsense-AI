const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const COOKIE_NAME = "skinsense_token";

const normalizeEmail = (email = "") =>
  email.trim().toLowerCase();

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

const createToken = (userId, rememberMe) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from the .env file.");
  }

  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberMe ? "30d" : "1d",
    }
  );
};

const getCookieOptions = (rememberMe = false) => {
  const isProduction =
    process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  /*
    With Remember Me:
    The cookie remains for 30 days.

    Without Remember Me:
    No maxAge is supplied, so it becomes a session cookie
    and normally disappears when the browser session ends.
  */
  if (rememberMe) {
    options.maxAge =
      30 * 24 * 60 * 60 * 1000;
  }

  return options;
};

// ================= REGISTER =================

exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const trimmedName =
      typeof name === "string" ? name.trim() : "";

    const normalizedEmail = normalizeEmail(email);

    if (
      !trimmedName ||
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });
    }

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain at least 2 characters.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. You can now log in.",
      user: formatUser(user),
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error.message
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Registration failed. Please try again.",
    });
  }
};

// ================= LOGIN =================

exports.loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
      rememberMe = false,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const shouldRemember =
      rememberMe === true ||
      rememberMe === "true";

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const token = createToken(
      user._id,
      shouldRemember
    );

    res.cookie(
      COOKIE_NAME,
      token,
      getCookieOptions(shouldRemember)
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      rememberMe: shouldRemember,
      user: formatUser(user),
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Login failed. Please try again.",
    });
  }
};

// ================= CHECK LOGIN =================

exports.getCurrentUser = async (req, res) => {
  try {
    const token =
      req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: "You are not logged in.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.id
    );

    if (!user) {
      res.clearCookie(
        COOKIE_NAME,
        getCookieOptions(false)
      );

      return res.status(401).json({
        success: false,
        authenticated: false,
        message: "User account was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      authenticated: true,
      user: formatUser(user),
    });
  } catch (error) {
    res.clearCookie(
      COOKIE_NAME,
      getCookieOptions(false)
    );

    return res.status(401).json({
      success: false,
      authenticated: false,
      message:
        "Your login session has expired. Please log in again.",
    });
  }
};

// ================= LOGOUT =================

exports.logoutUser = async (req, res) => {
  res.clearCookie(
    COOKIE_NAME,
    getCookieOptions(false)
  );

  return res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
};