const mongoose = require("mongoose");

const plannedShiftSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    date:{
        type:String,
        required:true
    },

    type:{
        type:String,
        enum:["day","night","vacation"],
        required:true
    },

    holiday:{
        type:Boolean,
        default:false
    },

    weekend:{
        type:Boolean,
        default:false
    },

    completed:{
        type:Boolean,
        default:false
    },

    hours:{
        type:Number,
        default:12
    }

},{
    timestamps:true
});

module.exports = mongoose.model("PlannedShift", plannedShiftSchema);