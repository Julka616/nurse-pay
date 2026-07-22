const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const PlannedShift = require("../models/PlannedShift");
const Shift = require("../models/Shift");
const auth = require("../middleware/auth");


// Pobierz zaplanowane dyżury zalogowanego użytkownika
router.get("/", auth, async (req, res) => {

  try {

    const plannedShifts = await PlannedShift.find({
      user: req.user.id
    });

    res.json(plannedShifts);

  } catch (error) {

    console.error(
      "Błąd pobierania zaplanowanych dyżurów:",
      error
    );

    res.status(500).json({
      message: "Nie udało się pobrać zaplanowanych dyżurów."
    });

  }

});


// Zaplanuj nowy dyżur
router.post("/", auth, async (req, res) => {

  try {

    const plannedShift = new PlannedShift({
      ...req.body,
      user: req.user.id
    });

    await plannedShift.save();

    res.status(201).json(plannedShift);

  } catch (error) {

    console.error(
      "Błąd dodawania zaplanowanego dyżuru:",
      error
    );

    res.status(500).json({
      message: "Nie udało się zaplanować dyżuru."
    });

  }

});


// Oznacz zaplanowany dyżur jako wykonany
// (aktualizuje PlannedShift oraz tworzy odpowiadający wpis w Shift, żeby liczył się do wypłaty)
router.patch("/:id/complete", auth, async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {

      return res.status(400).json({
        message: "Nieprawidłowy identyfikator dyżuru."
      });

    }

    const plannedShift = await PlannedShift.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id
      },
      {
        $set: {
          completed: true
        }
      },
      {
        new: true
      }
    );

    if (!plannedShift) {

      return res.status(404).json({
        message: "Nie znaleziono zaplanowanego dyżuru."
      });

    }

    // Sprawdź czy odpowiadający wpis w historii (Shift) już istnieje
    const existingShift = await Shift.findOne({
      user: req.user.id,
      date: plannedShift.date,
      type: plannedShift.type
    });

    let shift = existingShift;

    if (!shift) {

      shift = new Shift({

        user: req.user.id,
        date: plannedShift.date,
        type: plannedShift.type,
        holiday: plannedShift.holiday,
        weekend: plannedShift.weekend,
        hours: plannedShift.hours,
        completed: true

      });

      await shift.save();

    }

    res.json({
      plannedShift,
      shift
    });

  } catch (error) {

    console.error(
      "Błąd oznaczania dyżuru jako wykonanego:",
      error
    );

    res.status(500).json({
      message: "Nie udało się oznaczyć dyżuru jako wykonanego."
    });

  }

});


// Usuń zaplanowany dyżur (usuwa też odpowiadający wpis w historii, jeśli istnieje)
router.delete("/:id", auth, async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {

      return res.status(400).json({
        message: "Nieprawidłowy identyfikator dyżuru."
      });

    }

    const deletedPlannedShift =
      await PlannedShift.findOneAndDelete({
        _id: id,
        user: req.user.id
      });

    if (!deletedPlannedShift) {

      return res.status(404).json({
        message: "Nie znaleziono zaplanowanego dyżuru."
      });

    }

    await Shift.findOneAndDelete({
      user: req.user.id,
      date: deletedPlannedShift.date,
      type: deletedPlannedShift.type
    });

    res.json({
      message: "Zaplanowany dyżur został usunięty.",
      deletedPlannedShift
    });

  } catch (error) {

    console.error(
      "Błąd usuwania zaplanowanego dyżuru:",
      error
    );

    res.status(500).json({
      message: "Nie udało się usunąć zaplanowanego dyżuru."
    });

  }

});


module.exports = router;