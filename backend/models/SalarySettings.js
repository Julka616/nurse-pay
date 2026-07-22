const mongoose = require("mongoose");

const salarySettingsSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },

    basicSalary:{
        type:Number,
        default:0
    },

    hourRate:{
        type:Number,
        default:0
    },

    nightPercent:{
        type:Number,
        default:0
    },

    saturdayPercent:{
        type:Number,
        default:0
    },

    sundayPercent:{
        type:Number,
        default:0
    },

    holidayPercent:{
        type:Number,
        default:0
    }

},{
    timestamps:true
});

module.exports = mongoose.model("SalarySettings", salarySettingsSchema);