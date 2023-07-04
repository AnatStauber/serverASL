const mongoose = require("mongoose");
const Joi = require("joi");


const scoreSchema = new mongoose.Schema({
   score:Number,
    date_created: {
        type: Date, default: Date.now()
    },
    user_id:{type:mongoose.ObjectId, default:null}
})
exports.ScoreModel = mongoose.model("scores", scoreSchema)

exports.validateScore = (_reqBody) => {
    let joiSchema = Joi.object({
        score: Joi.number().min(2).max(1000000000).required()
    })
    return joiSchema.validate(_reqBody);
}
