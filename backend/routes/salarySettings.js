const express = require("express");
const router = express.Router();

const SalarySettings = require("../models/SalarySettings");
const auth = require("../middleware/auth");


// Pobierz ustawienia wynagrodzenia zalogowanego użytkownika
router.get("/", auth, async (req, res) => {

  try {

    let settings = await SalarySettings.findOne({
      user: req.user.id
    });

    // Jeśli użytkownik jeszcze nie ma ustawień, zwróć wartości domyślne
    if (!settings) {

      settings = {

        basicSalary: 0,
        hourRate: 0,
        nightPercent: 0,
        saturdayPercent: 0,
        sundayPercent: 0,
        holidayPercent: 0

      };

    }

    res.json(settings);

  } catch (error) {

    console.error(
      "Błąd pobierania ustawień wynagrodzenia:",
      error
    );

    res.status(500).json({
      message: "Nie udało się pobrać ustawień wynagrodzenia."
    });

  }

});


// Zapisz / zaktualizuj ustawienia wynagrodzenia (upsert)
router.put("/", auth, async (req, res) => {

  try {

    const {
      basicSalary,
      hourRate,
      nightPercent,
      saturdayPercent,
      sundayPercent,
      holidayPercent
    } = req.body;

    const settings = await SalarySettings.findOneAndUpdate(
      {
        user: req.user.id
      },
      {
        $set: {
          basicSalary,
          hourRate,
          nightPercent,
          saturdayPercent,
          sundayPercent,
          holidayPercent
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json(settings);

  } catch (error) {

    console.error(
      "Błąd zapisywania ustawień wynagrodzenia:",
      error
    );

    res.status(500).json({
      message: "Nie udało się zapisać ustawień wynagrodzenia."
    });

  }

});


module.exports = router;