const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// Rejestracja
router.post("/register", async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            email,
            password
        } = req.body;

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

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

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

module.exports = router;