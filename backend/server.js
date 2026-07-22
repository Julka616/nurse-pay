const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const shiftRoutes = require("./routes/shifts");
const salarySettingsRoutes = require("./routes/salarySettings");
const plannedShiftRoutes = require("./routes/plannedShifts");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// MongoDB
mongoose.connect(process.env.MONGO_URI, {
    tls: true,
    serverSelectionTimeoutMS: 30000
})
.then(() => {

    console.log("MongoDB connected ✅");

})
.catch((err) => {

    console.log(
        "MongoDB error:",
        err.message
    );

});


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/salary-settings", salarySettingsRoutes);
app.use("/api/planned-shifts", plannedShiftRoutes);


// Test API
app.get("/", (req, res) => {

    res.send("Nurse Pay API działa 🚀");

});


// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server działa na porcie ${PORT}`
    );

});