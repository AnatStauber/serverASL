const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const {config} = require("../config/secret")




const userSchema = new mongoose.Schema({
    fullName: {
        firstName: String,
        lastName: String
    },
    email: String,
    password: String,
    img: String,
    active: {
        type: Boolean, default: true
    },

    date_created: {
        type: Date, default: Date.now()
    },
    role: {
        type: String, default: "user"
    }
})
exports.UserModel = mongoose.model("users", userSchema)

exports.UserValid = (_bodyValid) => {
    let joiSchema = Joi.object({
        fullName: {
            firstName: Joi.string().min(2).max(50).required(),
            lastName: Joi.string().min(2).max(50).required(),
        },
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().min(3).max(99).required(),
        img: Joi.string().min(2).max(150)
    })
    return joiSchema.validate(_bodyValid);
}

exports.createToken = (_id, role) => {
    let token = jwt.sign({ _id, role }, config.tokenSecret, { expiresIn: "60mins" });
    return token;
}

exports.validLogin = (_reqBody) => {
    let joiSchema = Joi.object({
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().min(3).max(99).required()
    })

    return joiSchema.validate(_reqBody);
}