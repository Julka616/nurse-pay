const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Shift = require("../models/Shift");
const auth = require("../middleware/auth");
const PlannedShift = require("../models/PlannedShift");


// Pobierz dyżury
router.get("/", auth, async (req, res) => {

  try {

    const shifts = await Shift.find({
      user: req.user.id
    }).sort({
      date: -1
    });

    res.json(shifts);

  } catch (error) {

    console.error(
      "Błąd pobierania dyżurów:",
      error
    );

    res.status(500).json({
      message: "Nie udało się pobrać dyżurów."
    });

  }

});


// Dodaj dyżur
router.post("/", auth, async (req, res) => {

  try {

    const shift = new Shift({
      ...req.body,
      user: req.user.id
    });

    await shift.save();

    res.status(201).json(shift);

  } catch (error) {

    console.error(
      "Błąd dodawania dyżuru:",
      error
    );

    res.status(500).json({
      message: "Nie udało się dodać dyżuru."
    });

  }

});


// Aktualizuj dyżur
router.patch("/:id", auth, async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {

      return res.status(400).json({
        message: "Nieprawidłowy identyfikator dyżuru."
      });

    }

    const shift = await Shift.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id
      },
      {
        $set: req.body
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!shift) {

      return res.status(404).json({
        message: "Nie znaleziono dyżuru."
      });

    }

    res.json(shift);

  } catch (error) {

    console.error(
      "Błąd aktualizacji dyżuru:",
      error
    );

    res.status(500).json({
      message: "Nie udało się zaktualizować dyżuru."
    });

  }

});


// Usuń dyżur
router.delete("/:id", auth, async (req, res) => {

  try {

    const { id } = req.params;

    console.log(
      "DELETE /api/shifts/:id",
      id
    );

    if (!mongoose.Types.ObjectId.isValid(id)) {

      return res.status(400).json({
        message: "Nieprawidłowy identyfikator dyżuru."
      });

    }

    const deletedShift =
      await Shift.findOneAndDelete({
        _id: id,
        user: req.user.id
      });

    if (!deletedShift) {

      return res.status(404).json({
        message: "Nie znaleziono dyżuru."
      });

    }

    // Usuń też odpowiadający zaplanowany dyżur w Kalendarzu (jeśli istnieje),
    // żeby Historia i Kalendarz zawsze były zsynchronizowane
    await PlannedShift.findOneAndDelete({
      user: req.user.id,
      date: deletedShift.date,
      type: deletedShift.type
    });

    res.json({
      message: "Dyżur został usunięty.",
      deletedShift
    });

  } catch (error) {

    console.error(
      "Błąd usuwania dyżuru:",
      error
    );

    res.status(500).json({
      message: "Nie udało się usunąć dyżuru."
    });

  }

});


module.exports = router;