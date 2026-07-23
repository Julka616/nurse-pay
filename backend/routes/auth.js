const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");

const router = express.Router();

// Konfiguracja wysyłki maili (np. Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // "Hasło aplikacji" wygenerowane w Google
  },
});

// Rejestracja
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Użytkownik już istnieje." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "Konto utworzone pomyślnie." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera." });
  }
});

// Logowanie
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Nieprawidłowy email lub hasło." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Nieprawidłowy email lub hasło." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera." });
  }
});

// Zmiana hasła dla zalogowanego użytkownika (w Profilu)
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Aktualne hasło jest nieprawidłowe." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Hasło zostało pomyślnie zmienione." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera podczas zmiany hasła." });
  }
});

// 1. WYSYŁANIE LINKU RESETUJĄCEGO NA E-MAIL
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika z tym adresem email." });
    }

    // Generujemy losowy unikalny token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Zapisujemy token i czas wygaśnięcia (1 godzina)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Link prowadzący do formularza ustawiania nowego hasła na frontendzie
    const clientUrl = process.env.CLIENT_URL || "https://nurse-pay.vercel.app";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"NursePay" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🔑 Resetowanie hasła - NursePay",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0284c7;">Cześć ${user.firstName}!</h2>
          <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w aplikacji NursePay.</p>
          <p>Kliknij w poniższy przycisk, aby ustawić nowe hasło. Link jest ważny przez 1 godzinę:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Zresetuj hasło
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b;">
            Jeśli to nie Ty prosiłeś/aś o zmianę hasła, zignoruj tę wiadomość.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Link do resetowania hasła został wysłany na Twój e-mail!" });
  } catch (err) {
    console.error("Błąd wysyłania e-maila:", err);
    res.status(500).json({ message: "Błąd podczas wysyłania wiadomości e-mail." });
  }
});

// 2. USTAWIANIE NOWEGO HASŁA Z LINKU (Z TOKENEM)
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Token musi być wciąż ważny
    });

    if (!user) {
      return res.status(400).json({ message: "Link jest nieprawidłowy lub wygasł." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Hasło zostało pomyślnie zmienione! Możesz się zalogować." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera podczas resetowania hasła." });
  }
});

module.exports = router;