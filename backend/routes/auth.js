const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware"); // Twój middleware sprawdzający JWT

const router = express.Router();

// Rejestracja
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Użytkownik już istnieje."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "Konto utworzone pomyślnie."
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Błąd serwera."
    });
  }
});

// Logowanie
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Nieprawidłowy email lub hasło."
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        message: "Nieprawidłowy email lub hasło."
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Błąd serwera."
    });
  }
});

// Zmiana hasła dla zalogowanego użytkownika (w zakładce Profil)
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Aktualne hasło jest nieprawidłowe." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Hasło zostało pomyślnie zmienione." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Błąd serwera podczas zmiany hasła." });
  }
});

// Reset zapomnianego hasła (z ekranu logowania)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika z tym adresem email." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Hasło zostało zresetowane. Możesz się zalogować." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Błąd serwera podczas resetowania hasła." });
  }
});

module.exports = router;