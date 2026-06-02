const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = "24h";

const generateToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        message: "nombre, email y password son requeridos",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        message: "El email ya está registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      nombre,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);
    const safeUser = await User.findById(user._id).select("-password");

    return res.status(201).json({
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al registrar usuario",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email y password son requeridos",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: "Credenciales incorrectas",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Credenciales incorrectas",
      });
    }

    const token = generateToken(user);
    const safeUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al iniciar sesión",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener el perfil del usuario",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
